import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import {
  Download, CheckCircle, AlertCircle, FileText, Image as ImageIcon,
  Video, Music, Palette, Clock, Shield, Mail, ExternalLink, ArrowLeft, Zap, CreditCard,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DownloadItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: string;
  url: string;
  format: string;
}

interface StoredPurchase {
  orderId: string;
  productId: string;
  productTitle: string;
  buyerEmail: string;
  buyerName?: string;
  amount: number;
  currency: string;
  timestamp: number;
  paymentMethod: 'lightning' | 'stripe';
  status: 'verified' | 'pending';
  invoice?: string;
  productData?: {
    images: string[];
    description?: string;
    category?: string;
    mediaType?: string;
    contentCategory?: string;
    seller?: { pubkey: string; name?: string };
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function lookupPurchase(orderId: string, email: string | null): StoredPurchase | null {
  try {
    const all: StoredPurchase[] = JSON.parse(localStorage.getItem('traveltelly_purchases') || '[]');
    return (
      all.find(p => p.orderId === orderId || p.productId === orderId) ||
      (email ? all.find(p => p.buyerEmail === email) : null) ||
      null
    );
  } catch {
    return null;
  }
}

function buildDownloadItems(purchase: StoredPurchase): DownloadItem[] {
  const items: DownloadItem[] = [];
  const images = purchase.productData?.images || [];
  const safeTitle = purchase.productTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  images.forEach((url, idx) => {
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || 'jpg';
    const isVideo = ['mp4', 'mov', 'webm', 'avi'].includes(ext);
    items.push({
      id: `file_${idx + 1}`,
      name: `${safeTitle}-${idx + 1}.${ext}`,
      type: isVideo ? 'video' : 'image',
      size: idx === 0 ? 'Full resolution' : 'Web size',
      url,
      format: ext.toUpperCase(),
    });
  });

  // Always include a license text
  items.push({
    id: 'license',
    name: 'license-agreement.txt',
    type: 'document',
    size: '< 1 KB',
    url: '__license__',
    format: 'TXT',
  });

  return items;
}

function generateLicenseText(purchase: StoredPurchase): string {
  return [
    'ROYALTY-FREE LICENSE AGREEMENT',
    '================================',
    '',
    `Product  : ${purchase.productTitle}`,
    `Order ID : ${purchase.orderId}`,
    `Purchaser: ${purchase.buyerName || 'Guest'} <${purchase.buyerEmail}>`,
    `Date     : ${new Date(purchase.timestamp).toLocaleString()}`,
    `Payment  : ${purchase.amount.toLocaleString()} ${purchase.currency} via ${purchase.paymentMethod}`,
    '',
    'PERMISSIONS',
    '-----------',
    '✓ Commercial and personal use',
    '✓ Unlimited usage and distribution',
    '✓ Modification and derivative works',
    '✓ Include in digital and print projects',
    '',
    'RESTRICTIONS',
    '------------',
    '✗ Cannot resell as a standalone digital asset',
    '✗ Cannot claim ownership of the original work',
    '✗ Cannot sub-license to third parties',
    '',
    'CONTACT',
    '-------',
    'traveltelly@primal.net | traveltelly.com',
    '',
    'Thank you for supporting independent travel photography!',
  ].join('\n');
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
    case 'video': return <Video className="w-5 h-5 text-red-500" />;
    case 'audio': return <Music className="w-5 h-5 text-green-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const DownloadPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [purchase, setPurchase] = useState<StoredPurchase | null>(null);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  useSeoMeta({
    title: 'Download Your Media - Traveltelly Marketplace',
    description: 'Download your purchased digital media files.',
    robots: 'noindex,nofollow',
  });

  useEffect(() => {
    if (!orderId || !token) { setIsVerifying(false); return; }

    const found = lookupPurchase(orderId, email);

    if (found) {
      setPurchase(found);
      setDownloadItems(buildDownloadItems(found));
    }
    // Short delay to show the verifying state
    const t = setTimeout(() => setIsVerifying(false), 800);
    return () => clearTimeout(t);
  }, [orderId, token, email]);

