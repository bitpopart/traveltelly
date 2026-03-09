import React, { useState, useCallback, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useToast } from '@/hooks/useToast';

import { extractPhotoMetadata } from '@/lib/exifUtils';
import { reverseGeocode, type GeoLocation } from '@/lib/reverseGeocode';
import { analyzeImageWithAI, getStoredApiKey, setStoredApiKey, type AIRecognitionResult } from '@/lib/aiImageRecognition';
import { embedMetadataIntoJpeg } from '@/lib/imageMetadataWriter';

import {
  ArrowLeft,
  Shield,
  Upload,
  Sparkles,
  MapPin,
  Tag,
  FileImage,
  Download,
  Save,
  Loader2,
  X,
  CheckCircle2,
  Camera,
  Eye,
  Key,
  RefreshCw,
  Info,
} from 'lucide-react';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

interface PhotoState {
  file: File;
  preview: string;
  // Raw EXIF data
  exifTitle?: string;
  exifDescription?: string;
  exifKeywords?: string[];
  exifLat?: number;
  exifLon?: number;
  // Reverse geocoding
  geoLocation?: GeoLocation;
  // AI results
  aiResult?: AIRecognitionResult;
  // Editable final fields
  finalTitle: string;
  finalDescription: string;
  finalTags: string[];
  // Processing state
  processingExif: boolean;
  processingGeo: boolean;
  processingAI: boolean;
  processed: boolean;
  // Download state
  downloading: boolean;
  downloadStep?: 'embedding' | 'saving' | null;
}

type ProcessingStep = 'exif' | 'geo' | 'ai' | 'done';

