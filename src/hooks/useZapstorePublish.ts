import { useMutation } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './useToast';
import { extractApkCertFingerprint } from '@/lib/apkCertExtractor';

const ZAPSTORE_RELAY = 'wss://relay.zapstore.dev';
const ZAPSTORE_BLOSSOM = 'https://cdn.zapstore.dev';
// CORS proxy used for the PUT /upload request from the browser
const CORS_PROXY = 'https://proxy.shakespeare.diy/?url=';

export interface ApkUploadResult {
  url: string;
  sha256: string;
  size: number;
  filename: string;
}

export interface ZapstoreAppConfig {
  packageName: string;
  name: string;
  summary: string;
  description: string;
  icon: string;
  images: string[];
  tags: string[];
  license: string;
  repository: string;
  website: string;
  supportedNips: string[];
  platforms: string[];
}

export interface ZapstoreReleaseConfig {
  packageName: string;
  version: string;
  channel: string;
  releaseNotes: string;
  assetEventId?: string;
}

export interface ZapstoreAssetConfig {
  packageName: string;
  version: string;
  versionCode: string;
  url: string;
  mimeType: string;
  sha256: string;
  size: string;
  platform: string;
  apkCertHash?: string;
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
 * Check if a file already exists on the Blossom CDN.
 * Uses a simple GET via proxy to avoid CORS preflight issues.
 * Returns true if the file is already there.
 */
async function blossomExists(sha256: string): Promise<boolean> {
  try {
    // HEAD via proxy - if the CDN has it, we get a 200 back
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${ZAPSTORE_BLOSSOM}/${sha256}`)}`;
    const res = await fetch(proxyUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false; // assume not exists if check fails
  }
}

/**
 * Upload a file to cdn.zapstore.dev via Blossom PUT /upload.
 * Routes through CORS proxy to avoid browser cross-origin restrictions.
 * Sends Content-Digest + Authorization (NIP-24242 auth event) headers.
 */
async function blossomUpload(
  file: File,
  sha256: string,
  signer: { signEvent: (e: object) => Promise<Record<string, unknown>> },
  onProgress?: (pct: number) => void,
): Promise<string> {
  const url = `${ZAPSTORE_BLOSSOM}/${sha256}`;

  // Build NIP-24242 Blossom auth event (kind 24242, not 98)
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

  const authHeader = `Nostr ${btoa(JSON.stringify(authEvent))}`;

  // Read the file as ArrayBuffer so we can send it via fetch
  // (XHR gave us 10% hang due to CORS preflight; fetch via proxy avoids this)
  const body = await file.arrayBuffer();

  // Simulate progress since fetch doesn't expose upload progress
  onProgress?.(10);

  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${ZAPSTORE_BLOSSOM}/upload`)}`;

  onProgress?.(20);

  const res = await fetch(proxyUrl, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Digest': sha256,
      'X-Content-Length': String(file.size),
    },
    body,
    signal: AbortSignal.timeout(5 * 60 * 1000), // 5-min timeout
  });

  onProgress?.(90);

  if (!res.ok) {
    const reason = res.headers.get('X-Reason') ?? (await res.text().catch(() => '')).slice(0, 200);
    throw new Error(`CDN upload failed HTTP ${res.status}${reason ? `: ${reason}` : ''}`);
  }

  onProgress?.(100);

  try {
    const json = await res.json() as { url?: string };
    return json.url ?? url;
  } catch {
    return url;
  }
}

