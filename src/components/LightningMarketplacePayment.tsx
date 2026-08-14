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
import { Zap, Loader2, CheckCircle, Copy, Clock } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface LightningMarketplacePaymentProps {
  product: MarketplaceProduct;
  onSuccess: () => void;
}

interface OrderResponse {
  orderId: string;
  invoice: string;
  paymentHash: string;
  amountSats: number;
  status: string;
}

interface VerifyResponse {
  orderId?: string;
  status?: string;
  paid?: boolean;
  reason?: string;
}

// API endpoints are same-origin on the Netlify deployment (Netlify Functions
// proxied under /api/*). CORS is handled server-side for cross-origin dev.
const API = {
  orders: '/api/orders',
  verify: '/api/verify-payment',
};

function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function LightningMarketplacePayment({ product, onSuccess }: LightningMarketplacePaymentProps) {
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [message, setMessage] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'invoice' | 'verifying' | 'pending' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [invoice, setInvoice] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

  const { toast } = useToast();
  const priceInfo = usePriceConversion(product.price, product.currency);
  const amountSats = priceInfo.sats ? parseInt(priceInfo.sats.replace(/[^\d]/g, ''), 10) : 0;

  const isFree = product.event.tags.some((t) => t[0] === 'free' && t[1] === 'true');

  // ── Create invoice + server-side order ─────────────────────────────────────
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
      const res = await postJson(API.orders, {
        amountSats,
        productId: product.id,
        productTitle: product.title,
        buyerEmail: buyerEmail.trim(),
        buyerName: buyerName.trim() || undefined,
        message: message.trim() || undefined,
        images: product.images,
        seller: product.seller,
        mediaType: product.mediaType,
        contentCategory: product.contentCategory,
        description: product.description,
        category: product.category,
      });
      const data = (await res.json().catch(() => ({}))) as OrderResponse;
      if (!res.ok || !data.orderId) {
        throw new Error(data && 'error' in data && (data as any).error?.message ? (data as any).error.message : 'Could not create your order. Please try again.');
      }

      setOrderId(data.orderId);
      setInvoice(data.invoice);
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(data.invoice)}`);
      setPaymentStep('invoice');

      // Auto-pay via WebLN if available — then provide cryptographic proof.
      if (window.webln) {
        try {
          await window.webln.enable();
          const result = await window.webln.sendPayment(data.invoice);
          if (result.preimage) {
            await submitVerification(data.orderId, result.preimage);
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

  // ── Server-side payment verification ───────────────────────────────────────
  const submitVerification = async (id: string, preimage?: string) => {
    setPaymentStep('verifying');
    setVerifyMsg(preimage ? 'Verifying your payment…' : 'Checking payment status…');

    let res: Response;
    try {
      res = await postJson(API.verify, { orderId: id, preimage });
    } catch {
      // Network failure — don't grant anything, send them to the order page.
      finishToDownload(id, true);
      return;
    }
    const data = (await res.json().catch(() => ({}))) as VerifyResponse;

    if (data.paid || data.status === 'PAID') {
      setPaymentStep('success');
      toast({ title: 'Payment confirmed! ⚡', description: 'Redirecting to your download page…' });
      setTimeout(() => { window.location.href = downloadUrl(id); }, 1200);
      onSuccess();
      return;
    }

    // Not provably paid yet (e.g. paid in an external wallet with no WebLN proof).
    finishToDownload(id, false);
  };

  const finishToDownload = (id: string, confirmSent: boolean) => {
    setPaymentStep(confirmSent ? 'verifying' : 'pending');
    setVerifyMsg('We’ll open your download once payment is confirmed.');
    toast({
      title: confirmSent ? 'We’ll confirm shortly' : 'Payment not yet verified',
      description: 'Your order is recorded. We’ll unlock the download once the Lightning payment is confirmed.',
      variant: confirmSent ? 'default' : 'destructive',
    });
    setTimeout(() => { window.location.href = downloadUrl(id); }, 1500);
  };

  const downloadUrl = (id: string) =>
    `${window.location.origin}/download/${id}?email=${encodeURIComponent(buyerEmail)}`;

  // ── "I've Paid" — ask the server to reconcile (this DOES NOT self-grant) ─
  const handlePaymentConfirmed = async () => {
    if (!orderId) return;
    await submitVerification(orderId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Lightning invoice copied to clipboard.' });
  };

  // ── Verifying / success state ──────────────────────────────────────────────
  if (paymentStep === 'verifying' || paymentStep === 'success') {
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

  // ── Pending (paid externally, awaiting Rizful confirmation) ────────────────
  if (paymentStep === 'pending') {
    return (
      <div className="text-center py-8 space-y-4">
        <Clock className="w-16 h-16 mx-auto text-amber-500" />
        <p className="font-semibold text-lg">Order received — awaiting payment confirmation</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We’re confirming your Lightning payment. Once Rizful confirms it, your download
          will unlock automatically. Opening your order page…
        </p>
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
                  <Zap className="w-4 h-4" />
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
            3. Click <strong>"I've Paid"</strong> — your download unlocks once the payment is confirmed
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
            Paying to: <strong>bitpopart@rizful.com</strong> · Verified server-side before unlock
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
          <p className="text-xs text-muted-foreground">Download link will be unlocked on your order page</p>
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
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating order…</>
        ) : (
          <><Zap className="w-4 h-4 mr-2 fill-current" /> Create Lightning Invoice</>
        )}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>⚡ <strong>WebLN:</strong> If you have Alby or another WebLN extension, payment is automatic and verified in-browser.</p>
        <p>📱 <strong>Mobile:</strong> Scan the QR with Phoenix, Wallet of Satoshi, Blink, or any Lightning wallet.</p>
        <p>🔒 <strong>Verified:</strong> Downloads unlock only after the server confirms payment — no trust-based buttons.</p>
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
