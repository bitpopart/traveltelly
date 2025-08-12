import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Alert components removed - not used in current implementation
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/useToast';
import { emailService } from '@/lib/emailService';
import {
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  Video,
  Music,
  Palette,
  Clock,
  Shield,
  Mail,
  ExternalLink,
  ArrowLeft,
  Zap
} from 'lucide-react';

interface DownloadItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive';
  size: string;
  url: string;
  format: string;
}

interface PurchaseInfo {
  orderId: string;
  productTitle: string;
  buyerEmail: string;
  buyerName?: string;
  amount: number;
  currency: string;
  timestamp: number;
  paymentMethod: 'lightning' | 'stripe';
  status: 'verified' | 'pending' | 'expired';
}

const DownloadPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadedItems, setDownloadedItems] = useState<Set<string>>(new Set());

  // Get verification token from URL params
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useSeoMeta({
    title: 'Download Your Media - Nostr Marketplace',
    description: 'Download your purchased digital media files.',
    robots: 'noindex, nofollow', // Don't index download pages
  });

  useEffect(() => {
    if (!orderId || !token) {
      setIsVerifying(false);
      return;
    }

    verifyPurchaseAndLoadFiles();
  }, [orderId, token]); // verifyPurchaseAndLoadFiles is defined inside useEffect

  const verifyPurchaseAndLoadFiles = async () => {
    try {
      setIsVerifying(true);

      // Check localStorage for purchase verification (production would use backend API)
      const localPurchases = JSON.parse(localStorage.getItem('traveltelly_purchases') || '[]');
      const purchase = localPurchases.find((p: { productId: string; orderId: string }) =>
        p.productId === orderId || p.orderId === orderId
      );

      if (!purchase) {
        // Simulate API call for verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock purchase info for demo
        setPurchaseInfo({
          orderId: orderId!,
          productTitle: 'Sample Digital Media Package',
          buyerEmail: email || 'buyer@example.com',
          buyerName: 'Demo User',
          amount: 2500,
          currency: 'SATS',
          timestamp: Date.now() - 300000, // 5 minutes ago
          paymentMethod: 'lightning',
          status: 'verified'
        });

        // Mock download items
        setDownloadItems([
          {
            id: '1',
            name: 'high-resolution-photo.jpg',
            type: 'image',
            size: '12.5 MB',
            url: 'https://picsum.photos/4000/3000',
            format: 'JPEG'
          },
          {
            id: '2',
            name: 'web-optimized-photo.jpg',
            type: 'image',
            size: '2.1 MB',
            url: 'https://picsum.photos/1920/1080',
            format: 'JPEG'
          },
          {
            id: '3',
            name: 'license-agreement.pdf',
            type: 'document',
            size: '156 KB',
            url: '#',
            format: 'PDF'
          }
        ]);
      } else {
        setPurchaseInfo({
          orderId: purchase.orderId || purchase.productId,
          productTitle: purchase.productTitle,
          buyerEmail: purchase.buyerEmail,
          buyerName: purchase.buyerName,
          amount: purchase.amount,
          currency: purchase.currency || 'SATS',
          timestamp: purchase.timestamp,
          paymentMethod: purchase.paymentMethod || 'lightning',
          status: 'verified'
        });

        // Get the actual product data to find real download files
        const productData = purchase.productData;
        let downloadFiles: DownloadItem[] = [];

        if (productData && productData.images && productData.images.length > 0) {
          // Use actual product images
          productData.images.forEach((imageUrl: string, index: number) => {
            const fileName = `${purchase.productTitle.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`;
            const extension = imageUrl.split('.').pop()?.toLowerCase() || 'jpg';

            downloadFiles.push({
              id: `image_${index + 1}`,
              name: `${fileName}.${extension}`,
              type: 'image',
              size: index === 0 ? 'High Resolution' : 'Web Optimized',
              url: imageUrl,
              format: extension.toUpperCase()
            });
          });
        } else {
          // Fallback to demo images if no product data
          downloadFiles = [
            {
              id: '1',
              name: `${purchase.productTitle.toLowerCase().replace(/\s+/g, '-')}-high-res.jpg`,
              type: 'image',
              size: '8.2 MB',
              url: 'https://picsum.photos/3000/2000',
              format: 'JPEG'
            },
            {
              id: '2',
              name: `${purchase.productTitle.toLowerCase().replace(/\s+/g, '-')}-web.jpg`,
              type: 'image',
              size: '1.5 MB',
              url: 'https://picsum.photos/1200/800',
              format: 'JPEG'
            }
          ];
        }

        // Always add license agreement
        downloadFiles.push({
          id: 'license',
          name: 'license-agreement.pdf',
          type: 'document',
          size: '156 KB',
          url: '#',
          format: 'PDF'
        });

        setDownloadItems(downloadFiles);

        // Email sending temporarily disabled
        console.log('📧 Email sending is currently disabled for purchase:', purchase.orderId);
        toast({
          title: 'Email Disabled',
          description: 'Email notifications are temporarily disabled. Downloads available on this page.',
        });
      }

    } catch (error) {
      console.error('Error verifying purchase:', error);
      toast({
        title: 'Verification Failed',
        description: 'Could not verify your purchase. Please check your download link.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const sendDownloadEmail = async (purchase: PurchaseInfo & { productData?: { images: string[] } }, files: DownloadItem[]) => {
    console.log('📧 Starting email send process...');

    try {
      const downloadToken = btoa(`${purchase.orderId}:${purchase.buyerEmail}:${purchase.timestamp}`);
      const downloadUrl = `${window.location.origin}/download/${purchase.orderId}?token=${downloadToken}&email=${encodeURIComponent(purchase.buyerEmail)}`;

      console.log('📧 Email data prepared:', {
        orderId: purchase.orderId,
        buyerEmail: purchase.buyerEmail,
        filesCount: files.length
      });

      // Show immediate feedback that email is being sent
      toast({
        title: 'Sending Email... 📧',
        description: `Preparing download link for ${purchase.buyerEmail}`,
      });

      const emailSuccess = await emailService.sendDownloadEmail({
        orderId: purchase.orderId,
        productTitle: purchase.productTitle,
        buyerEmail: purchase.buyerEmail,
        buyerName: purchase.buyerName,
        amount: purchase.amount,
        currency: purchase.currency,
        downloadUrl,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      });

      console.log('📧 Email send result:', emailSuccess);

      if (emailSuccess) {
        toast({
          title: 'Email Sent Successfully! 📧',
          description: `Download link sent to ${purchase.buyerEmail}. Check your inbox and spam folder!`,
        });
        console.log('📧 ✅ Email notification sent successfully');

        // Show email content in console for verification
        console.log('📧 Email sent with the following details:');
        console.log('📧 To:', purchase.buyerEmail);
        console.log('📧 Subject: Your Digital Media Download - Order #' + purchase.orderId);
        console.log('📧 Download URL:', downloadUrl);
      } else {
        throw new Error('Email service returned false');
      }

    } catch (error) {
      console.error('📧 ❌ Error sending email:', error);
      toast({
        title: 'Email Sending Failed',
        description: 'Could not send email notification. Downloads are still available on this page.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (item: DownloadItem) => {
    if (item.url === '#') {
      // Generate license PDF
      generateLicensePDF();
      return;
    }

    try {
      setDownloadProgress(prev => ({ ...prev, [item.id]: 0 }));

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const currentProgress = prev[item.id] || 0;
          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [item.id]: Math.min(currentProgress + 20, 100) };
        });
      }, 100);

      // Try different download methods based on URL type
      let downloadSuccess = false;

      // Method 1: Try direct download with fetch (for same-origin or CORS-enabled URLs)
      try {
        const response = await fetch(item.url, {
          mode: 'cors',
          headers: {
            'Accept': 'image/*,*/*'
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = item.name;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          downloadSuccess = true;
        }
      } catch (fetchError) {
        console.log('Fetch download failed, trying alternative method:', fetchError);
      }

      // Method 2: If fetch fails, try opening in new tab with download attribute
      if (!downloadSuccess) {
        try {
          const link = document.createElement('a');
          link.href = item.url;
          link.download = item.name;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          downloadSuccess = true;
        } catch (linkError) {
          console.log('Link download failed:', linkError);
        }
      }

      // Method 3: If all else fails, open in new window for manual save
      if (!downloadSuccess) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
        downloadSuccess = true;
      }

      // Clear progress and mark as downloaded
      clearInterval(progressInterval);
      setDownloadProgress(prev => ({ ...prev, [item.id]: 100 }));
      setDownloadedItems(prev => new Set([...prev, item.id]));

      toast({
        title: 'Download Started',
        description: `${item.name} download initiated. Check your downloads folder.`,
      });

    } catch (error) {
      console.error('Download error:', error);

      // Clear progress on error
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[item.id];
        return newProgress;
      });

      toast({
        title: 'Download Failed',
        description: `Could not download ${item.name}. Try right-clicking the link to save.`,
        variant: 'destructive',
      });
    }
  };

  const generateLicensePDF = () => {
    const licenseText = `
ROYALTY-FREE LICENSE AGREEMENT

Product: ${purchaseInfo?.productTitle}
Order ID: ${purchaseInfo?.orderId}
Purchaser: ${purchaseInfo?.buyerEmail}
Date: ${new Date().toLocaleDateString()}

This license grants you the right to use this digital media for:
- Commercial and personal projects
- Unlimited usage and distribution
- Modification and derivative works

Restrictions:
- Cannot resell as standalone digital asset
- Cannot claim ownership of original work
- Attribution appreciated but not required

For questions, contact: traveltelly@primal.net
    `;

    const blob = new Blob([licenseText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'license-agreement.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setDownloadedItems(prev => new Set([...prev, '3']));

    toast({
      title: 'License Downloaded',
      description: 'License agreement has been downloaded.',
    });
  };

  const downloadAll = async () => {
    for (const item of downloadItems) {
      await handleDownload(item);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'audio': return <Music className="w-5 h-5 text-green-500" />;
      case 'document': return <FileText className="w-5 h-5 text-gray-500" />;
      default: return <Palette className="w-5 h-5 text-purple-500" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">Verifying Purchase</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your payment and prepare your downloads...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!purchaseInfo || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Invalid Download Link
                </h2>
                <p className="text-muted-foreground mb-6">
                  This download link is invalid or has expired. Please check your email for the correct link.
                </p>
                <div className="space-y-3">
                  <Link to="/marketplace">
                    <Button>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Marketplace
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact <strong>traveltelly@primal.net</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your digital media is ready for download
            </p>
          </div>

          {/* Purchase Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Purchase Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-semibold">{purchaseInfo.productTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{purchaseInfo.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">
                      {purchaseInfo.amount.toLocaleString()} {purchaseInfo.currency}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-semibold">{formatTimestamp(purchaseInfo.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">{purchaseInfo.buyerEmail}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge variant="secondary" className="capitalize">
                    {purchaseInfo.paymentMethod} Payment
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-500" />
                  Download Files ({downloadItems.length} files)
                </CardTitle>
                <div className="flex gap-2">
                  {process.env.NODE_ENV === 'development' && purchaseInfo && (
                    <Button
                      onClick={() => sendDownloadEmail(purchaseInfo as PurchaseInfo & { productData?: { images: string[] } }, downloadItems)}
                      variant="outline"
                      size="sm"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Test Email
                    </Button>
                  )}
                  <Button
                    onClick={downloadAll}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {downloadItems.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      {getFileIcon(item.type)}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.format} • {item.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {downloadProgress[item.id] !== undefined && downloadProgress[item.id] < 100 && (
                        <div className="w-24">
                          <Progress value={downloadProgress[item.id]} className="h-2" />
                        </div>
                      )}

                      {downloadedItems.has(item.id) ? (
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Downloaded
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Re-download
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
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          {item.url !== '#' && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={item.name}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {index < downloadItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* License Information */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <FileText className="w-5 h-5" />
                License & Usage Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 dark:text-green-300">
              <div className="space-y-2 text-sm">
                <p>✅ <strong>Commercial Use:</strong> Use in commercial projects and products</p>
                <p>✅ <strong>Unlimited Usage:</strong> No restrictions on number of uses</p>
                <p>✅ <strong>Modification:</strong> Edit, crop, and modify as needed</p>
                <p>✅ <strong>Distribution:</strong> Include in your final products</p>
                <p>❌ <strong>Resale:</strong> Cannot resell as standalone digital asset</p>
                <p>❌ <strong>Ownership Claims:</strong> Cannot claim ownership of original work</p>
              </div>
              <Separator className="my-4 bg-green-200 dark:bg-green-700" />
              <p className="text-xs">
                Full license agreement is included in your download package.
                For questions, contact <strong>traveltelly@primal.net</strong>
              </p>
            </CardContent>
          </Card>

          {/* Support & Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Download Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Save files to a secure location</li>
                    <li>• Keep license agreement for records</li>
                    <li>• Download expires in 30 days</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Need Help?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email: traveltelly@primal.net</li>
                    <li>• Response time: 24 hours</li>
                    <li>• Include order ID in messages</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <Link to="/marketplace">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse More Media
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (purchaseInfo) {
                      const downloadToken = btoa(`${purchaseInfo.orderId}:${purchaseInfo.buyerEmail}:${purchaseInfo.timestamp}`);
                      const downloadUrl = `${window.location.origin}/download/${purchaseInfo.orderId}?token=${downloadToken}&email=${encodeURIComponent(purchaseInfo.buyerEmail)}`;
                      const subject = `Your Digital Media Download - Order #${purchaseInfo.orderId}`;
                      const body = `Hi there!\n\nYour digital media purchase is ready for download:\n\nProduct: ${purchaseInfo.productTitle}\nOrder ID: ${purchaseInfo.orderId}\nDownload Link: ${downloadUrl}\n\nThis link will expire in 30 days.\n\nBest regards,\nTravelTelly`;

                      const mailtoLink = `mailto:${purchaseInfo.buyerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(mailtoLink);
                    }
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Myself Link
                </Button>
                <Button variant="outline" asChild>
                  <a href={`mailto:traveltelly@primal.net?subject=Order Support&body=Order ID: ${purchaseInfo?.orderId}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://primal.net/traveltelly" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Follow Creator
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">
              Thank you for supporting independent creators on Nostr! 🙏
            </p>
            <p className="text-sm">
              Vibed with{" "}
              <a
                href="https://soapbox.pub/mkstack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                MKStack
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;