/** Send a signed Nostr event to a relay via WebSocket. */
async function publishToRelay(event: Record<string, unknown>, relayUrl: string): Promise<void> {
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

    ws.onopen = () => { ws.send(JSON.stringify(['EVENT', event])); };

    ws.onmessage = (msg) => {
      if (settled) return;
      try {
        const data = JSON.parse(msg.data as string) as unknown[];
        if (!Array.isArray(data)) return;
        if (data[0] === 'OK') {
          const accepted = data[2] as boolean;
          const message = (data[3] as string) || '';
          if (accepted) settle(() => resolve());
          else settle(() => reject(new Error(`Relay rejected: ${message}`)));
        } else if (data[0] === 'NOTICE') {
          console.warn('[Zapstore relay NOTICE]', data[1]);
        }
      } catch { /* ignore */ }
    };

    ws.onerror = () => {
      settle(() => reject(new Error(`Cannot connect to ${relayUrl}`)));
    };
    ws.onclose = (e) => {
      settle(() => reject(new Error(`Connection closed before relay confirmed (code ${e.code})`)));
    };
  });
}

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
        ['h', 'zapstore'],
        ['alt', `${config.name} - Software Application on Zapstore`],
      ];

      if (config.summary) tags.push(['summary', config.summary]);
      if (config.license) tags.push(['license', config.license]);
      if (config.repository) tags.push(['repository', config.repository]);
      if (config.website) tags.push(['url', config.website]);
      if (config.icon) tags.push(['icon', config.icon]);

      for (const img of config.images) if (img.trim()) tags.push(['image', img.trim()]);
      for (const tag of config.tags) if (tag.trim()) tags.push(['t', tag.trim().toLowerCase()]);
      for (const platform of config.platforms) if (platform.trim()) tags.push(['f', platform.trim()]);
      for (const nip of config.supportedNips) if (nip.trim()) tags.push(['nip', nip.trim()]);

      const event = await user.signer.signEvent({
        kind: 32267,
        content: config.description,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => toast({ title: '✅ App Published!', description: 'Kind 32267 sent to relay.zapstore.dev' }),
    onError: (err: Error) => toast({ title: '❌ Publish Failed', description: err.message, variant: 'destructive' }),
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
        kind: 3063, content: '', tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => toast({ title: '✅ Asset Published!', description: 'Kind 3063 sent to relay.zapstore.dev' }),
    onError: (err: Error) => toast({ title: '❌ Asset Publish Failed', description: err.message, variant: 'destructive' }),
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
      if (config.assetEventId) tags.push(['e', config.assetEventId, ZAPSTORE_RELAY]);

      const event = await user.signer.signEvent({
        kind: 30063,
        content: config.releaseNotes,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(event, ZAPSTORE_RELAY);
      return event;
    },
    onSuccess: () => toast({ title: '✅ Release Published!', description: 'Kind 30063 sent to relay.zapstore.dev' }),
    onError: (err: Error) => toast({ title: '❌ Release Publish Failed', description: err.message, variant: 'destructive' }),
  });

  // Standalone upload (kept for optional separate use)
  const uploadApkToBlossom = useMutation({
    mutationFn: async (file: File): Promise<ApkUploadResult> => {
      if (!user) throw new Error('You must be logged in to upload');
      const buf = await file.arrayBuffer();
      const sha256 = await sha256Hex(buf);
      const exists = await blossomExists(sha256);
      const url = exists
        ? `${ZAPSTORE_BLOSSOM}/${sha256}`
        : await blossomUpload(file, sha256, user.signer);
      return { url, sha256, size: file.size, filename: file.name };
    },
    onError: (err: Error) => toast({ title: '❌ Upload Failed', description: err.message, variant: 'destructive' }),
  });

  // All-in-one: hash → check existence → upload if needed → publish asset + release
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

      // Step 1: Hash + extract cert fingerprint in parallel (both read the file locally)
      onProgress?.('Reading APK — hashing & extracting certificate…', 0);
      const buf = await file.arrayBuffer();
      const [sha256, certResult] = await Promise.all([
        sha256Hex(buf),
        extractApkCertFingerprint(file).catch(() => null),
      ]);
      const certFingerprint = asset.apkCertHash?.trim() || certResult?.fingerprint || '';
      onProgress?.('Hashing APK…', 100);

      // Step 2: Check if already on CDN (content-addressed — same APK = same hash)
      onProgress?.('Checking CDN for existing file…', 0);
      const alreadyExists = await blossomExists(sha256);
      let cdnUrl: string;

      if (alreadyExists) {
        // File already on CDN — skip upload entirely
        cdnUrl = `${ZAPSTORE_BLOSSOM}/${sha256}`;
        onProgress?.('File already on CDN — skipping upload ✓', 100);
      } else {
        // Step 3: Upload via CORS proxy
        onProgress?.('Uploading to cdn.zapstore.dev…', 0);
        try {
          cdnUrl = await blossomUpload(file, sha256, user.signer, (pct) => {
            onProgress?.('Uploading to cdn.zapstore.dev…', pct);
          });
        } catch (err) {
          throw new Error(
            `CDN upload failed: ${(err as Error).message}\n\n` +
            `Tip: If upload keeps failing, manually upload the APK to cdn.zapstore.dev ` +
            `and paste the URL into the "Manual publish" fields (Step 2 above).`
          );
        }
        onProgress?.('Uploading to cdn.zapstore.dev…', 100);
      }

      // Step 4: Publish kind 3063 asset event
      onProgress?.('Publishing asset event (kind 3063)…');
      const assetTags: string[][] = [
        ['i', asset.packageName],
        ['version', asset.version],
        ['version_code', asset.versionCode],
        ['url', cdnUrl],
        ['m', 'application/vnd.android.package-archive'],
        ['f', asset.platform],
        ['x', sha256],
        ['size', String(file.size)],
        ['alt', `${asset.packageName} v${asset.version} APK`],
      ];
      // apk_certificate_hash is required by the Zapstore relay for Android APKs
      if (!certFingerprint) {
        throw new Error(
          'Could not extract APK certificate hash automatically.\n' +
          'Please paste it manually in the "APK Certificate Hash" field above.\n\n' +
          'To get it: run  keytool -printcert -jarfile your.apk  or use apksigner.'
        );
      }
      assetTags.push(['apk_certificate_hash', certFingerprint]);

      const assetEvent = await user.signer.signEvent({
        kind: 3063, content: '', tags: assetTags,
        created_at: Math.floor(Date.now() / 1000),
      });
      await publishToRelay(assetEvent, ZAPSTORE_RELAY);

      // Step 5: Publish kind 30063 release event
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
      return { url: cdnUrl, sha256, certFingerprint, assetEventId: assetEvent.id, releaseEventId: releaseEvent.id };
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
