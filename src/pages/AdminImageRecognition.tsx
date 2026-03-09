import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useToast } from '@/hooks/useToast';

import { extractPhotoMetadata } from '@/lib/exifUtils';
import { reverseGeocode } from '@/lib/reverseGeocode';
import { analyzeImageWithAI, getStoredApiKey, setStoredApiKey } from '@/lib/aiImageRecognition';
import { embedMetadataIntoJpeg } from '@/lib/imageMetadataWriter';

import {
  ArrowLeft, Shield, Upload, Sparkles, MapPin, Tag,
  FileImage, Download, Save, Loader2, X, CheckCircle2,
  Camera, Eye, Key, RefreshCw, Info,
} from 'lucide-react';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX  = nip19.decode(ADMIN_NPUB).data as string;

interface Photo {
  id: number;
  file: File;
  preview: string;
  title: string;
  description: string;
  tags: string[];
  city: string;
  country: string;
  lat?: number;
  lon?: number;
  processed: boolean;
  processing: boolean;
  processStep: string;
  downloading: boolean;
}

let nextId = 1;

export default function AdminImageRecognition() {
  const { user }                      = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { toast }                     = useToast();
  const navigate                      = useNavigate();

  // photos is stored BOTH in state (for render) AND in a ref (for async callbacks)
  const [photos, setPhotosState]      = useState<Photo[]>([]);
  const photosRef                     = useRef<Photo[]>([]);

  const [apiKey, setApiKey]           = useState(getStoredApiKey);
  const [apiKeySaved, setApiKeySaved] = useState(!!getStoredApiKey());
  const [showKey, setShowKey]         = useState(false);
  const [tagInput, setTagInput]       = useState<Record<number, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // ── keep state and ref in sync ──────────────────────────────────────────────
  function setPhotos(fn: (prev: Photo[]) => Photo[]) {
    setPhotosState(prev => {
      const next = fn(prev);
      photosRef.current = next;
      return next;
    });
  }

  function patchPhoto(id: number, patch: Partial<Photo>) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  // ── upload ──────────────────────────────────────────────────────────────────
  function addFiles(files: FileList | null) {
    if (!files) return;
    const added: Photo[] = Array.from(files).map(f => ({
      id: nextId++,
      file: f,
      preview: URL.createObjectURL(f),
      title: '', description: '', tags: [],
      city: '', country: '',
      processed: false, processing: false,
      processStep: '', downloading: false,
    }));
    setPhotos(prev => [...prev, ...added]);
  }

  function removePhoto(id: number) {
    setPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.preview);
      return prev.filter(x => x.id !== id);
    });
  }

  // ── process ─────────────────────────────────────────────────────────────────
  async function processPhoto(id: number) {
    const photo = photosRef.current.find(p => p.id === id);
    if (!photo || photo.processing) return;

    patchPhoto(id, { processing: true, processStep: 'Reading EXIF…' });

    // Step 1: EXIF
    const exif = await extractPhotoMetadata(photo.file);
    patchPhoto(id, { processStep: 'Geocoding GPS…' });

    // Step 2: Reverse geocode
    let city = '', country = '';
    let lat = exif.gps?.latitude;
    let lon = exif.gps?.longitude;
    if (exif.gps) {
      const geo = await reverseGeocode(exif.gps.latitude, exif.gps.longitude);
      city    = geo.city    ?? '';
      country = geo.country ?? '';
    }
    patchPhoto(id, { processStep: 'AI recognition…', lat, lon, city, country });

    // Step 3: AI
    const ai = await analyzeImageWithAI(
      photo.file,
      city || country ? { city, country } : undefined
    );
    patchPhoto(id, { processStep: '' });

    // Build final fields
    const locationStr = [city, country].filter(Boolean).join(', ');
    const title = ai.title || exif.title || (locationStr ? `Travel Photo – ${locationStr}` : photo.file.name.replace(/\.[^.]+$/, ''));
    const description = ai.description || exif.description || (locationStr ? `Photo taken in ${locationStr}.` : '');
    const tagSet = new Set([...(ai.tags ?? []), ...(exif.keywords ?? []), 'travel', 'photography']);
    if (city)    tagSet.add(city.toLowerCase());
    if (country) tagSet.add(country.toLowerCase());

    patchPhoto(id, {
      title, description,
      tags: [...tagSet].filter(Boolean),
      processed: true, processing: false,
    });

    toast({ title: 'Done ✓', description: ai.aiGenerated ? 'Claude AI tagging complete.' : 'EXIF + GPS extracted.' });
  }

  // ── download ────────────────────────────────────────────────────────────────
  async function downloadPhoto(id: number) {
    // Always read from ref — never from stale closure
    const photo = photosRef.current.find(p => p.id === id);
    if (!photo) {
      console.error('[Download] photo not found, id=', id);
      toast({ title: 'Error', description: 'Photo not found.', variant: 'destructive' });
      return;
    }

    console.log('[Download] id=%d file=%s title=%s', id, photo.file.name, photo.title);
    patchPhoto(id, { downloading: true });

    try {
      const blob = await embedMetadataIntoJpeg(photo.file, {
        title:       photo.title       || 'Travel Photo',
        description: photo.description || '',
        keywords:    photo.tags.length ? photo.tags : ['travel'],
        latitude:    photo.lat,
        longitude:   photo.lon,
        city:        photo.city    || undefined,
        country:     photo.country || undefined,
      });

      const ext      = photo.file.name.match(/\.[^.]+$/)?.[0] ?? '.jpg';
      const safeName = (photo.title || photo.file.name.replace(/\.[^.]+$/, ''))
        .replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 60);
      const filename = `${safeName}${ext}`;

      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      toast({ title: '✅ Downloaded', description: `${filename} with embedded metadata.` });
    } catch (err) {
      console.error('[Download] error:', err);
      toast({ title: 'Failed', description: String(err), variant: 'destructive' });
    } finally {
      patchPhoto(id, { downloading: false });
    }
  }

  // ── access guard ────────────────────────────────────────────────────────────
  if (isCheckingPermission) return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
        <p>Checking permissions…</p>
      </div>
    </div>
  );

  if (!isAdmin || !isTraveltellyAdmin) return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-6">Admin only.</p>
            <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Panel
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Image Recognition</h1>
              <p className="text-muted-foreground">Upload photos → AI generates title, description &amp; tags → embed into photo → download</p>
            </div>
          </div>
        </div>

        {/* API Key */}
        <Card className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="w-4 h-4" /> Anthropic API Key
            </CardTitle>
            <CardDescription>Enter your key to enable Claude vision. Without it, only EXIF + GPS is used.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setApiKeySaved(false); }}
                  placeholder="sk-ant-..."
                  className="pr-10 font-mono text-sm"
                />
                <button type="button" onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={() => { setStoredApiKey(apiKey.trim()); setApiKeySaved(true); toast({ title: 'Saved' }); }}
                variant={apiKeySaved ? 'outline' : 'default'}
                className={apiKeySaved ? 'border-green-500 text-green-700' : 'bg-purple-600 hover:bg-purple-700'}>
                {apiKeySaved ? <><CheckCircle2 className="w-4 h-4 mr-1" />Saved</> : <><Save className="w-4 h-4 mr-1" />Save</>}
              </Button>
            </div>
            {!apiKey && (
              <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                <Info className="w-3 h-3" /> No key — EXIF + GPS only, no AI descriptions.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Drop zone */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-1">Drop photos here or click to browse</p>
              <p className="text-sm text-muted-foreground">JPEG / PNG / HEIC</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => addFiles(e.target.files)} />
            </div>
          </CardContent>
        </Card>

        {/* Photo cards */}
        <div className="space-y-6">
          {photos.map(photo => (
            <Card key={photo.id} className={photo.processed ? 'border-green-200' : ''}>
              <div className="flex">

                {/* Thumbnail */}
                <div className="w-44 shrink-0 relative bg-black rounded-l-lg overflow-hidden">
                  <img src={photo.preview} alt="" className="w-full h-full object-cover max-h-72" />
                  {photo.processed && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-600 text-white text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Done</Badge>
                    </div>
                  )}
                  <button onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 min-w-0">

                  {/* Top bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{photo.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(photo.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {/* Process / Re-run */}
                      <Button size="sm"
                        onClick={() => processPhoto(photo.id)}
                        disabled={photo.processing}
                        className={photo.processed ? '' : 'bg-purple-600 hover:bg-purple-700'}
                        variant={photo.processed ? 'outline' : 'default'}>
                        {photo.processing
                          ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />Processing…</>
                          : photo.processed
                            ? <><RefreshCw className="w-3.5 h-3.5 mr-1" />Re-run</>
                            : <><Sparkles className="w-3.5 h-3.5 mr-1" />Process</>}
                      </Button>

                      {/* Save & Download — always enabled once file is loaded */}
                      <Button size="sm"
                        onClick={() => downloadPhoto(photo.id)}
                        disabled={photo.downloading}
                        className="bg-green-600 hover:bg-green-700">
                        {photo.downloading
                          ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />Saving…</>
                          : <><Download className="w-3.5 h-3.5 mr-1" />Save &amp; Download</>}
                      </Button>
                    </div>
                  </div>

                  {/* Processing step */}
                  {photo.processing && photo.processStep && (
                    <div className="mb-3 flex items-center gap-2 text-xs bg-purple-50 text-purple-700 px-3 py-2 rounded">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />{photo.processStep}
                    </div>
                  )}

                  {/* Location badges */}
                  {(photo.lat != null || photo.city || photo.country) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {photo.lat != null && (
                        <Badge variant="outline" className="text-xs font-mono">
                          <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                          {photo.lat.toFixed(4)}, {photo.lon?.toFixed(4)}
                        </Badge>
                      )}
                      {photo.city    && <Badge className="bg-blue-100 text-blue-800 text-xs">{photo.city}</Badge>}
                      {photo.country && <Badge className="bg-indigo-100 text-indigo-800 text-xs">{photo.country}</Badge>}
                    </div>
                  )}

                  {/* Editable fields — shown always so user can type even before AI */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">Title</Label>
                      <Input value={photo.title}
                        onChange={e => patchPhoto(photo.id, { title: e.target.value })}
                        placeholder="Photo title" className="text-sm" />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">Description</Label>
                      <Textarea value={photo.description}
                        onChange={e => patchPhoto(photo.id, { description: e.target.value })}
                        placeholder="Photo description" className="text-sm min-h-[70px] resize-none" />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
                        Tags ({photo.tags.length})
                      </Label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {photo.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs gap-1">
                            <Tag className="w-2.5 h-2.5" />{tag}
                            <button onClick={() => patchPhoto(photo.id, { tags: photo.tags.filter(t => t !== tag) })}
                              className="hover:text-red-500 ml-0.5"><X className="w-2.5 h-2.5" /></button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input value={tagInput[photo.id] ?? ''}
                          onChange={e => setTagInput(prev => ({ ...prev, [photo.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key !== 'Enter') return;
                            e.preventDefault();
                            const raw = (tagInput[photo.id] ?? '').trim().toLowerCase();
                            if (!raw) return;
                            const newTags = raw.split(/[,;\s]+/).filter(Boolean);
                            patchPhoto(photo.id, { tags: [...new Set([...photo.tags, ...newTags])] });
                            setTagInput(prev => ({ ...prev, [photo.id]: '' }));
                          }}
                          placeholder="Add tags (comma separated, Enter to add)…"
                          className="text-sm h-8" />
                        <Button size="sm" variant="outline" className="h-8" onClick={() => {
                          const raw = (tagInput[photo.id] ?? '').trim().toLowerCase();
                          if (!raw) return;
                          const newTags = raw.split(/[,;\s]+/).filter(Boolean);
                          patchPhoto(photo.id, { tags: [...new Set([...photo.tags, ...newTags])] });
                          setTagInput(prev => ({ ...prev, [photo.id]: '' }));
                        }}>Add</Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button onClick={() => downloadPhoto(photo.id)}
                        disabled={photo.downloading}
                        className="bg-green-600 hover:bg-green-700">
                        {photo.downloading
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Embedding &amp; Saving…</>
                          : <><Download className="w-4 h-4 mr-2" />Save &amp; Download</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {photos.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">Upload photos above to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
