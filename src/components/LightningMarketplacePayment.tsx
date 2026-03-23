import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { usePriceConversion } from '@/hooks/usePriceConversion';
import { Zap, Loader2, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface LightningMarketplacePaymentProps {
  product: MarketplaceProduct;
  onSuccess: () => void;
}

interface LNURLPayResponse {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: string;
}

interface InvoiceResponse {
  pr: string;
  successAction?: { tag: string; message?: string; url?: string };
}

// CORS proxy & Lightning address — prefer admin-configured value
const CORS_PROXY = 'https://proxy.shakespeare.diy/?url=';
const LIGHTNING_ADDRESS =
  localStorage.getItem('traveltelly_lightning_address') || 'traveltelly@primal.net';

async function fetchWithProxy(url: string): Promise<Response> {
  // Try direct first (works when CORS allows)
  try {
    const r = await fetch(url, { mode: 'cors' });
    if (r.ok) return r;
  } catch { /* fall through */ }
  // Use proxy
  return fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
}

async function resolveLNURL(address: string): Promise<LNURLPayResponse> {
  const [username, domain] = address.split('@');
  const url = `https://${domain}/.well-known/lnurlp/${username}`;
  const r = await fetchWithProxy(url);
  if (!r.ok) throw new Error('Cannot reach Lightning address. Check address or try again.');
  const data = await r.json();
  if (data.tag !== 'payRequest') throw new Error('Invalid LNURL response.');
  return data;
}

async function createInvoiceFromLNURL(
  lnurl: LNURLPayResponse,
  amountMsat: number,
  comment: string
): Promise<InvoiceResponse> {
  const callbackUrl = `${lnurl.callback}?amount=${amountMsat}&comment=${encodeURIComponent(comment)}`;
  const r = await fetchWithProxy(callbackUrl);
  if (!r.ok) throw new Error('Could not generate Lightning invoice.');
  const data = await r.json();
  if (!data.pr) throw new Error(data.reason || 'No invoice returned.');
  return data;
}

function savePurchaseToStorage(purchase: object) {
  const purchases = JSON.parse(localStorage.getItem('traveltelly_purchases') || '[]');
  purchases.push(purchase);
  localStorage.setItem('traveltelly_purchases', JSON.stringify(purchases));
}

export function LightningMarketplacePayment({ product, onSuccess }: LightningMarketplacePaymentProps) {
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [message, setMessage] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'invoice' | 'verifying' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

  const { toast } = useToast();
  const priceInfo = usePriceConversion(product.price, product.currency);
  const amountSats = priceInfo.sats ? parseInt(priceInfo.sats.replace(/[^\d]/g, '')) : 0;

  const isFree = product.event.tags.some(t => t[0] === 'free' && t[1] === 'true');

  // ── Create invoice ──────────────────────────────────────────────────────────
  const handleCreateInvoice = async () => {
    if (!buyerEmail.trim()) {
      toast({ title: 'Email required', description: 'Enter your email so we can send the download link.', variant: 'destructive' });
      return;
    }
    if (amountSats <= 0 && !isFree) {
      toast({ title: 'Price unavailable', description: 'Could not calculate sats amount. Try again in a moment.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const lnurl = await resolveLNURL(LIGHTNING_ADDRESS);
      const amountMsat = amountSats * 1000;

      if (amountMsat < lnurl.minSendable || amountMsat > lnurl.maxSendable) {
        throw new Error(
          `Amount (${amountSats} sats) out of range for this Lightning address. ` +
          `Min: ${lnurl.minSendable / 1000}, Max: ${lnurl.maxSendable / 1000} sats.`
        );
      }

      const comment = `TravelTelly: ${product.title}${buyerName ? ` | ${buyerName}` : ''} (${buyerEmail})${message ? ` — ${message}` : ''}`;
      const invoiceData = await createInvoiceFromLNURL(lnurl, amountMsat, comment);

      setInvoice(invoiceData.pr);
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(invoiceData.pr)}`);
      setPaymentStep('invoice');

      // Auto-pay via WebLN if available
      if (window.webln) {
        try {
          await window.webln.enable();
          const result = await window.webln.sendPayment(invoiceData.pr);
          if (result.preimage) {
            await handlePaymentConfirmed();
            return;
          }
        } catch (weblnErr) {
          console.log('WebLN not available or user cancelled:', weblnErr);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not create invoice. Please try again.';
      setErrorMsg(msg);
      toast({ title: 'Invoice creation failed', description: msg, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Record & redirect after payment ────────────────────────────────────────
  const handlePaymentConfirmed = async () => {
    setPaymentStep('verifying');
    setVerifyMsg('Recording your purchase…');
    await new Promise(r => setTimeout(r, 500));

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const timestamp = Date.now();

    const purchase = {
      orderId,
      productId: product.id,
      productTitle: product.title,
      buyerEmail,
      buyerName,
      amount: amountSats,
      currency: 'SATS',
      timestamp,
      invoice,
      paymentMethod: 'lightning' as const,
      status: 'verified' as const,
      productData: {
        images: product.images,
        description: product.description,
        category: product.category,
        mediaType: product.mediaType,
        contentCategory: product.contentCategory,
        seller: product.seller,
      },
    };
    savePurchaseToStorage(purchase);

    setVerifyMsg('Redirecting to downloads…');
    setPaymentStep('success');

    toast({ title: 'Payment confirmed! ⚡', description: 'Redirecting to your download page…' });

    const token = btoa(`${orderId}:${buyerEmail}:${timestamp}`);
    const downloadUrl = `${window.location.origin}/download/${orderId}?token=${token}&email=${encodeURIComponent(buyerEmail)}`;
    setTimeout(() => { window.location.href = downloadUrl; }, 1500);
    onSuccess();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Lightning invoice copied to clipboard.' });
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (paymentStep === 'success' || paymentStep === 'verifying') {
    return (
      <div className="text-center py-8 space-y-4">
        {paymentStep === 'verifying' ? (
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-yellow-500" />
        ) : (
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        )}
        <p className="font-semibold text-lg">{paymentStep === 'verifying' ? 'Processing…' : 'Payment Confirmed! ⚡'}</p>
        <p className="text-sm text-muted-foreground">{verifyMsg || 'Redirecting to your download page…'}</p>
      </div>
    );
  }

  // ── Invoice display ─────────────────────────────────────────────────────────
  if (paymentStep === 'invoice') {
    return (
      <div className="space-y-5">
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-base">
              <Zap className="w-5 h-5 fill-current" />
              Lightning Invoice — {amountSats.toLocaleString()} sats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <img src={qrCodeUrl} alt="Lightning QR" className="mx-auto border rounded-lg bg-white p-2" width={256} height={256} />
              <p className="text-xs text-muted-foreground mt-2">Scan with any Lightning wallet</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Invoice string</Label>
              <div className="flex gap-2">
                <Input value={invoice} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(invoice)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`lightning:${invoice}`, '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <Zap className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>How to pay:</strong><br />
            1. Scan the QR code OR copy the invoice into your Lightning wallet<br />
            2. Confirm the payment in your wallet<br />
            3. Click <strong>"I've Paid"</strong> — your download will open immediately
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPaymentStep('form')} className="flex-1">
            ← Back
          </Button>
          <Button
            onClick={handlePaymentConfirmed}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> I've Paid
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Amount summary */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600 fill-current" />
              <span className="font-medium">Lightning Payment</span>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-yellow-700 dark:text-yellow-300">
                {amountSats > 0 ? `${amountSats.toLocaleString()} sats` : priceInfo.primary}
              </Badge>
              {priceInfo.primary && amountSats > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{priceInfo.primary}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Paying to: <strong>{LIGHTNING_ADDRESS}</strong>
          </p>
        </CardContent>
      </Card>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Buyer info */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ln-email">Email Address <span className="text-red-500">*</span></Label>
          <Input
            id="ln-email"
            type="email"
            placeholder="you@example.com"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Download link will be sent here</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ln-name">Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            id="ln-name"
            placeholder="Your name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ln-msg">Message to creator <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            id="ln-msg"
            placeholder="License question, project description…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            maxLength={280}
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/280</p>
        </div>
      </div>

      <Button
        onClick={handleCreateInvoice}
        disabled={isProcessing || !buyerEmail.trim() || (amountSats <= 0 && !isFree)}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        size="lg"
      >
        {isProcessing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating invoice…</>
        ) : (
          <><Zap className="w-4 h-4 mr-2 fill-current" /> Create Lightning Invoice</>
        )}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>⚡ <strong>WebLN:</strong> If you have Alby or another WebLN extension, payment will be automatic.</p>
        <p>📱 <strong>Mobile:</strong> Scan the QR with Phoenix, Wallet of Satoshi, Blink, or any Lightning wallet.</p>
        <p>🔒 <strong>Privacy:</strong> No Nostr account required. Payment goes directly to the creator.</p>
      </div>
    </div>
  );
}

// Extend Window interface for WebLN
declare global {
  interface Window {
    webln?: {
      enable(): Promise<void>;
      sendPayment(paymentRequest: string): Promise<{ preimage: string }>;
    };
  }
}
