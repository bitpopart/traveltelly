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

  // Helper: send event to a specific relay
  const publishToRelay = async (event: Record<string, unknown>, relayUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(relayUrl);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error(`Timeout connecting to ${relayUrl}`));
      }, 15000);

      ws.onopen = () => {
        ws.send(JSON.stringify(['EVENT', event]));
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (Array.isArray(data) && data[0] === 'OK') {
            clearTimeout(timeout);
            ws.close();
            if (data[2] === true || data[2] === undefined) {
              resolve();
            } else {
              reject(new Error(data[3] || 'Relay rejected event'));
            }
          }
        } catch {
          // ignore parse errors, wait for OK
        }
      };

      ws.onerror = (err) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket error: ${String(err)}`));
      };

      ws.onclose = () => {
        clearTimeout(timeout);
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
        ['summary', config.summary],
        ['license', config.license],
        ['repository', config.repository],
        ['website', config.website],
        ['alt', `${config.name} - Software Application on Zapstore`],
      ];

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

      const tags: string[][] = [
        ['i', config.packageName],
        ['version', config.version],
        ['version_code', config.versionCode],
        ['url', config.url],
        ['m', config.mimeType],
        ['x', config.sha256],
        ['size', config.size],
        ['f', config.platform],
        ['alt', `${config.packageName} v${config.version} software asset`],
      ];

      if (config.apkCertHash) tags.push(['apk_certificate_hash', config.apkCertHash]);
      if (config.minPlatformVersion) tags.push(['min_platform_version', config.minPlatformVersion]);
      if (config.targetPlatformVersion) tags.push(['target_platform_version', config.targetPlatformVersion]);

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
