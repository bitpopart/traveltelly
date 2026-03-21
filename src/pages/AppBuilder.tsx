import { useState, useRef } from 'react';
import { extractApkCertFingerprint } from '@/lib/apkCertExtractor';
import { useUploadFile } from '@/hooks/useUploadFile';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';
import { 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Download,
  Package,
  Play,
  Apple,
  Code,
  ExternalLink,
  Info,
  FileCode2,
  Wrench,
  Zap,
  Palette,
  Globe,
  Settings,
  Store,
  Send,
  Copy,
  ChevronRight,
  RefreshCw,
  Upload,
  FileUp,
  Rocket,
  ChevronLeft,
  Star,
  MapPin,
  Camera,
  Image,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PWAStatus } from '@/components/PWAStatus';
import { useZapstorePublish } from '@/hooks/useZapstorePublish';
import type { ZapstoreAppConfig, ZapstoreReleaseConfig, ZapstoreAssetConfig } from '@/hooks/useZapstorePublish';
import { useZapstoreStatus, getTag } from '@/hooks/useZapstoreStatus';
import { useQueryClient } from '@tanstack/react-query';

// ─── Zapstore Showcase Preview Component ─────────────────────────────────────
// Mimics the zapstore.dev/apps/:id page layout (dark bg, icon, screenshots,
// description, tag pills, platform badges, install button).
interface ZapstoreShowcasePreviewProps {
  zapApp: {
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
    platforms: string[];
  };
}