export default function AdminImageRecognition() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const photosRef = useRef<PhotoState[]>([]); // always-fresh ref for async callbacks
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(!!getStoredApiKey());
  const [newTagInput, setNewTagInput] = useState<Record<number, string>>({});
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updatePhoto = useCallback((index: number, partial: Partial<PhotoState>) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...partial };
      photosRef.current = updated; // keep ref in sync
      return updated;
    });
  }, []);

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKey.trim());
    setApiKeySaved(true);
    toast({ title: 'API key saved', description: 'OpenAI key stored in local storage.' });
  };

  // ── File Upload ─────────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newPhotos: PhotoState[] = Array.from(files)
        .filter((f) => {
          const name = f.name.toLowerCase();
          return (
            f.type.startsWith('image/') ||
            name.endsWith('.jpg') || name.endsWith('.jpeg') ||
            name.endsWith('.png') || name.endsWith('.heic') || name.endsWith('.webp')
          );
        })
        .map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          finalTitle: '',
          finalDescription: '',
          finalTags: [],
          processingExif: false,
          processingGeo: false,
          processingAI: false,
          processed: false,
          downloading: false,
        }));
      setPhotos((prev) => {
        const updated = [...prev, ...newPhotos];
        photosRef.current = updated;
        return updated;
      });
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      photosRef.current = updated;
      return updated;
    });
  };

  // ── Process a single photo ──────────────────────────────────────────────────

  const processPhoto = useCallback(
    async (index: number) => {
      const photo = photosRef.current[index];
      if (!photo) return;

      setProcessingIndex(index);

      // ─ Step 1: Extract EXIF ─
      setProcessingStep('exif');
      updatePhoto(index, { processingExif: true });
      const metadata = await extractPhotoMetadata(photo.file);
      updatePhoto(index, {
        processingExif: false,
        exifTitle: metadata.title,
        exifDescription: metadata.description,
        exifKeywords: metadata.keywords,
        exifLat: metadata.gps?.latitude,
        exifLon: metadata.gps?.longitude,
      });

      // ─ Step 2: Reverse Geocode ─
      let geoLocation: GeoLocation | undefined;
      if (metadata.gps) {
        setProcessingStep('geo');
        updatePhoto(index, { processingGeo: true });
        geoLocation = await reverseGeocode(metadata.gps.latitude, metadata.gps.longitude);
        updatePhoto(index, { processingGeo: false, geoLocation });
      }

      // ─ Step 3: AI Recognition ─
      setProcessingStep('ai');
      updatePhoto(index, { processingAI: true });
      const aiResult = await analyzeImageWithAI(
        photo.file,
        geoLocation
          ? { city: geoLocation.city, country: geoLocation.country }
          : undefined
      );
      updatePhoto(index, { processingAI: false, aiResult });

      // ─ Populate final fields ─
      const locationSuffix = [geoLocation?.city, geoLocation?.country]
        .filter(Boolean)
        .join(', ');

      const finalTitle =
        aiResult.title ||
        metadata.title ||
        (locationSuffix ? `Travel Photo – ${locationSuffix}` : 'Travel Photo');

      const finalDescription =
        aiResult.description ||
        metadata.description ||
        (locationSuffix ? `Photo taken in ${locationSuffix}.` : '');

      const tagSet = new Set<string>([
        ...(aiResult.tags ?? []),
        ...(metadata.keywords ?? []),
        'travel',
        'photography',
      ]);
      if (geoLocation?.city) tagSet.add(geoLocation.city.toLowerCase());
      if (geoLocation?.country) tagSet.add(geoLocation.country.toLowerCase());
      if (geoLocation?.countryCode) tagSet.add(geoLocation.countryCode.toLowerCase());

      updatePhoto(index, {
        finalTitle,
        finalDescription,
        finalTags: Array.from(tagSet).filter(Boolean),
        processed: true,
      });

      setProcessingStep('done');
      setProcessingIndex(null);

      toast({
        title: 'Photo processed ✓',
                        description: aiResult.aiGenerated
          ? 'Claude AI recognition complete with location data.'
          : 'Metadata extracted (no Anthropic key – used EXIF + GPS only).',
      });
    },
    [updatePhoto, toast]
  );

  // ── Process all unprocessed photos ─────────────────────────────────────────

  const processAll = async () => {
    const current = photosRef.current;
    for (let i = 0; i < current.length; i++) {
      if (!current[i].processed) {
        await processPhoto(i);
      }
    }
  };

  // ── Download with embedded metadata ────────────────────────────────────────

  const downloadPhoto = async (index: number) => {
    // Read from ref so we always get fresh state even after async updates
    const photo = photosRef.current[index];
    if (!photo) {
      console.error('[Download] photo not found at index', index);
      return;
    }
    console.log('[Download] starting for:', photo.file.name, 'title:', photo.finalTitle);

    // Step 1: embed metadata into the image bytes
    updatePhoto(index, { downloading: true, downloadStep: 'embedding' });

    let blob: Blob;
    try {
      blob = await embedMetadataIntoJpeg(photo.file, {
        title: photo.finalTitle,
        description: photo.finalDescription,
        keywords: photo.finalTags,
        latitude: photo.exifLat,
        longitude: photo.exifLon,
        city: photo.geoLocation?.city,
        country: photo.geoLocation?.country,
      });
    } catch (err) {
      console.error('Metadata embedding failed:', err);
      toast({ title: 'Embedding failed', variant: 'destructive', description: String(err) });
      updatePhoto(index, { downloading: false, downloadStep: null });
      return;
    }

    // Step 2: trigger the file download
    updatePhoto(index, { downloadStep: 'saving' });

    try {
      const ext = photo.file.name.match(/\.[^/.]+$/)?.[0] ?? '.jpg';
      const safeName = photo.finalTitle
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .slice(0, 60);
      const filename = `${safeName || 'photo'}${ext}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Small delay so the browser can initiate the download before we revoke
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      toast({
        title: '✅ Saved & downloaded',
        description: `Metadata embedded into ${filename} before download.`,
      });
    } catch (err) {
      console.error('Download trigger failed:', err);
      toast({ title: 'Download failed', variant: 'destructive', description: String(err) });
    } finally {
      updatePhoto(index, { downloading: false, downloadStep: null });
    }
  };

  // ── Remove a tag ────────────────────────────────────────────────────────────

  const removeTag = (photoIndex: number, tag: string) => {
    updatePhoto(photoIndex, {
      finalTags: photos[photoIndex].finalTags.filter((t) => t !== tag),
    });
  };

  const addTag = (photoIndex: number) => {
    const raw = (newTagInput[photoIndex] ?? '').trim().toLowerCase();
    if (!raw) return;
    const tags = raw.split(/[,;\s]+/).filter(Boolean);
    const updated = [...new Set([...photos[photoIndex].finalTags, ...tags])];
    updatePhoto(photoIndex, { finalTags: updated });
    setNewTagInput((prev) => ({ ...prev, [photoIndex]: '' }));
  };

  // ── Access checks ───────────────────────────────────────────────────────────

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardContent className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
              <p className="text-muted-foreground">Checking admin permissions…</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-6">Only the Traveltelly admin can access this page.</p>
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────

  const unprocessedCount = photos.filter((p) => !p.processed).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Image Recognition</h1>
              <p className="text-muted-foreground">
                Extract EXIF metadata, reverse-geocode GPS, and use AI to auto-generate title,
                description &amp; tags — then embed it all back into the photo for download.
              </p>
            </div>
          </div>
        </div>

        {/* Anthropic API Key card */}
        <Card className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="w-4 h-4" />
              Anthropic API Key (for AI recognition)
            </CardTitle>
            <CardDescription>
              Enter your Anthropic API key to enable Claude vision tagging. Without a key the
              system still extracts EXIF + GPS data and generates basic tags.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setApiKeySaved(false); }}
                  placeholder="sk-ant-..."
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleSaveApiKey}
                variant={apiKeySaved ? 'outline' : 'default'}
                className={apiKeySaved ? 'border-green-500 text-green-700' : 'bg-purple-600 hover:bg-purple-700'}
              >
                {apiKeySaved ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</>
                ) : (
                  <><Save className="w-4 h-4 mr-1" /> Save Key</>
                )}
              </Button>
            </div>
            {!apiKey && (
              <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                <Info className="w-3 h-3" />
                No Anthropic key — will use EXIF + GPS geocoding only (no AI descriptions).
              </p>
            )}
          </CardContent>
        </Card>

        {/* Drop Zone */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-1">Drop photos here or click to browse</p>
              <p className="text-sm text-muted-foreground">JPEG, PNG, HEIC — EXIF GPS will be extracted automatically</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Process All button */}
        {photos.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} loaded
              {unprocessedCount > 0 ? ` · ${unprocessedCount} unprocessed` : ' · all processed'}
            </p>
            {unprocessedCount > 0 && (
              <Button
                onClick={processAll}
                disabled={processingIndex !== null}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {processingIndex !== null ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Process All ({unprocessedCount})</>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Photo Cards */}
        <div className="space-y-6">
          {photos.map((photo, idx) => (
            <Card key={idx} className={`overflow-hidden ${photo.processed ? 'border-green-200' : ''}`}>
              <div className="flex gap-0">
                {/* Thumbnail */}
                <div className="w-48 shrink-0 relative bg-black">
                  <img
                    src={photo.preview}
                    alt={photo.file.name}
                    className="w-full h-full object-cover max-h-72"
                  />
                  {photo.processed && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-600 text-white text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Done
                      </Badge>
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{photo.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!photo.processed ? (
                        <Button
                          size="sm"
                          onClick={() => processPhoto(idx)}
                          disabled={processingIndex !== null}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {processingIndex === idx ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Processing…</>
                          ) : (
                            <><Sparkles className="w-3.5 h-3.5 mr-1" /> Process</>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processPhoto(idx)}
                          disabled={processingIndex !== null}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          Re-run
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => downloadPhoto(idx)}
                        disabled={photo.downloading || !photo.processed}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {photo.downloadStep === 'embedding' ? (
                          <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Embedding…</>
                        ) : photo.downloadStep === 'saving' ? (
                          <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving…</>
                        ) : (
                          <><Download className="w-3.5 h-3.5 mr-1" /> Download</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Progress indicators while processing */}
                  {processingIndex === idx && (
                    <div className="mb-3 space-y-1.5">
                      <ProcessStep
                        label="Extracting EXIF metadata"
                        active={processingStep === 'exif'}
                        done={['geo', 'ai', 'done'].includes(processingStep ?? '')}
                        icon={<Camera className="w-3.5 h-3.5" />}
                      />
                      <ProcessStep
                        label="Reverse geocoding GPS"
                        active={processingStep === 'geo'}
                        done={['ai', 'done'].includes(processingStep ?? '')}
                        icon={<MapPin className="w-3.5 h-3.5" />}
                      />
                      <ProcessStep
                        label="Claude AI image recognition"
                        active={processingStep === 'ai'}
                        done={processingStep === 'done'}
                        icon={<Sparkles className="w-3.5 h-3.5" />}
                      />
                    </div>
                  )}

                  {/* GPS / Location info */}
                  {(photo.exifLat !== undefined || photo.geoLocation) && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {photo.exifLat !== undefined && (
                        <Badge variant="outline" className="text-xs font-mono">
                          <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                          {photo.exifLat?.toFixed(5)}, {photo.exifLon?.toFixed(5)}
                        </Badge>
                      )}
                      {photo.geoLocation?.city && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {photo.geoLocation.city}
                        </Badge>
                      )}
                      {photo.geoLocation?.country && (
                        <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                          {photo.geoLocation.country}
                        </Badge>
                      )}
                      {photo.aiResult?.aiGenerated && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Claude enhanced
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Editable fields */}
                  {photo.processed && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
                          Title
                        </Label>
                        <Input
                          value={photo.finalTitle}
                          onChange={(e) => updatePhoto(idx, { finalTitle: e.target.value })}
                          placeholder="Photo title"
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
                          Description
                        </Label>
                        <Textarea
                          value={photo.finalDescription}
                          onChange={(e) => updatePhoto(idx, { finalDescription: e.target.value })}
                          placeholder="Photo description"
                          className="text-sm min-h-[80px] resize-none"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">
                          Tags ({photo.finalTags.length})
                        </Label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {photo.finalTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs pr-1 flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                              <button
                                onClick={() => removeTag(idx, tag)}
                                className="ml-0.5 hover:text-red-500"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newTagInput[idx] ?? ''}
                            onChange={(e) =>
                              setNewTagInput((prev) => ({ ...prev, [idx]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); addTag(idx); }
                            }}
                            placeholder="Add tags (comma separated)…"
                            className="text-sm h-8"
                          />
                          <Button size="sm" variant="outline" className="h-8" onClick={() => addTag(idx)}>
                            Add
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => downloadPhoto(idx)}
                          disabled={photo.downloading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {photo.downloadStep === 'embedding' ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Embedding metadata…</>
                          ) : photo.downloadStep === 'saving' ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving to file…</>
                          ) : (
                            <><Download className="w-3.5 h-3.5 mr-2" /> Save &amp; Download</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
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

// ── Sub-component: Processing step indicator ──────────────────────────────────

function ProcessStep({
  label,
  active,
  done,
  icon,
}: {
  label: string;
  active: boolean;
  done: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
      active ? 'bg-purple-100 text-purple-800' :
      done ? 'bg-green-100 text-green-700' :
      'bg-gray-100 text-gray-400'
    }`}>
      {active ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : done ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <span className="w-3.5 h-3.5 opacity-40">{icon}</span>
      )}
      {label}
      {active && <span className="ml-auto">Running…</span>}
      {done && <span className="ml-auto">Done</span>}
    </div>
  );
}
