import { useMutation } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './useToast';

const ZAPSTORE_RELAY = 'wss://relay.zapstore.dev';
const ZAPSTORE_BLOSSOM = 'https://cdn.zapstore.dev';

export interface ApkUploadResult {
  url: string;       // cdn.zapstore.dev/sha256
  sha256: string;    // hex sha256
  size: number;      // bytes
  filename: string;
}

export interface ZapstoreAppConfig {
  // Kind 32267 - Software Application
  packageName: string;   // d tag (identifier, e.g. com.traveltelly.app)
  name: string;
  summary: string;
  description: string;
  icon: string;          // URL
  images: string[];      // Screenshot URLs
  tags: string[];        // Category tags (t)
  license: string;
  repository: string;    // Source code URL
  website: string;
  supportedNips: string[]; // for Nostr clients
  platforms: string[];   // e.g. ["android-arm64-v8a", "android-armeabi-v7a"]
}

export interface ZapstoreReleaseConfig {
  // Kind 30063 - Software Release
  packageName: string;
  version: string;
  channel: string;       // main, beta, nightly
  releaseNotes: string;
  assetEventId?: string; // e tag referencing kind 3063
}

export interface ZapstoreAssetConfig {
  // Kind 3063 - Software Asset
  packageName: string;
  version: string;
  versionCode: string;
  url: string;           // APK or PWA URL
  mimeType: string;      // application/vnd.android.package-archive or text/html
  sha256: string;        // file hash
  size: string;          // file size in bytes
  platform: string;      // android-arm64-v8a, web, etc.
  apkCertHash?: string;  // for Android APKs
  minPlatformVersion?: string;
  targetPlatformVersion?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute SHA-256 hex from an ArrayBuffer */
async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Upload a file to a Blossom server using the standard PUT /upload endpoint.
 * Builds a NIP-98 auth event and attaches it as a base64 header.
 * Returns the final CDN URL.
 */
async function blossomUpload(
  file: File,
  sha256: string,
  signer: { signEvent: (e: object) => Promise<{ [k: string]: unknown }> },
  onProgress?: (pct: number) => void,
): Promise<string> {
  // Build a NIP-98 auth event for Blossom upload
  const authEvent = await signer.signEvent({
    kind: 24242,
    content: `Upload ${file.name}`,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['t', 'upload'],
      ['x', sha256],
      ['expiration', String(Math.floor(Date.now() / 1000) + 600)],
    ],
  });

  const authHeader = btoa(JSON.stringify(authEvent));

