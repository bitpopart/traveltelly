import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { Globe, Upload, Loader2, CheckCircle2, FileText, BookOpen } from 'lucide-react';

/**
 * Upload a full HTML file as a NIP-23 story page.
 * The HTML is stored on Blossom and linked via the `brand_site` tag.
 * This is the same logic as AdminStoryManager's "Upload HTML Page" tab,
 * but available to any logged-in user from the Stories create screen.
 */
export function UploadHtmlStoryForm() {
  const { user } = useCurrentUser();
  const { mutate: publish } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    summary: '',
    image: '',
    location: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'publishing' | 'done'>('idle');
  const [uploadedUrl, setUploadedUrl] = useState('');

  const htmlInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const [[, url]] = await uploadFile(file);
      setForm(prev => ({ ...prev, image: url }));
      toast({ title: 'Thumbnail uploaded!' });
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload thumbnail.', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ title: 'No file selected', description: 'Please select an HTML file.', variant: 'destructive' });
      return;
    }
    if (!form.title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }

    try {
      setProgress('uploading');
      const [[, htmlUrl]] = await uploadFile(selectedFile);
      setUploadedUrl(htmlUrl);
      setProgress('publishing');

      const dTag = `html-page-${Date.now()}`;
      const tags: string[][] = [
        ['d', dTag],
        ['title', form.title.trim()],
        ['published_at', Math.floor(Date.now() / 1000).toString()],
        ['alt', `Travel Story: ${form.title.trim()}`],
        ['brand_site', htmlUrl],
        ['brand_site_is_srcdoc', 'false'],
        ['t', 'travel'],
        ['t', 'traveltelly'],
        ['t', 'htmlpage'],
      ];

      if (form.summary.trim()) tags.push(['summary', form.summary.trim()]);
      if (form.image.trim()) tags.push(['image', form.image.trim()]);
      if (form.location.trim()) tags.push(['location', form.location.trim()]);

      form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).forEach(t => tags.push(['t', t]));

      publish({
        kind: 30023,
        content: `# ${form.title.trim()}\n\n${form.summary || 'Travel story page'}\n\n[View full page](${htmlUrl})`,
        tags,
      }, {
        onSuccess: () => {
          setProgress('done');
          toast({ title: 'HTML Page Published! 🎉', description: `"${form.title}" is now live.` });
          setTimeout(() => {
            setProgress('idle');
            setSelectedFile(null);
            setUploadedUrl('');
            setForm({ title: '', summary: '', image: '', location: '', tags: '' });
            if (htmlInputRef.current) htmlInputRef.current.value = '';
            if (thumbInputRef.current) thumbInputRef.current.value = '';
          }, 2500);
        },
        onError: () => {
          setProgress('idle');
          toast({ title: 'Publish failed', description: 'Could not publish story page.', variant: 'destructive' });
        },
      });
    } catch (err) {
      setProgress('idle');
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload HTML file.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to upload story pages.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Upload Full HTML Page
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
          <strong>How it works:</strong> Upload a complete HTML file (e.g. a full travel story page).
          It will be stored on Blossom and appear as a thumbnail in the Written Stories grid.
          When visitors click it, the full page loads directly under the navigation — like a mini website.
        </div>

        {/* HTML file picker */}
        <div>
          <Label className="mb-2 block">HTML File <span className="text-red-500">*</span></Label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
            onClick={() => htmlInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">Click to select HTML file</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .html, .htm files</p>
              </div>
            )}
          </div>
          <input
            ref={htmlInputRef}
            type="file"
            accept=".html,.htm"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }}
          />
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="html-title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="html-title"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Story page title (shown on thumbnail)"
            className="mt-1"
          />
        </div>

        {/* Summary */}
        <div>
          <Label htmlFor="html-summary">Summary (optional)</Label>
          <Textarea
            id="html-summary"
            value={form.summary}
            onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="Short description shown on hover…"
            className="mt-1 min-h-[70px]"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <Label className="mb-2 block font-semibold">
            Thumbnail Image <span className="text-red-500">*</span>
            <span className="font-normal text-muted-foreground ml-1">(shown in the grid)</span>
          </Label>
          {!form.image ? (
            <div
              className="border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
              onClick={() => thumbInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-orange-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium">Uploading thumbnail…</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                  <p className="text-sm font-medium">Click to upload thumbnail image</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — this is the grid preview image</p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative inline-block">
              <img src={form.image} alt="Thumbnail preview" className="w-40 h-40 object-cover rounded-lg border-2 border-green-400 shadow" />
              <button
                type="button"
                onClick={() => { setForm(prev => ({ ...prev, image: '' })); if (thumbInputRef.current) thumbInputRef.current.value = ''; }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
              >✕</button>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => thumbInputRef.current?.click()} disabled={isUploading}>
                  <Upload className="w-3 h-3 mr-1" />Replace
                </Button>
              </div>
            </div>
          )}
          <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Or paste an image URL directly:</p>
            <Input
              value={form.image}
              onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/thumbnail.jpg"
              className="text-sm"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="html-location">Location (optional)</Label>
          <Input
            id="html-location"
            value={form.location}
            onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, Country"
            className="mt-1"
          />
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="html-tags">Topic Tags (optional)</Label>
          <Input
            id="html-tags"
            value={form.tags}
            onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="destination, guide, photography (comma-separated)"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            "travel", "traveltelly" and "htmlpage" tags are added automatically.
          </p>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || !form.title.trim() || progress !== 'idle'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {progress === 'uploading' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading HTML to Blossom…</>}
          {progress === 'publishing' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing to Nostr…</>}
          {progress === 'done' && <><CheckCircle2 className="w-4 h-4 mr-2" />Published! 🎉</>}
          {progress === 'idle' && <><Globe className="w-4 h-4 mr-2" />Upload & Publish HTML Page</>}
        </Button>

        {uploadedUrl && progress === 'done' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">HTML file uploaded to Blossom:</p>
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline break-all">
              {uploadedUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