  const handleDownload = async (item: DownloadItem) => {
    if (item.url === '__license__' && purchase) {
      // Generate license text file
      const blob = new Blob([generateLicenseText(purchase)], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = item.name;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setDownloaded(prev => new Set([...prev, item.id]));
      toast({ title: 'License downloaded', description: 'License agreement saved.' });
      return;
    }

    try {
      setDownloadProgress(prev => ({ ...prev, [item.id]: 10 }));
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          const cur = prev[item.id] || 10;
          return cur >= 90 ? prev : { ...prev, [item.id]: cur + 15 };
        });
      }, 150);

      let ok = false;
      // Method 1: fetch + blob (respects CORS)
      try {
        const r = await fetch(item.url, { mode: 'cors' });
        if (r.ok) {
          const blob = await r.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = item.name; a.style.display = 'none';
          document.body.appendChild(a); a.click();
          document.body.removeChild(a); URL.revokeObjectURL(url);
          ok = true;
        }
      } catch { /* try next method */ }

      // Method 2: direct anchor download
      if (!ok) {
        const a = document.createElement('a');
        a.href = item.url; a.download = item.name; a.target = '_blank';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        ok = true;
      }

      clearInterval(interval);
      setDownloadProgress(prev => ({ ...prev, [item.id]: 100 }));
      setDownloaded(prev => new Set([...prev, item.id]));
      toast({ title: 'Download started', description: `${item.name} — check your downloads folder.` });
    } catch (err) {
      setDownloadProgress(prev => { const n = { ...prev }; delete n[item.id]; return n; });
      toast({ title: 'Download failed', description: 'Try right-clicking → Save as.', variant: 'destructive' });
    }
  };

  const downloadAll = async () => {
    for (const item of downloadItems) {
      await handleDownload(item);
      await new Promise(r => setTimeout(r, 600));
    }
  };

  const emailMyselfLink = () => {
    if (!purchase) return;
    const url = `${window.location.origin}/download/${purchase.orderId}?token=${token}&email=${encodeURIComponent(purchase.buyerEmail)}`;
    const subject = encodeURIComponent(`Your TravelTelly Download — Order #${purchase.orderId}`);
    const body = encodeURIComponent(
      `Hi ${purchase.buyerName || 'there'},\n\nYour download is ready:\n${url}\n\nOrder: ${purchase.orderId}\nProduct: ${purchase.productTitle}\n\nSupport: traveltelly@primal.net`
    );
    window.open(`mailto:${purchase.buyerEmail}?subject=${subject}&body=${body}`);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isVerifying) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your purchase…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / not found ──────────────────────────────────────────────────────
  if (!purchase || !token) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-14 h-14 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Purchase Not Found
              </h2>
              <p className="text-muted-foreground mb-2">
                We couldn't find a purchase for this download link.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                If you just completed payment, please check that:
              </p>
              <ul className="text-sm text-muted-foreground text-left mx-auto max-w-xs mb-6 space-y-1">
                <li>• You clicked <strong>I've Paid</strong> after sending the Lightning payment</li>
                <li>• The download link is the one from your confirmation page</li>
                <li>• Your browser hasn't cleared localStorage</li>
              </ul>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Link to="/marketplace">
                  <Button className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
                  </Button>
                </Link>
                <a href="mailto:traveltelly@primal.net?subject=Download Help">
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" /> Contact Support
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Success page ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {purchase.status === 'pending' ? 'Order Received 📋' : 'Payment Confirmed! 🎉'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {purchase.status === 'pending'
              ? 'Your order is recorded. Download will be available once payment is confirmed.'
              : 'Your digital media is ready to download.'}
          </p>
        </div>

        {/* Pending order notice */}
        {purchase.status === 'pending' && (
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Order pending.</strong> If you paid via card, the admin will confirm and send your download link. Contact{' '}
              <a href="mailto:traveltelly@primal.net" className="underline font-medium">traveltelly@primal.net</a>{' '}
              with your order ID: <code className="font-mono text-xs">{purchase.orderId}</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Purchase summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-green-500" />
              Purchase Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Product</p>
                <p className="font-semibold">{purchase.productTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Order ID</p>
                <p className="font-mono text-xs break-all">{purchase.orderId}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Paid</p>
                <div className="flex items-center gap-1.5">
                  {purchase.paymentMethod === 'lightning'
                    ? <Zap className="w-4 h-4 text-yellow-500 fill-current" />
                    : <CreditCard className="w-4 h-4 text-blue-500" />}
                  <span className="font-semibold">
                    {purchase.currency === 'SATS'
                      ? `${purchase.amount.toLocaleString()} sats`
                      : purchase.currency === 'FREE'
                      ? 'Free'
                      : `${(purchase.amount / 100).toFixed(2)} ${purchase.currency}`}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {purchase.buyerEmail}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Date</p>
                <p className="font-medium">{new Date(purchase.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Status</p>
                <Badge
                  className={purchase.status === 'verified' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}
                >
                  {purchase.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Downloads */}
        {purchase.status === 'verified' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download className="w-5 h-5 text-blue-500" />
                  Your Files ({downloadItems.length})
                </CardTitle>
                <Button onClick={downloadAll} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Download className="w-4 h-4 mr-2" /> Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {downloadItems.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(item.type)}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.format} • {item.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {downloadProgress[item.id] !== undefined && downloadProgress[item.id] < 100 && (
                        <div className="w-20">
                          <Progress value={downloadProgress[item.id]} className="h-1.5" />
                        </div>
                      )}

                      {downloaded.has(item.id) ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-green-600 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Done
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(item)}>
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(item)}
                            disabled={downloadProgress[item.id] !== undefined && downloadProgress[item.id] < 100}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="w-3 h-3 mr-1" /> Download
                          </Button>
                          {item.url !== '__license__' && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {idx < downloadItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* License */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-800 dark:text-green-200">
              <FileText className="w-5 h-5" /> License & Usage Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-700 dark:text-green-300 space-y-1.5">
            <p>✅ Commercial use permitted</p>
            <p>✅ Unlimited usage and distribution</p>
            <p>✅ Modification and editing allowed</p>
            <p>❌ Cannot resell as standalone digital asset</p>
            <p>❌ Cannot claim ownership of original work</p>
            <Separator className="my-2 bg-green-200 dark:bg-green-700" />
            <p className="text-xs">For licensing questions: <strong>traveltelly@primal.net</strong></p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" /> Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Save your files to a secure location. Download access is tied to this browser session.
              Use <strong>Email Myself</strong> to save this link for later.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Browse More Media
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={emailMyselfLink}>
                <Mail className="w-4 h-4 mr-2" /> Email Myself This Link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:traveltelly@primal.net?subject=Order+Support&body=Order+ID%3A+${purchase.orderId}`}>
                  <Mail className="w-4 h-4 mr-2" /> Contact Support
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://primal.net/traveltelly" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> Follow Creator
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground pb-4">
          Thank you for supporting independent travel photography on Nostr! 🙏
        </p>
      </div>
    </div>
  );
};

export default DownloadPage;