  // Use XMLHttpRequest so we can track upload progress
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 5-minute hard timeout (APKs can be large)
    xhr.timeout = 5 * 60 * 1000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { url?: string };
          const url = json.url ?? `${ZAPSTORE_BLOSSOM}/${sha256}`;
          resolve(url);
        } catch {
          // If response isn't JSON, construct URL from hash
          resolve(`${ZAPSTORE_BLOSSOM}/${sha256}`);
        }
      } else {
        reject(new Error(`Upload failed: HTTP ${xhr.status} — ${xhr.responseText.slice(0, 200)}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload — check your connection'));
    xhr.ontimeout = () => reject(new Error('Upload timed out after 5 minutes'));

    xhr.open('PUT', `${ZAPSTORE_BLOSSOM}/upload`);
    xhr.setRequestHeader('Authorization', `Nostr ${authHeader}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

/** Send a signed Nostr event to a relay via WebSocket. */
const publishToRelay = async (event: Record<string, unknown>, relayUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relayUrl);
    let settled = false;

    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        ws.close();
        fn();
      }
    };

    const timeout = setTimeout(() => {
      settle(() => reject(new Error(`Timeout: relay ${relayUrl} did not respond in 20s`)));
    }, 20_000);

    ws.onopen = () => {
      ws.send(JSON.stringify(['EVENT', event]));
    };

    ws.onmessage = (msg) => {
      if (settled) return;
      try {
        const data = JSON.parse(msg.data as string) as unknown[];
        if (!Array.isArray(data)) return;
        if (data[0] === 'OK') {
          const accepted = data[2] as boolean;
          const message = (data[3] as string) || '';
          if (accepted) {
            settle(() => resolve());
          } else {
            settle(() => reject(new Error(`Relay rejected: ${message}`)));
          }
        } else if (data[0] === 'NOTICE') {
          console.warn('[Zapstore relay NOTICE]', data[1]);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      settle(() => reject(new Error(`Cannot connect to ${relayUrl} — check network or relay status`)));
    };

    ws.onclose = (e) => {
      settle(() => reject(new Error(`Connection closed before relay confirmed (code ${e.code})`)));
    };
  });
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useZapstorePublish() {
  const { user } = useCurrentUser();
  const { toast } = useToast();

  // Publish kind 32267 - Software Application
  const publishApp = useMutation({
    mutationFn: async (config: ZapstoreAppConfig) => {
      if (!user) throw new Error('You must be logged in to publish to Zapstore');

      const tags: string[][] = [
        ['d', config.packageName],
        ['name', config.name],
        ['h', 'zapstore'], // Community identifier — required by Zapstore relay
        ['alt', `${config.name} - Software Application on Zapstore`],
      ];

      if (config.summary) tags.push(['summary', config.summary]);
      if (config.license) tags.push(['license', config.license]);
      if (config.repository) tags.push(['repository', config.repository]);
      if (config.website) tags.push(['url', config.website]);
      if (config.icon) tags.push(['icon', config.icon]);

      for (const img of config.images) {
        if (img.trim()) tags.push(['image', img.trim()]);
      }
      for (const tag of config.tags) {
        if (tag.trim()) tags.push(['t', tag.trim().toLowerCase()]);
      }
      for (const platform of config.platforms) {
        if (platform.trim()) tags.push(['f', platform.trim()]);
      }
      for (const nip of config.supportedNips) {
        if (nip.trim()) tags.push(['nip', nip.trim()]);
      }

      const unsigned = {
        kind: 32267,
        content: config.description,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      const event = await user.signer.signEvent(unsigned);
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => {
      toast({ title: '✅ App Published!', description: 'Kind 32267 sent to relay.zapstore.dev' });
    },
    onError: (err: Error) => {
      toast({ title: '❌ Publish Failed', description: err.message, variant: 'destructive' });
    },
  });

  // Publish kind 3063 - Software Asset
  const publishAsset = useMutation({
    mutationFn: async (config: ZapstoreAssetConfig) => {
      if (!user) throw new Error('You must be logged in to publish to Zapstore');

      const tags: string[][] = [
        ['i', config.packageName],
        ['version', config.version],
        ['version_code', config.versionCode],
        ['url', config.url],
        ['m', config.mimeType],
        ['f', config.platform],
        ['alt', `${config.packageName} v${config.version} software asset`],
      ];

      if (config.sha256.trim()) tags.push(['x', config.sha256.trim()]);

      const sizeNum = parseInt(config.size, 10);
      if (!isNaN(sizeNum) && sizeNum > 0) tags.push(['size', String(sizeNum)]);

      if (config.apkCertHash?.trim()) tags.push(['apk_certificate_hash', config.apkCertHash.trim()]);
      if (config.minPlatformVersion?.trim()) tags.push(['min_platform_version', config.minPlatformVersion.trim()]);
      if (config.targetPlatformVersion?.trim()) tags.push(['target_platform_version', config.targetPlatformVersion.trim()]);

      const event = await user.signer.signEvent({
        kind: 3063,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => {
      toast({ title: '✅ Asset Published!', description: 'Kind 3063 sent to relay.zapstore.dev' });
    },
    onError: (err: Error) => {
      toast({ title: '❌ Asset Publish Failed', description: err.message, variant: 'destructive' });
    },
  });

  // Publish kind 30063 - Software Release
  const publishRelease = useMutation({
    mutationFn: async (config: ZapstoreReleaseConfig) => {
      if (!user) throw new Error('You must be logged in to publish to Zapstore');

      const tags: string[][] = [
        ['d', `${config.packageName}@${config.version}`],
        ['i', config.packageName],
        ['version', config.version],
        ['c', config.channel],
        ['alt', `${config.packageName} v${config.version} release`],
      ];

      if (config.assetEventId) {
        tags.push(['e', config.assetEventId, ZAPSTORE_RELAY]);
      }

      const event = await user.signer.signEvent({
        kind: 30063,
        content: config.releaseNotes,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => {
      toast({ title: '✅ Release Published!', description: 'Kind 30063 sent to relay.zapstore.dev' });
    },
    onError: (err: Error) => {
      toast({ title: '❌ Release Publish Failed', description: err.message, variant: 'destructive' });
    },
  });

  // Standalone Blossom upload (kept for optional separate use)
  const uploadApkToBlossom = useMutation({
    mutationFn: async (file: File): Promise<ApkUploadResult> => {
      if (!user) throw new Error('You must be logged in to upload');
      const buf = await file.arrayBuffer();
      const sha256 = await sha256Hex(buf);
      const url = await blossomUpload(file, sha256, user.signer);
      return { url, sha256, size: file.size, filename: file.name };
    },
    onError: (err: Error) => {
      toast({ title: '❌ Upload Failed', description: err.message, variant: 'destructive' });
    },
  });

  // All-in-one: upload APK → publish asset event → publish release event
  const publishApkRelease = useMutation({
    mutationFn: async ({
      file,
      asset,
      release,
      onProgress,
    }: {
      file: File;
      asset: Omit<ZapstoreAssetConfig, 'url' | 'sha256' | 'size'>;
      release: ZapstoreReleaseConfig;
      onProgress?: (stage: string, pct?: number) => void;
    }) => {
      if (!user) throw new Error('You must be logged in');

      // 1. Hash the file locally (instant — no network)
      onProgress?.('Hashing APK…', 0);
      const buf = await file.arrayBuffer();
      const sha256 = await sha256Hex(buf);
      onProgress?.('Hashing APK…', 100);

      // 2. Upload to cdn.zapstore.dev via direct fetch with progress
      onProgress?.('Uploading to cdn.zapstore.dev…', 0);
      let url: string;
      try {
        url = await blossomUpload(file, sha256, user.signer, (pct) => {
          onProgress?.('Uploading to cdn.zapstore.dev…', pct);
        });
      } catch (err) {
        // If Zapstore CDN upload fails, throw a clear error
        throw new Error(
          `CDN upload failed: ${(err as Error).message}. ` +
          `Try uploading the APK manually to cdn.zapstore.dev and paste the URL in the manual fields.`
        );
      }
      onProgress?.('Uploading to cdn.zapstore.dev…', 100);

      // 3. Publish kind 3063 asset event
      onProgress?.('Publishing asset event (kind 3063)…');
      const assetTags: string[][] = [
        ['i', asset.packageName],
        ['version', asset.version],
        ['version_code', asset.versionCode],
        ['url', url],
        ['m', 'application/vnd.android.package-archive'],
        ['f', asset.platform],
        ['x', sha256],
        ['size', String(file.size)],
        ['alt', `${asset.packageName} v${asset.version} APK`],
      ];
      if (asset.apkCertHash?.trim()) assetTags.push(['apk_certificate_hash', asset.apkCertHash.trim()]);

      const assetEvent = await user.signer.signEvent({
        kind: 3063,
        content: '',
        tags: assetTags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(assetEvent, ZAPSTORE_RELAY);

      // 4. Publish kind 30063 release event
      onProgress?.('Publishing release event (kind 30063)…');
      const releaseTags: string[][] = [
        ['d', `${release.packageName}@${release.version}`],
        ['i', release.packageName],
        ['version', release.version],
        ['c', release.channel || 'main'],
        ['e', assetEvent.id, ZAPSTORE_RELAY],
        ['alt', `${release.packageName} v${release.version} release`],
      ];
      const releaseEvent = await user.signer.signEvent({
        kind: 30063,
        content: release.releaseNotes,
        tags: releaseTags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(releaseEvent, ZAPSTORE_RELAY);

      onProgress?.('Done!', 100);
      return { url, sha256, assetEventId: assetEvent.id, releaseEventId: releaseEvent.id };
    },
    onSuccess: (data) => {
      toast({
        title: '🚀 APK Published to Zapstore!',
        description: `Asset …${data.assetEventId.slice(-8)} + Release …${data.releaseEventId.slice(-8)} on relay`,
      });
    },
    onError: (err: Error) => {
      toast({ title: '❌ Publish Failed', description: err.message, variant: 'destructive' });
    },
  });

  return { publishApp, publishAsset, publishRelease, uploadApkToBlossom, publishApkRelease };
}