function ZapstoreShowcasePreview({ zapApp }: ZapstoreShowcasePreviewProps) {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const screenshots = zapApp.images.filter(Boolean);

  const platformLabel = (p: string) => {
    const map: Record<string, string> = {
      'android-arm64-v8a': 'ARM64',
      'android-armeabi-v7a': 'ARMv7',
      'android-x86': 'x86',
      'android-x86_64': 'x86_64',
      'web': 'Web',
    };
    return map[p] ?? p;
  };

  const isAndroid = zapApp.platforms.some(p => p.startsWith('android'));

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#050505', color: '#fff' }}>
      {/* Top nav bar mimicking zapstore.dev */}
      <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: '#1a1a1a' }}>
        <div className="flex items-center gap-2">
          {/* Zapstore logo */}
          <svg width="16" height="26" viewBox="0 0 19 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="zs-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path d="M18.8379 13.9711L8.84956 0.356086C8.30464 -0.386684 7.10438 0.128479 7.30103 1.02073L9.04686 8.94232C9.16268 9.46783 8.74887 9.96266 8.19641 9.9593L0.871032 9.91477C0.194934 9.91066 -0.223975 10.6293 0.126748 11.1916L7.69743 23.3297C7.99957 23.8141 7.73264 24.4447 7.16744 24.5816L5.40958 25.0076C4.70199 25.179 4.51727 26.0734 5.10186 26.4974L12.4572 31.8326C12.9554 32.194 13.6711 31.9411 13.8147 31.3529L15.8505 23.0152C16.0137 22.3465 15.3281 21.7801 14.6762 22.0452L13.0661 22.7001C12.5619 22.9052 11.991 22.6092 11.8849 22.0877L10.7521 16.5224C10.6486 16.014 11.038 15.5365 11.5704 15.5188L18.1639 15.2998C18.8529 15.2769 19.2383 14.517 18.8379 13.9711Z" fill="url(#zs-gradient)" />
          </svg>
          <span className="font-semibold text-sm" style={{ color: '#fff' }}>Zapstore</span>
        </div>
        <span style={{ color: '#555' }}>/</span>
        <span className="text-sm" style={{ color: '#888' }}>apps</span>
        <span style={{ color: '#555' }}>/</span>
        <span className="text-sm font-mono" style={{ color: '#aaa' }}>{zapApp.packageName}</span>
        <div className="ml-auto">
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#888' }}>
            Preview
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6 md:p-8 space-y-8">

        {/* App Header Row */}
        <div className="flex items-start gap-5">
          {/* App Icon */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border" style={{ borderColor: '#2a2a2a' }}>
              {zapApp.icon && !zapApp.icon.includes('placeholder') ? (
                <img
                  src={zapApp.icon}
                  alt={zapApp.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #b700d7 0%, #7c3aed 100%)' }}>
                <MapPin className="w-10 h-10 text-white opacity-90" />
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#fff' }}>{zapApp.name || 'TravelTelly'}</h2>
              {isAndroid && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#1a2a1a', color: '#4ade80', border: '1px solid #166534' }}>
                  Android
                </span>
              )}
            </div>
            <p className="text-base" style={{ color: '#aaa' }}>{zapApp.summary || 'Travel the world. Share your story.'}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {zapApp.tags.slice(0, 5).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a1a2e', color: '#818cf8', border: '1px solid #312e81' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Install CTA */}
          <div className="shrink-0 hidden md:flex flex-col items-end gap-2">
            <a
              href={`https://zapstore.dev/apps/${zapApp.packageName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' }}
            >
              <Store className="w-4 h-4" />
              View on Zapstore
            </a>
            <span className="text-xs" style={{ color: '#555' }}>zapstore.dev/apps/{zapApp.packageName}</span>
          </div>
        </div>

        {/* Screenshots Carousel */}
        {screenshots.length > 0 ? (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden" style={{ background: '#111', minHeight: 180 }}>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                {screenshots.map((src, i) => (
                  <div
                    key={i}
                    className="snap-center shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
                    style={{
                      borderColor: activeScreenshot === i ? '#a855f7' : '#2a2a2a',
                      width: 160,
                      height: 280,
                      background: '#1a1a1a',
                    }}
                    onClick={() => setActiveScreenshot(i)}
                  >
                    <img
                      src={src}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.parentElement!.style.display = 'flex';
                        el.parentElement!.style.alignItems = 'center';
                        el.parentElement!.style.justifyContent = 'center';
                        el.style.display = 'none';
                        const ph = document.createElement('div');
                        ph.style.cssText = 'color:#555;font-size:11px;text-align:center;padding:8px';
                        ph.textContent = `Screenshot ${i + 1}`;
                        el.parentElement!.appendChild(ph);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScreenshot(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: activeScreenshot === i ? 16 : 6,
                    height: 6,
                    background: activeScreenshot === i ? '#a855f7' : '#333',
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          // Placeholder screenshots showing the app concept
          <div className="rounded-xl p-6 text-center" style={{ background: '#0d0d0d', border: '1px dashed #2a2a2a' }}>
            <div className="flex gap-3 justify-center">
              {[
                { icon: <MapPin className="w-8 h-8" />, label: 'World Map' },
                { icon: <Camera className="w-8 h-8" />, label: 'Reviews' },
                { icon: <Image className="w-8 h-8" />, label: 'Marketplace' },
                { icon: <Star className="w-8 h-8" />, label: 'Stories' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-xl p-4" style={{ background: '#1a1a1a', width: 100 }}>
                  <div style={{ color: '#b700d7' }}>{icon}</div>
                  <span className="text-xs" style={{ color: '#888' }}>{label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-4" style={{ color: '#555' }}>Add screenshot URLs in Step 1 to preview them here</p>
          </div>
        )}

        {/* Description */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#666' }}>About</h3>
          <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#ccc' }}>
            {zapApp.description || 'No description set yet.'}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'License', value: zapApp.license || '—' },
            { label: 'Platform', value: isAndroid ? 'Android' : zapApp.platforms[0] || 'Web' },
            { label: 'Package', value: zapApp.packageName },
            { label: 'Source', value: zapApp.repository ? 'Open Source' : 'Closed Source' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3 space-y-1" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#555' }}>{label}</p>
              <p className="text-sm font-mono truncate" style={{ color: '#ddd' }} title={value}>{value}</p>
            </div>
          ))}
        </div>

        {/* Platform ABIs */}
        {zapApp.platforms.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider" style={{ color: '#555' }}>Supported Architectures</p>
            <div className="flex flex-wrap gap-2">
              {zapApp.platforms.map(p => (
                <span
                  key={p}
                  className="text-xs font-mono px-3 py-1 rounded-full"
                  style={{ background: '#1a2a1a', color: '#4ade80', border: '1px solid #166534' }}
                >
                  {platformLabel(p)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links Row */}
        <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: '#1a1a1a' }}>
          {zapApp.website && (
            <a
              href={zapApp.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
              style={{ color: '#818cf8' }}
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          {zapApp.repository && (
            <a
              href={zapApp.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
              style={{ color: '#818cf8' }}
            >
              <Code className="w-4 h-4" />
              Source Code
            </a>
          )}
          <a
            href={`https://zapstore.dev/apps/${zapApp.packageName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
            style={{ color: '#f7931a' }}
          >
            <Store className="w-4 h-4" />
            zapstore.dev/apps/{zapApp.packageName}
          </a>
        </div>

        {/* Mobile install CTA */}
        <div className="md:hidden">
          <a
            href={`https://zapstore.dev/apps/${zapApp.packageName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' }}
          >
            <Store className="w-4 h-4" />
            View on Zapstore
          </a>
        </div>

        {/* Preview disclaimer */}
        <div className="text-center pt-2">
          <p className="text-xs" style={{ color: '#444' }}>
            ↑ Live preview of your Zapstore listing — edit fields in Step 1 below to update
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AppBuilder() {
  const { user } = useCurrentUser();
  const { toast } = useToast();

  // Admin check
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // PWA Configuration State
  const [config, setConfig] = useState({
    // Basic Info
    appName: 'TravelTelly',
    shortName: 'TravelTelly',
    description: 'Share your travel experiences and discover amazing places on Nostr',
    
    // URLs
    startUrl: '/',
    scope: '/',
    siteUrl: 'https://traveltelly.diy',
    
    // Display
    display: 'standalone',
    orientation: 'any',
    
    // Colors
    themeColor: '#b700d7',
    backgroundColor: '#f4f4f5',
    
    // Package Info (for Android)
    packageName: 'com.traveltelly.app',
    versionCode: '1',
    versionName: '1.0.0',
    
    // App Store Info
    bundleId: 'com.traveltelly.app',
    appStoreId: '',
    
    // Icons (URLs to existing icons)
    icon192: '/icon-192.png',
    icon512: '/icon-512.png',
    
    // Optional features
    enableNotifications: true,
    enableGeolocation: true,
    enableCamera: false,
    enableOffline: true,
  });

  const [generating, setGenerating] = useState(false);

  // Zapstore state
  const queryClient = useQueryClient();
  const { publishApp, publishAsset, publishRelease, publishApkRelease } = useZapstorePublish();
  const zapstoreStatus = useZapstoreStatus(user?.pubkey, 'com.traveltelly.app');

  // Media upload
  const { mutateAsync: uploadFile } = useUploadFile();
  const [iconUploading, setIconUploading] = useState(false);
  const [iconDragOver, setIconDragOver] = useState(false);
  const [screenshotUploading, setScreenshotUploading] = useState<number | null>(null); // index being uploaded, or null
  const [screenshotDragOver, setScreenshotDragOver] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // APK upload state
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [apkDragOver, setApkDragOver] = useState(false);
  const [apkVersion, setApkVersion] = useState('1.0.0');
  const [apkVersionCode, setApkVersionCode] = useState('1');
  const [apkChannel, setApkChannel] = useState('main');
  const [apkReleaseNotes, setApkReleaseNotes] = useState('');
  const [apkCertHash, setApkCertHash] = useState('');
  const [apkResult, setApkResult] = useState<{ url: string; sha256: string; certFingerprint: string; assetEventId: string; releaseEventId: string } | null>(null);
  const [apkStage, setApkStage] = useState('');
  const [apkUploadPct, setApkUploadPct] = useState(0);
  const [apkCertExtracted, setApkCertExtracted] = useState<string>('');

  const [zapApp, setZapApp] = useState<ZapstoreAppConfig>({
    packageName: 'com.traveltelly.app',
    name: 'TravelTelly',
    summary: 'Travel the world. Share your story. Own your data.',
    description: 'TravelTelly is an open-source decentralized travel platform built on the Nostr protocol.\nYour travels. Your photos. Your rules.\n\nFeatures:\n- GPS-tagged travel reviews with star ratings and photos\n- Long-form travel stories with rich media support\n- Trip reports with GPS route visualization and distance tracking\n- Stock media marketplace — sell travel photos with Lightning payments\n- Interactive world map with community pins\n- Fully decentralized — your data lives on Nostr relays\n- Lightning payments — zap posts and profiles via NIP-57',
    icon: 'https://blossom.ditto.pub/bdd685aa48c9f43dc907ea9c46b960905f0fb2a8fad28fd1eb1fa6e2e97a962a.png',
    images: [
      'https://traveltelly.diy/screenshot1.png',
      'https://traveltelly.diy/screenshot2.png',
      'https://traveltelly.diy/screenshot3.png',
    ],
    tags: ['travel', 'nostr', 'social', 'photography', 'maps', 'lightning', 'decentralized'],
    license: 'MIT',
    repository: 'https://github.com/bitpopart/traveltelly',
    website: 'https://traveltelly.diy',
    supportedNips: ['01', '07', '23', '57', '99'],
    platforms: ['android-arm64-v8a', 'android-armeabi-v7a', 'android-x86', 'android-x86_64'],
  });

  const [zapAsset, setZapAsset] = useState<ZapstoreAssetConfig>({
    packageName: 'com.traveltelly.app',
    version: '1.0.0',
    versionCode: '1',
    url: 'https://traveltelly.com',
    mimeType: 'text/html',
    sha256: '',
    size: '',
    platform: 'web',
    apkCertHash: '',
    minPlatformVersion: '',
    targetPlatformVersion: '',
  });

  const [zapRelease, setZapRelease] = useState<ZapstoreReleaseConfig>({
    packageName: 'com.traveltelly.app',
    version: '1.0.0',
    channel: 'main',
    releaseNotes: 'Initial release of TravelTelly on Zapstore.',
    assetEventId: '',
  });

  const [publishedAssetId, setPublishedAssetId] = useState<string>('');
  const [publishStep, setPublishStep] = useState<'app' | 'asset' | 'release'>('app');
  const [hashingUrl, setHashingUrl] = useState(false);

  const updateZapApp = (key: keyof ZapstoreAppConfig, value: string | string[]) => {
    setZapApp(prev => ({ ...prev, [key]: value }));
  };
  const updateZapAsset = (key: keyof ZapstoreAssetConfig, value: string) => {
    setZapAsset(prev => ({ ...prev, [key]: value }));
  };
  const updateZapRelease = (key: keyof ZapstoreReleaseConfig, value: string) => {
    setZapRelease(prev => ({ ...prev, [key]: value }));
  };

  // Fetch URL and compute SHA-256 + byte size via CORS proxy
  const handleComputeHash = async () => {
    const url = zapAsset.url.trim();
    if (!url) {
      toast({ title: 'No URL', description: 'Enter an asset URL first.', variant: 'destructive' });
      return;
    }
    setHashingUrl(true);
    try {
      const proxyUrl = `https://proxy.shakespeare.diy/?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
      const buf = await res.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      setZapAsset(prev => ({
        ...prev,
        sha256: hashHex,
        size: String(buf.byteLength),
      }));
      toast({ title: '✅ Hash computed', description: `SHA-256: ${hashHex.slice(0, 16)}…` });
    } catch (err) {
      toast({ title: '❌ Hash failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setHashingUrl(false);
    }
  };

  // ── Icon upload ──────────────────────────────────────────────────────────────
  const handleIconFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Not an image', description: 'Please select a PNG or JPG file', variant: 'destructive' });
      return;
    }
    setIconUploading(true);
    try {
      const tags = await uploadFile(file);
      const url = tags.find(([t]) => t === 'url')?.[1] ?? '';
      if (!url) throw new Error('No URL returned from upload');
      updateZapApp('icon', url);
      toast({ title: '✅ Icon uploaded', description: url.slice(0, 60) + '…' });
    } catch (err) {
      toast({ title: '❌ Icon upload failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIconUploading(false);
    }
  };

  // ── Screenshot upload ─────────────────────────────────────────────────────────
  const handleScreenshotFiles = async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length === 0) {
      toast({ title: 'No images selected', description: 'Please select PNG or JPG files', variant: 'destructive' });
      return;
    }
    for (let i = 0; i < images.length; i++) {
      setScreenshotUploading(i);
      try {
        const tags = await uploadFile(images[i]);
        const url = tags.find(([t]) => t === 'url')?.[1] ?? '';
        if (url) {
          setZapApp(prev => ({ ...prev, images: [...prev.images.filter(Boolean), url] }));
        }
      } catch (err) {
        toast({ title: `Screenshot ${i + 1} failed`, description: (err as Error).message, variant: 'destructive' });
      }
    }
    setScreenshotUploading(null);
    toast({ title: `✅ ${images.length} screenshot${images.length > 1 ? 's' : ''} uploaded` });
  };

  const removeScreenshot = (idx: number) => {
    setZapApp(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handlePublishApp = async () => {
    await publishApp.mutateAsync(zapApp);
  };

  const handlePublishAsset = async () => {
    const event = await publishAsset.mutateAsync(zapAsset);
    setPublishedAssetId(event.id);
    setZapRelease(prev => ({ ...prev, assetEventId: event.id }));
    setPublishStep('release');
  };

  const handlePublishRelease = async () => {
    await publishRelease.mutateAsync({
      ...zapRelease,
      assetEventId: zapRelease.assetEventId || publishedAssetId,
    });
    // Refresh the relay status after a short delay to show updated data
    setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: ['zapstore-status'] });
    }, 3000);
  };

  // APK file selection handler — parse version from filename if possible
  const handleApkFile = (file: File) => {
    if (!file.name.endsWith('.apk')) {
      toast({ title: 'Wrong file type', description: 'Please select an .apk file', variant: 'destructive' });
      return;
    }
    setApkFile(file);
    setApkResult(null);
    setApkCertExtracted('');
    // Try to extract version from filename e.g. "app-1.2.3-release.apk"
    const versionMatch = file.name.match(/[_\-v](\d+\.\d+(?:\.\d+)?)/i);
    if (versionMatch) setApkVersion(versionMatch[1]);
    toast({ title: '📦 APK ready', description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` });
    // Auto-extract cert fingerprint in background
    extractApkCertFingerprint(file)
      .then(result => {
        setApkCertExtracted(result.fingerprint);
        setApkCertHash(result.fingerprint);
        toast({ title: '🔑 Certificate extracted', description: `APK Signing Scheme v${result.source === 'v2' ? '2/3 ✓ (preferred)' : '1 (fallback)'} · ${result.fingerprint.slice(0, 16)}…` });
      })
      .catch((err: Error) => {
        // Log for debugging but don't block the UI — user can paste manually
        console.warn('[APK cert extraction failed]', err.message);
      });
  };

  const handleApkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setApkDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleApkFile(file);
  };

  const handleApkPublish = async () => {
    if (!apkFile) return;
    setApkStage('');
    setApkUploadPct(0);
    const result = await publishApkRelease.mutateAsync({
      file: apkFile,
      asset: {
        packageName: 'com.traveltelly.app',
        version: apkVersion,
        versionCode: apkVersionCode,
        platform: 'android-arm64-v8a',
        mimeType: 'application/vnd.android.package-archive',
        apkCertHash,
      },
      release: {
        packageName: 'com.traveltelly.app',
        version: apkVersion,
        channel: apkChannel,
        releaseNotes: apkReleaseNotes,
      },
      onProgress: (stage: string, pct?: number) => {
        setApkStage(stage);
        if (pct !== undefined) setApkUploadPct(pct);
      },
    });
    setApkResult(result);
    // Refresh relay status
    setTimeout(() => void queryClient.invalidateQueries({ queryKey: ['zapstore-status'] }), 3000);
  };

  // Prefill version fields for a new version bump
  const handleBumpVersion = (newVersion: string) => {
    const parts = newVersion.split('.').map(Number);
    parts[2] = (parts[2] ?? 0) + 1;
    const bumped = parts.join('.');
    const currentCode = parseInt(zapAsset.versionCode, 10) || 1;
    setZapAsset(prev => ({ ...prev, version: bumped, versionCode: String(currentCode + 1), sha256: '', size: '' }));
    setZapRelease(prev => ({ ...prev, version: bumped, releaseNotes: '', assetEventId: '' }));
    setPublishedAssetId('');
    setPublishStep('asset'); // skip to asset step for updates
    toast({ title: '📦 Ready for new version', description: `Fill in release notes then publish asset + release for v${bumped}` });
  };

  const updateConfig = (key: string, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateManifest = () => {
    return JSON.stringify({
      name: config.appName,
      short_name: config.shortName,
      description: config.description,
      start_url: config.startUrl,
      scope: config.scope,
      display: config.display,
      orientation: config.orientation,
      theme_color: config.themeColor,
      background_color: config.backgroundColor,
      icons: [
        {
          src: config.icon192,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: config.icon512,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ],
      screenshots: [],
      categories: ["travel", "social", "photo"],
      shortcuts: [
        {
          name: "Create Review",
          url: "/create-review",
          description: "Create a new travel review"
        },
        {
          name: "View Map",
          url: "/world-map",
          description: "Explore the world map"
        }
      ]
    }, null, 2);
  };

  const generateAssetLinks = () => {
    return JSON.stringify([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: config.packageName,
          sha256_cert_fingerprints: [
            "YOUR_SHA256_FINGERPRINT_HERE"
          ]
        }
      }
    ], null, 2);
  };

  const generateAppleAppSiteAssociation = () => {
    return JSON.stringify({
      applinks: {
        apps: [],
        details: [
          {
            appID: `TEAMID.${config.bundleId}`,
            paths: ["*"]
          }
        ]
      }
    }, null, 2);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadManifest = () => {
    downloadFile('manifest.webmanifest', generateManifest());
    toast({
      title: "Manifest Downloaded",
      description: "manifest.webmanifest has been downloaded",
    });
  };

  const handleDownloadAssetLinks = () => {
    downloadFile('assetlinks.json', generateAssetLinks());
    toast({
      title: "Asset Links Downloaded",
      description: "assetlinks.json has been downloaded",
    });
  };

  const handleDownloadAppleAssociation = () => {
    downloadFile('apple-app-site-association', generateAppleAppSiteAssociation());
    toast({
      title: "Apple Association Downloaded",
      description: "apple-app-site-association has been downloaded",
    });
  };

  const handleGeneratePWA = async () => {
    setGenerating(true);
    
    // Simulate generation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "PWA Configuration Ready",
      description: "Download the files and follow the submission guide below",
    });
    
    setGenerating(false);
  };

  if (!isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                This page is only accessible to the Traveltelly admin.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link to="/admin">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/admin">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Panel
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-8 h-8" style={{ color: '#b700d7' }} />
              <h1 className="text-4xl font-bold">PWA App Builder</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Configure and build your Progressive Web App for Android & iOS App Stores
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6" style={{ borderColor: '#b700d7' }}>
            <Info className="h-4 w-4" style={{ color: '#b700d7' }} />
            <AlertTitle>Progressive Web App (PWA)</AlertTitle>
            <AlertDescription>
              This tool generates configuration files for submitting your PWA to the Google Play Store and Apple App Store.
              No native code required - your web app runs in a native wrapper.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="config" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="config">
                <Settings className="mr-2 h-4 w-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="status">
                <Globe className="mr-2 h-4 w-4" />
                PWA Status
              </TabsTrigger>
              <TabsTrigger value="android">
                <Play className="mr-2 h-4 w-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios">
                <Apple className="mr-2 h-4 w-4" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="guide">
                <FileCode2 className="mr-2 h-4 w-4" />
                Submission Guide
              </TabsTrigger>
              <TabsTrigger value="zapstore" className="relative">
                <Store className="mr-2 h-4 w-4" />
                Zapstore
                <Badge className="ml-1 text-xs px-1 py-0" style={{ backgroundColor: '#f7931a', color: 'white' }}>⚡</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Configure your app's identity and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appName">App Name</Label>
                      <Input
                        id="appName"
                        value={config.appName}
                        onChange={(e) => updateConfig('appName', e.target.value)}
                        placeholder="TravelTelly"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shortName">Short Name</Label>
                      <Input
                        id="shortName"
                        value={config.shortName}
                        onChange={(e) => updateConfig('shortName', e.target.value)}
                        placeholder="TravelTelly"
                        maxLength={12}
                      />
                      <p className="text-xs text-muted-foreground">Max 12 characters for home screen</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) => updateConfig('description', e.target.value)}
                      placeholder="Describe your app..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Website URL</Label>
                    <Input
                      id="siteUrl"
                      value={config.siteUrl}
                      onChange={(e) => updateConfig('siteUrl', e.target.value)}
                      placeholder="https://traveltelly.diy"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Display & Appearance
                  </CardTitle>
                  <CardDescription>
                    Configure how your app looks and behaves
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="themeColor">Theme Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="themeColor"
                          type="color"
                          value={config.themeColor}
                          onChange={(e) => updateConfig('themeColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={config.themeColor}
                          onChange={(e) => updateConfig('themeColor', e.target.value)}
                          placeholder="#b700d7"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={config.backgroundColor}
                          onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={config.backgroundColor}
                          onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                          placeholder="#f4f4f5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display">Display Mode</Label>
                      <Select value={config.display} onValueChange={(value) => updateConfig('display', value)}>
                        <SelectTrigger id="display">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standalone">Standalone (Recommended)</SelectItem>
                          <SelectItem value="fullscreen">Fullscreen</SelectItem>
                          <SelectItem value="minimal-ui">Minimal UI</SelectItem>
                          <SelectItem value="browser">Browser</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orientation">Orientation</Label>
                      <Select value={config.orientation} onValueChange={(value) => updateConfig('orientation', value)}>
                        <SelectTrigger id="orientation">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any (Recommended)</SelectItem>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Package Information
                  </CardTitle>
                  <CardDescription>
                    Platform-specific identifiers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageName">Android Package Name</Label>
                    <Input
                      id="packageName"
                      value={config.packageName}
                      onChange={(e) => updateConfig('packageName', e.target.value)}
                      placeholder="com.traveltelly.app"
                    />
                    <p className="text-xs text-muted-foreground">Must be unique on Google Play Store</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="versionCode">Version Code</Label>
                      <Input
                        id="versionCode"
                        value={config.versionCode}
                        onChange={(e) => updateConfig('versionCode', e.target.value)}
                        placeholder="1"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="versionName">Version Name</Label>
                      <Input
                        id="versionName"
                        value={config.versionName}
                        onChange={(e) => updateConfig('versionName', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bundleId">iOS Bundle ID</Label>
                    <Input
                      id="bundleId"
                      value={config.bundleId}
                      onChange={(e) => updateConfig('bundleId', e.target.value)}
                      placeholder="com.traveltelly.app"
                    />
                    <p className="text-xs text-muted-foreground">Must match your Apple Developer account</p>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleGeneratePWA} 
                    disabled={generating}
                    className="w-full"
                    size="lg"
                    style={{ backgroundColor: '#b700d7' }}
                  >
                    {generating ? (
                      <>
                        <Wrench className="mr-2 h-5 w-5 animate-spin" />
                        Generating Configuration...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Generate PWA Configuration
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PWA Status Tab */}
            <TabsContent value="status" className="space-y-6">
              <PWAStatus />
            </TabsContent>

            {/* Android Tab */}
            <TabsContent value="android" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-600" />
                    Android App Package
                  </CardTitle>
                  <CardDescription>
                    Generate files needed for Google Play Store submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>What you'll need:</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Google Play Console account ($25 one-time fee)</li>
                        <li>Web Manifest file (generated below)</li>
                        <li>Digital Asset Links file (for TWA)</li>
                        <li>App icons (192x192 and 512x512)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Web App Manifest</h3>
                        <p className="text-sm text-muted-foreground">manifest.webmanifest</p>
                      </div>
                      <Button onClick={handleDownloadManifest} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Digital Asset Links</h3>
                        <p className="text-sm text-muted-foreground">assetlinks.json</p>
                      </div>
                      <Button onClick={handleDownloadAssetLinks} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Using PWABuilder (Recommended)</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">PWABuilder.com</a></li>
                        <li>Enter your website URL: <code className="bg-blue-100 px-1 rounded">{config.siteUrl}</code></li>
                        <li>Click "Package for Stores" → "Android"</li>
                        <li>Choose "Trusted Web Activity" (TWA)</li>
                        <li>Upload to Google Play Console</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-purple-50 border-purple-200">
                    <Info className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-900">Alternative: Bubblewrap</AlertTitle>
                    <AlertDescription className="text-purple-800">
                      <p className="mt-2">Command-line tool for building TWAs:</p>
                      <pre className="bg-purple-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                        npx @bubblewrap/cli init --manifest={config.siteUrl}/manifest.webmanifest
                      </pre>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* iOS Tab */}
            <TabsContent value="ios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5" />
                    iOS App Package
                  </CardTitle>
                  <CardDescription>
                    Generate files needed for Apple App Store submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>What you'll need:</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Apple Developer account ($99/year)</li>
                        <li>Web Manifest file (generated below)</li>
                        <li>Apple App Site Association file</li>
                        <li>App icons and launch screens</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Web App Manifest</h3>
                        <p className="text-sm text-muted-foreground">manifest.webmanifest</p>
                      </div>
                      <Button onClick={handleDownloadManifest} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Apple App Site Association</h3>
                        <p className="text-sm text-muted-foreground">apple-app-site-association</p>
                      </div>
                      <Button onClick={handleDownloadAppleAssociation} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Using PWABuilder (Recommended)</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">PWABuilder.com</a></li>
                        <li>Enter your website URL: <code className="bg-blue-100 px-1 rounded">{config.siteUrl}</code></li>
                        <li>Click "Package for Stores" → "iOS"</li>
                        <li>Download the generated Xcode project</li>
                        <li>Open in Xcode and submit to App Store Connect</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Note</AlertTitle>
                    <AlertDescription>
                      Apple has strict guidelines for web-based apps. Ensure your PWA:
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Works offline with Service Workers</li>
                        <li>Has native-like UI and interactions</li>
                        <li>Provides unique value beyond a website</li>
                        <li>Uses platform-specific features where possible</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Submission Guide Tab */}
            <TabsContent value="guide" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode2 className="w-5 h-5" />
                    Step-by-Step Submission Guide
                  </CardTitle>
                  <CardDescription>
                    Complete guide to submitting your PWA to app stores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prerequisites */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Prerequisites
                    </h3>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Required</Badge>
                        <span>Your PWA must be live and accessible via HTTPS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Required</Badge>
                        <span>Valid SSL certificate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Required</Badge>
                        <span>Service Worker for offline functionality</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Recommended</Badge>
                        <span>Web App Manifest with all required fields</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Play Store */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-600" />
                      Google Play Store (Android)
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">1. Create Developer Account</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Visit <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="underline">Google Play Console</a></li>
                          <li>• Pay $25 one-time registration fee</li>
                          <li>• Complete verification process</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">2. Generate TWA Package</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Use PWABuilder or Bubblewrap (see Android tab)</li>
                          <li>• Upload assetlinks.json to <code>/.well-known/assetlinks.json</code></li>
                          <li>• Generate signed APK or AAB file</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">3. Create App Listing</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Upload app bundle (AAB file)</li>
                          <li>• Add screenshots (phone, tablet, optional)</li>
                          <li>• Write store description</li>
                          <li>• Set content rating</li>
                          <li>• Configure pricing and distribution</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">4. Submit for Review</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Review takes 1-7 days typically</li>
                          <li>• Address any policy violations</li>
                          <li>• App goes live after approval</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Apple App Store */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Apple className="w-5 h-5" />
                      Apple App Store (iOS)
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">1. Join Apple Developer Program</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Visit <a href="https://developer.apple.com" target="_blank" rel="noopener noreferrer" className="underline">developer.apple.com</a></li>
                          <li>• Pay $99/year membership fee</li>
                          <li>• Complete enrollment verification</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">2. Generate iOS Package</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Use PWABuilder to generate Xcode project</li>
                          <li>• Upload apple-app-site-association to <code>/.well-known/</code></li>
                          <li>• Configure app icons and launch screens</li>
                          <li>• Requires macOS with Xcode installed</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">3. App Store Connect</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Create new app in App Store Connect</li>
                          <li>• Configure bundle ID: <code className="text-xs">{config.bundleId}</code></li>
                          <li>• Add screenshots (iPhone, iPad optional)</li>
                          <li>• Write app description and keywords</li>
                          <li>• Set privacy policy URL</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">4. Submit for Review</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Upload IPA via Xcode or Transporter</li>
                          <li>• Review takes 1-3 days typically</li>
                          <li>• Apple has stricter guidelines than Google</li>
                          <li>• Must provide value beyond mobile website</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Helpful Resources
                    </h3>
                    <div className="space-y-2 pl-7">
                      <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        PWABuilder - Automated PWA to App Store
                      </a>
                      <a href="https://github.com/GoogleChromeLabs/bubblewrap" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Bubblewrap - Google's TWA CLI Tool
                      </a>
                      <a href="https://web.dev/progressive-web-apps/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        web.dev - PWA Documentation
                      </a>
                      <a href="https://developer.android.com/training/articles/app-links" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Android App Links Verification
                      </a>
                      <a href="https://developer.apple.com/documentation/xcode/supporting-associated-domains" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Apple Universal Links Setup
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Zapstore Tab */}
            <TabsContent value="zapstore" className="space-y-6">

              {/* ══════════════════════════════════════════════════════
                  ZAPSTORE SHOWCASE PREVIEW — modelled after zapstore.dev/apps/pub.ditto.app
                  Dark-themed app listing card to preview how TravelTelly will look
                  ══════════════════════════════════════════════════════ */}
              <ZapstoreShowcasePreview zapApp={zapApp} />

              {/* RELAY STATUS CHECKER */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5" style={{ color: '#f7931a' }} />
                      Relay Status — relay.zapstore.dev
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void queryClient.invalidateQueries({ queryKey: ['zapstore-status'] })}
                      disabled={zapstoreStatus.isFetching}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${zapstoreStatus.isFetching ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>Live check of what's currently stored on the Zapstore relay for your pubkey.</CardDescription>
                </CardHeader>
                <CardContent>
                  {zapstoreStatus.isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Querying relay…
                    </div>
                  )}
                  {zapstoreStatus.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{(zapstoreStatus.error as Error).message}</AlertDescription>
                    </Alert>
                  )}
                  {zapstoreStatus.data && (
                    <div className="space-y-3">
                      {/* App event */}
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {zapstoreStatus.data.appEvent
                            ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                            : <AlertCircle className="h-5 w-5 text-red-400" />}
                          <div>
                            <p className="text-sm font-semibold">App Metadata (kind 32267)</p>
                            {zapstoreStatus.data.appEvent && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {zapstoreStatus.data.appEvent.id.slice(0, 24)}…
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={zapstoreStatus.data.appEvent ? 'default' : 'destructive'} className="text-xs">
                          {zapstoreStatus.data.appEvent ? '✅ On relay' : '❌ Not found'}
                        </Badge>
                      </div>

                      {/* Releases */}
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {zapstoreStatus.data.releaseEvents.length > 0
                            ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                            : <AlertCircle className="h-5 w-5 text-red-400" />}
                          <div>
                            <p className="text-sm font-semibold">
                              Releases (kind 30063) — {zapstoreStatus.data.releaseEvents.length} found
                            </p>
                            {zapstoreStatus.data.latestVersion && (
                              <p className="text-xs text-muted-foreground">
                                Latest: <span className="font-semibold text-green-700">v{zapstoreStatus.data.latestVersion}</span>
                                {' · '}all versions: {zapstoreStatus.data.allVersions.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={zapstoreStatus.data.releaseEvents.length > 0 ? 'default' : 'destructive'} className="text-xs">
                          {zapstoreStatus.data.releaseEvents.length > 0 ? '✅ On relay' : '❌ Not found'}
                        </Badge>
                      </div>

                      {/* Assets */}
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {zapstoreStatus.data.assetEvents.length > 0
                            ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                            : <AlertCircle className="h-5 w-5 text-red-400" />}
                          <div>
                            <p className="text-sm font-semibold">
                              Assets (kind 3063) — {zapstoreStatus.data.assetEvents.length} found
                            </p>
                          </div>
                        </div>
                        <Badge variant={zapstoreStatus.data.assetEvents.length > 0 ? 'default' : 'destructive'} className="text-xs">
                          {zapstoreStatus.data.assetEvents.length > 0 ? '✅ On relay' : '❌ Not found'}
                        </Badge>
                      </div>

                      {/* All good — but explain PWA limitation */}
                      {zapstoreStatus.data.appEvent && zapstoreStatus.data.releaseEvents.length > 0 && zapstoreStatus.data.assetEvents.length > 0 && (
                        <Alert className="bg-green-50 border-green-500">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">✅ All 3 events confirmed on relay!</AlertTitle>
                          <AlertDescription className="text-green-700 space-y-2">
                            <p>Your events are on <code>relay.zapstore.dev</code>. However, see the important note below about PWA visibility.</p>
                            <a href="https://zapstore.dev/apps/com.traveltelly.app" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-sm" style={{ color: '#f7931a' }}>
                              zapstore.dev/apps/com.traveltelly.app ↗
                            </a>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* PWA limitation warning */}
                      {zapstoreStatus.data.appEvent && (
                        <Alert className="border-amber-400 bg-amber-50">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertTitle className="text-amber-800">⚠️ Zapstore is currently Android-only</AlertTitle>
                          <AlertDescription className="text-amber-700 space-y-2 text-xs">
                            <p>
                              Zapstore's app store and web UI currently index <strong>Android APK apps only</strong> (platform: <code>android-arm64-v8a</code>).
                              TravelTelly is published as a <strong>PWA</strong> (platform: <code>web</code>) — the Zapstore indexer does not yet surface web apps in search or browse.
                            </p>
                            <p>
                              Per the Zapstore roadmap, <strong>"Web App"</strong> support is coming in the <em>next 2 months</em>.
                              Your events are already on the relay with the correct tags — you're ahead of the curve.
                            </p>
                            <p className="font-semibold">Options right now:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Contact the Zapstore team on Signal to ask about early PWA support</li>
                              <li>Wait for web app support to launch (events already published)</li>
                              <li>Build an Android TWA/APK wrapper using PWABuilder and re-publish as <code>android-arm64-v8a</code></li>
                            </ul>
                            <div className="flex gap-2 flex-wrap pt-1">
                              <a
                                href="https://signal.group/#CjQKIK20nMOglqNT8KYw4ZeyChsvA14TTcjtjuC2VF6j6nB5EhDLZ7pQHvOeopr36jq431ow"
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-white"
                                style={{ backgroundColor: '#3a76f0' }}
                              >
                                <ExternalLink className="w-3 h-3" /> Zapstore User Support (Signal)
                              </a>
                              <a
                                href="https://www.pwabuilder.com"
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border border-amber-500 text-amber-800"
                              >
                                <ExternalLink className="w-3 h-3" /> PWABuilder (make APK)
                              </a>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ══════════════════════════════════════════════════════
                  APK UPLOAD & ONE-CLICK PUBLISH
                  Upload the APK from PWABuilder → upload to cdn.zapstore.dev → publish to relay
                  ══════════════════════════════════════════════════════ */}
              <Card className="border-2" style={{ borderColor: '#f7931a' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Rocket className="w-6 h-6" style={{ color: '#f7931a' }} />
                    <span>APK Upload &amp; Publish to Zapstore</span>
                    <Badge style={{ backgroundColor: '#22c55e', color: 'white' }}>Android ✓</Badge>
                  </CardTitle>
                  <CardDescription>
                    Downloaded your APK from PWABuilder? Drop it here — it gets uploaded to <code>cdn.zapstore.dev</code> and published to the relay in one click. No manual hash computation needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setApkDragOver(true); }}
                    onDragLeave={() => setApkDragOver(false)}
                    onDrop={handleApkDrop}
                    onClick={() => document.getElementById('apk-file-input')?.click()}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                      ${apkDragOver ? 'border-orange-400 bg-orange-50 scale-[1.01]' : apkFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/50'}
                    `}
                  >
                    <input
                      id="apk-file-input"
                      type="file"
                      accept=".apk"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleApkFile(f); }}
                    />
                    {apkFile ? (
                      <div className="space-y-2">
                        <FileUp className="w-10 h-10 mx-auto text-green-600" />
                        <p className="font-semibold text-green-800">{apkFile.name}</p>
                        <p className="text-sm text-green-700">{(apkFile.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 mx-auto text-gray-400" />
                        <p className="font-semibold text-gray-600">Drop your APK here or click to browse</p>
                        <p className="text-sm text-muted-foreground">Accepts .apk files from PWABuilder or any Android build</p>
                      </div>
                    )}
                  </div>

                  {/* Release details */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Version</Label>
                      <Input
                        value={apkVersion}
                        onChange={(e) => setApkVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Version Code</Label>
                      <Input
                        value={apkVersionCode}
                        onChange={(e) => setApkVersionCode(e.target.value)}
                        placeholder="1"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Channel</Label>
                      <Select value={apkChannel} onValueChange={setApkChannel}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">main (stable)</SelectItem>
                          <SelectItem value="beta">beta</SelectItem>
                          <SelectItem value="nightly">nightly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-2">
                      APK Certificate Hash
                      <span className="font-semibold text-red-500">* required</span>
                      {apkCertExtracted && (
                        <span className="flex items-center gap-1 text-green-700 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> auto-extracted
                        </span>
                      )}
                    </Label>
                    <Input
                      value={apkCertHash}
                      onChange={(e) => { setApkCertHash(e.target.value); setApkCertExtracted(''); }}
                      placeholder="Auto-extracted from APK — or paste SHA-256 fingerprint manually"
                      className={`font-mono text-xs ${apkCertExtracted ? 'border-green-400' : !apkCertHash ? 'border-red-300' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">Required by Zapstore relay. Extracted automatically when you drop an APK.</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Release Notes</Label>
                    <Textarea
                      value={apkReleaseNotes}
                      onChange={(e) => setApkReleaseNotes(e.target.value)}
                      placeholder="What's new in this release..."
                      rows={3}
                    />
                  </div>

                  {/* Real progress indicators */}
                  {publishApkRelease.isPending && (
                    <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: '#f7931a22', background: '#fff7ed' }}>
                      <div className="flex items-center gap-2 text-sm font-semibold text-orange-800">
                        <RefreshCw className="h-4 w-4 animate-spin shrink-0" style={{ color: '#f7931a' }} />
                        {apkStage || 'Starting…'}
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-orange-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: '#f7931a',
                            width: apkStage.includes('Done') || apkStage.includes('already on CDN')
                              ? '100%'
                              : apkStage.includes('Uploading')
                              ? `${Math.max(20, apkUploadPct)}%`
                              : apkStage.includes('Publishing')
                              ? '85%'
                              : apkStage.includes('Checking')
                              ? '10%'
                              : apkStage.includes('Hashing')
                              ? '5%'
                              : '3%',
                          }}
                        />
                      </div>
                      {apkStage.includes('Uploading') && apkUploadPct > 0 && (
                        <p className="text-xs text-orange-700">{apkUploadPct}% uploaded — large APKs may take 1–3 minutes</p>
                      )}
                      {/* Step indicators */}
                      <div className="flex gap-4 text-xs">
                        {[
                          { key: 'Hash', label: 'Hash', doneWhen: ['Checking', 'Uploading', 'already on CDN', 'Publishing', 'Done'] },
                          { key: 'Upload', label: 'Upload', doneWhen: ['Publishing', 'Done'] },
                          { key: 'Publish', label: 'Publish', doneWhen: ['Done'] },
                        ].map(({ key, label, doneWhen }) => {
                          const isDone = doneWhen.some(w => apkStage.includes(w));
                          const isActive = apkStage.toLowerCase().includes(key.toLowerCase()) && !isDone;
                          const isSkipped = key === 'Upload' && apkStage.includes('already on CDN');
                          return (
                            <div key={key} className={`flex items-center gap-1.5 font-medium ${isDone || isSkipped ? 'text-green-700' : isActive ? 'text-orange-700' : 'text-orange-300'}`}>
                              {isDone || isSkipped
                                ? <CheckCircle2 className="h-3.5 w-3.5" />
                                : isActive
                                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                : <span className="w-3.5 h-3.5 rounded-full border border-current inline-block" />}
                              {label}{isSkipped ? ' (cached ✓)' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Publish button */}
                  <Button
                    onClick={handleApkPublish}
                    disabled={!apkFile || publishApkRelease.isPending || !user}
                    className="w-full text-base py-6"
                    style={{ backgroundColor: apkFile ? '#f7931a' : undefined }}
                    size="lg"
                  >
                    {publishApkRelease.isPending ? (
                      <><RefreshCw className="mr-2 h-5 w-5 animate-spin" />Uploading &amp; Publishing…</>
                    ) : (
                      <><Rocket className="mr-2 h-5 w-5" />Upload APK &amp; Publish to Zapstore</>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">You must be logged in with your Nostr extension to sign and publish.</p>
                  )}

                  {/* Error */}
                  {publishApkRelease.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Publish Failed</AlertTitle>
                      <AlertDescription>
                        <p className="font-mono text-xs break-all mt-1">{(publishApkRelease.error as Error)?.message}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success */}
                  {apkResult && (
                    <Alert className="bg-green-50 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">🎉 APK Published to Zapstore!</AlertTitle>
                      <AlertDescription className="text-green-700 space-y-2 text-xs">
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold shrink-0">APK URL:</span>
                            <a href={apkResult.url} target="_blank" rel="noopener noreferrer" className="font-mono underline truncate">{apkResult.url}</a>
                            <Button size="sm" variant="ghost" className="h-5 w-5 p-0 shrink-0" onClick={() => navigator.clipboard.writeText(apkResult.url)}><Copy className="h-3 w-3" /></Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold shrink-0">SHA-256:</span>
                            <span className="font-mono truncate">{apkResult.sha256}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold shrink-0">Cert hash:</span>
                            <span className="font-mono truncate">{apkResult.certFingerprint}</span>
                            <Button size="sm" variant="ghost" className="h-5 w-5 p-0 shrink-0" onClick={() => navigator.clipboard.writeText(apkResult.certFingerprint)}><Copy className="h-3 w-3" /></Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold shrink-0">Asset event:</span>
                            <span className="font-mono truncate">{apkResult.assetEventId}</span>
                            <Button size="sm" variant="ghost" className="h-5 w-5 p-0 shrink-0" onClick={() => navigator.clipboard.writeText(apkResult.assetEventId)}><Copy className="h-3 w-3" /></Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold shrink-0">Release event:</span>
                            <span className="font-mono truncate">{apkResult.releaseEventId}</span>
                            <Button size="sm" variant="ghost" className="h-5 w-5 p-0 shrink-0" onClick={() => navigator.clipboard.writeText(apkResult.releaseEventId)}><Copy className="h-3 w-3" /></Button>
                          </div>
                        </div>
                        <div className="pt-1 flex gap-2">
                          <a href="https://zapstore.dev/apps/com.traveltelly.app" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#f7931a' }}>
                            View on zapstore.dev ↗
                          </a>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* How it works */}
              <Alert style={{ borderColor: '#f7931a', backgroundColor: '#fff7ed' }}>
                <Info className="h-4 w-4" style={{ color: '#f7931a' }} />
                <AlertTitle>3-Step Publishing Process</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={publishStep === 'app' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'bg-green-50 border-green-500 text-green-700'}>
                      1. App Metadata (kind 32267)
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className={publishStep === 'asset' ? 'border-orange-500 text-orange-700 bg-orange-50' : publishedAssetId ? 'bg-green-50 border-green-500 text-green-700' : ''}>
                      2. Asset Info (kind 3063)
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className={publishStep === 'release' ? 'border-orange-500 text-orange-700 bg-orange-50' : ''}>
                      3. Release (kind 30063)
                    </Badge>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground">Publish in order: App → Asset → Release. All events are signed by your Nostr identity.</p>
                </AlertDescription>
              </Alert>

              {/* WHY IS MY APP NOT SHOWING — complete checklist */}
              {/* STEP 1 — App Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: '#f7931a', color: 'white' }}>Step 1</Badge>
                    App Metadata
                    <code className="text-xs text-muted-foreground bg-muted px-1 rounded">kind: 32267</code>
                  </CardTitle>
                  <CardDescription>
                    Publishes your app's identity to Zapstore — name, icon, description, categories, and supported platforms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Package Name (d tag)</Label>
                      <Input
                        value={zapApp.packageName}
                        onChange={(e) => updateZapApp('packageName', e.target.value)}
                        placeholder="com.traveltelly.app"
                      />
                      <p className="text-xs text-muted-foreground">Unique identifier e.g. com.yourapp.id</p>
                    </div>
                    <div className="space-y-2">
                      <Label>App Name</Label>
                      <Input
                        value={zapApp.name}
                        onChange={(e) => updateZapApp('name', e.target.value)}
                        placeholder="TravelTelly"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary (one-liner)</Label>
                    <Input
                      value={zapApp.summary}
                      onChange={(e) => updateZapApp('summary', e.target.value)}
                      placeholder="Short description of your app"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Description (Markdown supported)</Label>
                    <Textarea
                      value={zapApp.description}
                      onChange={(e) => updateZapApp('description', e.target.value)}
                      rows={4}
                      placeholder="Full app description..."
                    />
                  </div>

                  {/* ── Icon Upload ─────────────────────────────────── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        App Icon
                        <span className="text-xs text-muted-foreground font-normal">PNG recommended 512×512</span>
                      </Label>
                      <input ref={iconInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleIconFile(f); e.target.value = ''; }} />
                      <div
                        className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all flex items-center gap-4 p-3 ${iconDragOver ? 'border-orange-400 bg-orange-50 scale-[1.01]' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40'}`}
                        onClick={() => iconInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIconDragOver(true); }}
                        onDragLeave={() => setIconDragOver(false)}
                        onDrop={e => { e.preventDefault(); setIconDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleIconFile(f); }}
                      >
                        {/* Preview */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border shrink-0 flex items-center justify-center">
                          {zapApp.icon ? (
                            <img src={zapApp.icon} alt="icon" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display='none')} />
                          ) : (
                            <Upload className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {iconUploading ? (
                            <div className="flex items-center gap-2 text-sm text-orange-700 font-medium">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading…
                            </div>
                          ) : zapApp.icon ? (
                            <>
                              <p className="text-xs font-semibold text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</p>
                              <p className="text-xs text-muted-foreground truncate">{zapApp.icon.split('/').pop()}</p>
                              <p className="text-xs text-orange-600 mt-0.5">Click to replace</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-gray-600">Drop icon here</p>
                              <p className="text-xs text-muted-foreground">or click to browse</p>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Manual URL fallback */}
                      <Input
                        value={zapApp.icon}
                        onChange={e => updateZapApp('icon', e.target.value)}
                        placeholder="Or paste URL directly"
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>License (SPDX)</Label>
                      <Input
                        value={zapApp.license}
                        onChange={(e) => updateZapApp('license', e.target.value)}
                        placeholder="MIT"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Repository URL</Label>
                      <Input
                        value={zapApp.repository}
                        onChange={(e) => updateZapApp('repository', e.target.value)}
                        placeholder="https://github.com/bitpopart/traveltelly"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website URL</Label>
                      <Input
                        value={zapApp.website}
                        onChange={(e) => updateZapApp('website', e.target.value)}
                        placeholder="https://traveltelly.diy"
                      />
                    </div>
                  </div>

                  {/* ── Screenshot Upload ────────────────────────────── */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Screenshots
                      <span className="text-xs text-muted-foreground font-normal">Up to 8 · portrait preferred</span>
                    </Label>
                    <input ref={screenshotInputRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => { const files = Array.from(e.target.files ?? []); if (files.length) handleScreenshotFiles(files); e.target.value = ''; }} />

                    {/* Drop zone */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${screenshotDragOver ? 'border-orange-400 bg-orange-50 scale-[1.01]' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40'} ${screenshotUploading !== null ? 'pointer-events-none' : ''}`}
                      onClick={() => screenshotInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setScreenshotDragOver(true); }}
                      onDragLeave={() => setScreenshotDragOver(false)}
                      onDrop={e => { e.preventDefault(); setScreenshotDragOver(false); handleScreenshotFiles(Array.from(e.dataTransfer.files)); }}
                    >
                      {screenshotUploading !== null ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-orange-700 font-medium py-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Uploading screenshot {screenshotUploading + 1}…
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-1">
                          <Upload className="h-4 w-4" />
                          Drop screenshots here or click to browse — select multiple at once
                        </div>
                      )}
                    </div>

                    {/* Thumbnail grid */}
                    {zapApp.images.filter(Boolean).length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {zapApp.images.filter(Boolean).map((url, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border bg-muted aspect-[9/16]">
                            <img
                              src={url}
                              alt={`Screenshot ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={e => { (e.currentTarget as HTMLImageElement).src = ''; }}
                            />
                            {/* Overlay with index + delete */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-1.5">
                              <span className="text-white text-xs font-bold bg-black/50 rounded px-1.5 py-0.5">#{idx + 1}</span>
                              <button
                                onClick={e => { e.stopPropagation(); removeScreenshot(idx); }}
                                className="rounded-full bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                                title="Remove"
                              >✕</button>
                            </div>
                          </div>
                        ))}
                        {/* Add more slot */}
                        {zapApp.images.filter(Boolean).length < 8 && (
                          <div
                            onClick={() => screenshotInputRef.current?.click()}
                            className="aspect-[9/16] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition-all"
                          >
                            <span className="text-2xl text-muted-foreground">+</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Count badge */}
                    {zapApp.images.filter(Boolean).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {zapApp.images.filter(Boolean).length} screenshot{zapApp.images.filter(Boolean).length !== 1 ? 's' : ''} · hover to remove
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category Tags (comma-separated)</Label>
                      <Input
                        value={zapApp.tags.join(', ')}
                        onChange={(e) => updateZapApp('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        placeholder="travel, nostr, photography"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Android ABI Platforms (f tags)</Label>
                      <Input
                        value={zapApp.platforms.join(', ')}
                        onChange={(e) => updateZapApp('platforms', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        placeholder="android-arm64-v8a, android-armeabi-v7a, android-x86, android-x86_64"
                      />
                      <p className="text-xs text-muted-foreground">
                        Android ABIs as <code>f</code> tags — same as Ditto: <code>android-arm64-v8a</code>, <code>android-armeabi-v7a</code>, <code>android-x86</code>, <code>android-x86_64</code>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Supported NIPs (comma-separated, for Nostr clients)</Label>
                    <Input
                      value={zapApp.supportedNips.join(', ')}
                      onChange={(e) => updateZapApp('supportedNips', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      placeholder="01, 07, 23, 57, 99"
                    />
                  </div>

                  <Button
                    onClick={handlePublishApp}
                    disabled={publishApp.isPending || !user}
                    className="w-full"
                    style={{ backgroundColor: '#f7931a' }}
                  >
                    {publishApp.isPending ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Publishing App Metadata...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Publish App Metadata (kind 32267)</>
                    )}
                  </Button>

                  {publishApp.isSuccess && (
                    <Alert className="bg-green-50 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">App Metadata Published!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-green-100 px-1 rounded break-all">{publishApp.data?.id}</code>
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(publishApp.data?.id ?? '')}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="mt-1">Now proceed to publish the Asset in Step 2.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {publishApp.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>App Publish Failed</AlertTitle>
                      <AlertDescription>
                        <p className="font-mono text-xs break-all mt-1">{(publishApp.error as Error)?.message}</p>
                        <p className="mt-2 text-xs">Tip: Check the browser console for relay NOTICE messages.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* STEP 2 — Asset */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: '#f7931a', color: 'white' }}>Step 2</Badge>
                    Software Asset
                    <code className="text-xs text-muted-foreground bg-muted px-1 rounded">kind: 3063</code>
                  </CardTitle>
                  <CardDescription>
                    Describes the binary or web asset — URL, hash, size, platform. For PWAs use <code>text/html</code> as MIME type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input
                        value={zapAsset.packageName}
                        onChange={(e) => updateZapAsset('packageName', e.target.value)}
                        placeholder="com.traveltelly.app"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version</Label>
                      <Input
                        value={zapAsset.version}
                        onChange={(e) => updateZapAsset('version', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version Code</Label>
                      <Input
                        value={zapAsset.versionCode}
                        onChange={(e) => updateZapAsset('versionCode', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Asset URL</Label>
                      <Input
                        value={zapAsset.url}
                        onChange={(e) => updateZapAsset('url', e.target.value)}
                        placeholder="https://traveltelly.diy or URL to APK"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>MIME Type</Label>
                      <Select value={zapAsset.mimeType} onValueChange={(v) => updateZapAsset('mimeType', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text/html">text/html (PWA / Web App)</SelectItem>
                          <SelectItem value="application/vnd.android.package-archive">application/vnd.android.package-archive (APK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SHA-256 + auto-compute */}
                  <div className="space-y-2">
                    <Label>
                      SHA-256 Hash <span className="text-red-500 text-xs font-semibold">* required by relay</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={zapAsset.sha256}
                        onChange={(e) => updateZapAsset('sha256', e.target.value)}
                        placeholder="e3b0c44298fc1c149afbf4c8996fb924..."
                        className={!zapAsset.sha256 ? 'border-red-300' : 'border-green-400'}
                        readOnly={hashingUrl}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleComputeHash}
                        disabled={hashingUrl || !zapAsset.url}
                        className="shrink-0 whitespace-nowrap"
                        title="Fetch URL and compute SHA-256 automatically"
                      >
                        {hashingUrl
                          ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Computing…</>
                          : <><RefreshCw className="mr-2 h-4 w-4" />Auto-compute</>
                        }
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click <strong>Auto-compute</strong> to fetch the URL and calculate the hash automatically. Required for all asset types.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>File Size (bytes) <span className="text-muted-foreground text-xs">(auto-filled by compute)</span></Label>
                    <Input
                      value={zapAsset.size}
                      onChange={(e) => updateZapAsset('size', e.target.value)}
                      placeholder="auto-filled after computing hash"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={zapAsset.platform} onValueChange={(v) => updateZapAsset('platform', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">web (PWA)</SelectItem>
                        <SelectItem value="android-arm64-v8a">android-arm64-v8a</SelectItem>
                        <SelectItem value="android-universal">android-universal</SelectItem>
                        <SelectItem value="android-armeabi-v7a">android-armeabi-v7a</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {zapAsset.mimeType === 'application/vnd.android.package-archive' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>APK Certificate Hash</Label>
                        <Input
                          value={zapAsset.apkCertHash}
                          onChange={(e) => updateZapAsset('apkCertHash', e.target.value)}
                          placeholder="SHA-256 fingerprint"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Android SDK</Label>
                        <Input
                          value={zapAsset.minPlatformVersion}
                          onChange={(e) => updateZapAsset('minPlatformVersion', e.target.value)}
                          placeholder="21"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Android SDK</Label>
                        <Input
                          value={zapAsset.targetPlatformVersion}
                          onChange={(e) => updateZapAsset('targetPlatformVersion', e.target.value)}
                          placeholder="34"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePublishAsset}
                    disabled={publishAsset.isPending || !user}
                    className="w-full"
                    style={{ backgroundColor: '#f7931a' }}
                  >
                    {publishAsset.isPending ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Publishing Asset...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Publish Asset (kind 3063)</>
                    )}
                  </Button>

                  {publishAsset.isSuccess && (
                    <Alert className="bg-green-50 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Asset Published!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-green-100 px-1 rounded break-all">{publishedAssetId}</code>
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(publishedAssetId)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="mt-1">Asset event ID copied to Release form. Now publish the Release in Step 3.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {publishAsset.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Asset Publish Failed</AlertTitle>
                      <AlertDescription>
                        <p className="font-mono text-xs break-all mt-1">{(publishAsset.error as Error)?.message}</p>
                        <p className="mt-2 text-xs">Tip: Check the browser console for relay NOTICE messages with more details.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* STEP 3 — Release */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: '#f7931a', color: 'white' }}>Step 3</Badge>
                    Software Release
                    <code className="text-xs text-muted-foreground bg-muted px-1 rounded">kind: 30063</code>
                  </CardTitle>
                  <CardDescription>
                    Ties together the app and asset into a versioned release with release notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input
                        value={zapRelease.packageName}
                        onChange={(e) => updateZapRelease('packageName', e.target.value)}
                        placeholder="com.traveltelly.app"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version</Label>
                      <Input
                        value={zapRelease.version}
                        onChange={(e) => updateZapRelease('version', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <Select value={zapRelease.channel} onValueChange={(v) => updateZapRelease('channel', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">main (stable)</SelectItem>
                          <SelectItem value="beta">beta</SelectItem>
                          <SelectItem value="nightly">nightly</SelectItem>
                          <SelectItem value="dev">dev</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset Event ID (from Step 2)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={zapRelease.assetEventId}
                        onChange={(e) => updateZapRelease('assetEventId', e.target.value)}
                        placeholder="Automatically filled after Step 2..."
                      />
                      {publishedAssetId && (
                        <Button variant="outline" size="sm" onClick={() => updateZapRelease('assetEventId', publishedAssetId)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Auto-filled when you complete Step 2, or paste manually</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Release Notes</Label>
                    <Textarea
                      value={zapRelease.releaseNotes}
                      onChange={(e) => updateZapRelease('releaseNotes', e.target.value)}
                      rows={4}
                      placeholder="What's new in this release..."
                    />
                  </div>

                  <Button
                    onClick={handlePublishRelease}
                    disabled={publishRelease.isPending || !user}
                    className="w-full"
                    size="lg"
                    style={{ backgroundColor: '#f7931a' }}
                  >
                    {publishRelease.isPending ? (
                      <><RefreshCw className="mr-2 h-5 w-5 animate-spin" />Publishing Release...</>
                    ) : (
                      <><Zap className="mr-2 h-5 w-5" />Publish Release to Zapstore (kind 30063)</>
                    )}
                  </Button>

                  {publishRelease.isSuccess && (
                    <Alert className="bg-green-50 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">🎉 Release published to relay.zapstore.dev!</AlertTitle>
                      <AlertDescription className="text-green-700 space-y-2 text-xs">
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-green-100 px-1 rounded break-all">{publishRelease.data?.id}</code>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <a href={`https://zapstore.dev/apps/${zapRelease.packageName}`} target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#f7931a' }}>
                            View on zapstore.dev ↗
                          </a>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* VERSION HISTORY & NEW VERSION */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" style={{ color: '#f7931a' }} />
                    Version History &amp; Publish New Version
                  </CardTitle>
                  <CardDescription>
                    See all published releases on the relay. To ship a new version, click "Publish New Version" — it pre-fills the version fields and takes you straight to Asset → Release.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {zapstoreStatus.isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Loading version history…
                    </div>
                  )}

                  {zapstoreStatus.data && zapstoreStatus.data.releaseEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground">No releases found on relay yet. Complete the 3-step publish above first.</p>
                  )}

                  {zapstoreStatus.data && zapstoreStatus.data.releaseEvents.length > 0 && (
                    <div className="space-y-2">
                      {zapstoreStatus.data.releaseEvents.map((rel) => {
                        const version = getTag(rel, 'version');
                        const channel = getTag(rel, 'c');
                        const date = new Date(rel.created_at * 1000).toLocaleDateString();
                        const assetRef = rel.tags.find(([t]) => t === 'e')?.[1];
                        const matchedAsset = zapstoreStatus.data?.assetEvents.find(a => a.id === assetRef);
                        const assetUrl = matchedAsset ? getTag(matchedAsset, 'url') : '';

                        return (
                          <div key={rel.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-mono">v{version}</Badge>
                                <Badge variant="secondary" className="text-xs">{channel || 'main'}</Badge>
                                <span className="text-xs text-muted-foreground">{date}</span>
                              </div>
                              {rel.content && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{rel.content}</p>
                              )}
                              {assetUrl && (
                                <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">{assetUrl}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(rel.id);
                                  toast({ title: 'Copied', description: 'Event ID copied' });
                                }}
                                title="Copy event ID"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Publish new version button */}
                  {zapstoreStatus.data && zapstoreStatus.data.latestVersion && (
                    <div className="pt-2 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">Publish New Version</p>
                          <p className="text-xs text-muted-foreground">
                            Current latest: <span className="font-mono font-semibold">v{zapstoreStatus.data.latestVersion}</span>
                            {' → '}
                            <span className="font-mono font-semibold text-orange-600">
                              v{zapstoreStatus.data.latestVersion.split('.').map((p, i, arr) =>
                                i === arr.length - 1 ? String(Number(p) + 1) : p
                              ).join('.')}
                            </span>
                          </p>
                        </div>
                        <Button
                          onClick={() => handleBumpVersion(zapstoreStatus.data?.latestVersion ?? '1.0.0')}
                          style={{ backgroundColor: '#f7931a' }}
                          size="sm"
                        >
                          <Zap className="mr-1 h-4 w-4" />
                          Prepare New Version
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This pre-fills the version number and clears the SHA-256 field. Then: auto-compute the hash → publish Asset → publish Release.
                        The App Metadata (kind 32267) only needs to be re-published if name/description/icon changed.
                      </p>
                    </div>
                  )}

                  {/* Manual version override */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground font-semibold mb-2">Or set version manually:</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. 1.2.0"
                        value={zapRelease.version}
                        onChange={(e) => {
                          updateZapRelease('version', e.target.value);
                          updateZapAsset('version', e.target.value);
                        }}
                        className="max-w-32 font-mono"
                      />
                      <Input
                        placeholder="version code e.g. 2"
                        value={zapAsset.versionCode}
                        onChange={(e) => updateZapAsset('versionCode', e.target.value)}
                        className="max-w-32 font-mono"
                      />
                      <Button variant="outline" size="sm" onClick={() => {
                        setPublishedAssetId('');
                        setZapRelease(prev => ({ ...prev, assetEventId: '' }));
                        setPublishStep('asset');
                        toast({ title: '✅ Ready', description: `Set to v${zapRelease.version} — now publish Asset then Release above` });
                      }}>
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Set &amp; Go to Asset Step
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources & Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Zapstore Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href="https://zapstore.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline" style={{ color: '#f7931a' }}>
                    <Store className="w-4 h-4" />
                    zapstore.dev — Browse the Nostr app store
                  </a>
                  <a href="https://github.com/zapstore/zsp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Code className="w-4 h-4" />
                    github.com/zapstore/zsp — CLI publishing tool
                  </a>
                  <a href="https://github.com/zapstore/zapstore" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    github.com/zapstore/zapstore — Android app source
                  </a>
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">NIP-82 Event Kinds Used:</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div><code>32267</code> — Software Application (app metadata, addressable)</div>
                      <div><code>3063</code> — Software Asset (binary/PWA details, regular)</div>
                      <div><code>30063</code> — Software Release (version + release notes, addressable)</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Published to: <code>wss://relay.zapstore.dev</code></p>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
