import { useMutation } from "@tanstack/react-query";
import { BlossomUploader } from '@nostrify/nostrify/uploaders';

import { useCurrentUser } from "./useCurrentUser";

export function useUploadFile() {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('Must be logged in to upload files');
      }

      console.log('Starting upload:', {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });

      // Try multiple Blossom servers in order
      const servers = [
        'https://blossom.primal.net/',
        'https://blossom.nostr.hu/',
        'https://cdn.satellite.earth/',
      ];

      let lastError: Error | null = null;

      for (const server of servers) {
        try {
          console.log(`Attempting upload to: ${server}`);
          
          const uploader = new BlossomUploader({
            servers: [server],
            signer: user.signer,
          });

          // Create a timeout promise
          const uploadPromise = uploader.upload(file);
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Upload timeout after 5 minutes')), 5 * 60 * 1000);
          });

          const tags = await Promise.race([uploadPromise, timeoutPromise]);
          
          console.log('Upload successful to:', server);
          return tags;
        } catch (error) {
          console.error(`Upload failed to ${server}:`, error);
          lastError = error instanceof Error ? error : new Error('Upload failed');
          // Continue to next server
        }
      }

      // If all servers failed, throw the last error
      throw lastError || new Error('All upload servers failed');
    },
  });
}