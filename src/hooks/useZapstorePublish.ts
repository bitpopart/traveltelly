import { useMutation } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './useToast';

const ZAPSTORE_RELAY = 'wss://relay.zapstore.dev';

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
  platforms: string[];   // e.g. ["web", "android-arm64-v8a"]
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

export function useZapstorePublish() {
  const { user } = useCurrentUser();
  const { toast } = useToast();

  // Helper: send event to a specific relay, returns the signed event on success
  const publishToRelay = async (event: Record<string, unknown>, relayUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(relayUrl);
      let settled = false;

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          ws.close();
          reject(new Error(`Timeout connecting to ${relayUrl}`));
        }
      }, 20000);

      ws.onopen = () => {
        ws.send(JSON.stringify(['EVENT', event]));
      };

      ws.onmessage = (msg) => {
        if (settled) return;
        try {
          const data = JSON.parse(msg.data as string) as unknown[];
          if (Array.isArray(data) && data[0] === 'OK') {
            settled = true;
            clearTimeout(timeout);
            ws.close();
            const accepted = data[2] as boolean;
            const message = (data[3] as string) || '';
            if (accepted) {
              resolve();
            } else {
              reject(new Error(`Relay rejected event: ${message}`));
            }
          } else if (Array.isArray(data) && data[0] === 'NOTICE') {
            // Log NOTICE messages for debugging
            console.warn('[Zapstore relay NOTICE]', data[1]);
          }
        } catch {
          // ignore parse errors, wait for OK
        }
      };

      ws.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(new Error(`Could not connect to ${relayUrl} — check network or relay status`));
        }
      };

      ws.onclose = (e) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          // Closed before OK — treat as an error
          reject(new Error(`Connection closed before relay confirmed (code ${e.code})`));
        }
      };
    });
  };

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
      if (config.website) tags.push(['url', config.website]); // NIP-82 uses 'url' not 'website'
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
      toast({ title: '✅ App Published!', description: 'Kind 32267 published to relay.zapstore.dev' });
    },
    onError: (err: Error) => {
      toast({ title: '❌ Publish Failed', description: err.message, variant: 'destructive' });
    },
  });

  // Publish kind 3063 - Software Asset (must publish before release)
  const publishAsset = useMutation({
    mutationFn: async (config: ZapstoreAssetConfig) => {
      if (!user) throw new Error('You must be logged in to publish to Zapstore');

      // Build tags matching the NIP-82 spec from zapstore/zsp events.go exactly
      const tags: string[][] = [
        ['i', config.packageName],   // App identifier
        ['version', config.version],
        ['version_code', config.versionCode],
        ['url', config.url],         // Download URL (can appear multiple times)
        ['m', config.mimeType],      // MIME type
        ['f', config.platform],      // Platform identifier (REQUIRED per NIP-82)
        ['alt', `${config.packageName} v${config.version} software asset`],
      ];

      // x (sha256) is required by the relay — include it even if empty for non-APK,
      // but only push a real value; skip the tag entirely if blank to avoid relay rejection
      if (config.sha256.trim()) tags.push(['x', config.sha256.trim()]);

      // size: only include if a valid positive number
      const sizeNum = parseInt(config.size, 10);
      if (!isNaN(sizeNum) && sizeNum > 0) tags.push(['size', String(sizeNum)]);

      if (config.apkCertHash?.trim()) tags.push(['apk_certificate_hash', config.apkCertHash.trim()]);
      if (config.minPlatformVersion?.trim()) tags.push(['min_platform_version', config.minPlatformVersion.trim()]);
      if (config.targetPlatformVersion?.trim()) tags.push(['target_platform_version', config.targetPlatformVersion.trim()]);

      const unsigned = {
        kind: 3063,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      const event = await user.signer.signEvent(unsigned);
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => {
      toast({ title: '✅ Asset Published!', description: 'Kind 3063 published to relay.zapstore.dev' });
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

      const unsigned = {
        kind: 30063,
        content: config.releaseNotes,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      const event = await user.signer.signEvent(unsigned);
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => {
      toast({ title: '✅ Release Published!', description: 'Kind 30063 published to relay.zapstore.dev' });
    },
    onError: (err: Error) => {
      toast({ title: '❌ Release Publish Failed', description: err.message, variant: 'destructive' });
    },
  });

  return { publishApp, publishAsset, publishRelease };
}
