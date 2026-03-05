import { useMutation } from "@tanstack/react-query";
import { BlossomUploader } from '@nostrify/nostrify/uploaders';

import { useCurrentUser } from "./useCurrentUser";

// All Blossom servers to upload to simultaneously.
// Files are mirrored across every server so they're always available
// regardless of which relay / client the viewer uses.
const BLOSSOM_SERVERS = [
  'https://blossom.nostr.build/',   // Primary — shows in nostr.build creator dashboard
  'https://blossom.primal.net/',    // Primal — files visible in Primal app
  'https://cdn.satellite.earth/',   // Satellite CDN
  'https://blossom.nostr.hu/',      // Community server
];

export function useUploadFile() {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('Must be logged in to upload files');
      }

      console.log('📤 Starting multi-server Blossom upload:', {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type,
        servers: BLOSSOM_SERVERS.length,
      });

      // Upload to all servers in parallel.
      // Each upload is independent — a failure on one server doesn't block the others.
      const uploadResults = await Promise.allSettled(
        BLOSSOM_SERVERS.map(async (server) => {
          const uploader = new BlossomUploader({
            servers: [server],
            signer: user.signer,
          });

          const uploadPromise = uploader.upload(file);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout after 5 minutes')), 5 * 60 * 1000)
          );

          const tags = await Promise.race([uploadPromise, timeoutPromise]);
          console.log(`✅ Uploaded to ${server}`);
          return { server, tags };
        })
      );

      // Separate successes from failures
      const successes = uploadResults
        .filter((r): r is PromiseFulfilledResult<{ server: string; tags: string[][] }> => r.status === 'fulfilled')
        .map(r => r.value);

      const failures = uploadResults
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r, i) => ({ server: BLOSSOM_SERVERS[i], reason: r.reason }));

      failures.forEach(({ server, reason }) => {
        console.warn(`⚠️ Upload failed to ${server}:`, reason);
      });

      console.log(`📊 Upload complete: ${successes.length}/${BLOSSOM_SERVERS.length} servers succeeded`, {
        succeeded: successes.map(s => s.server),
        failed: failures.map(f => f.server),
      });

      // If no server succeeded, throw the last error
      if (successes.length === 0) {
        const lastFailure = failures[failures.length - 1];
        throw lastFailure?.reason instanceof Error
          ? lastFailure.reason
          : new Error('All Blossom upload servers failed');
      }

      // Return the tags from the first successful upload.
      // The URL in these tags is the canonical URL for this file.
      return successes[0].tags;
    },
  });
}
