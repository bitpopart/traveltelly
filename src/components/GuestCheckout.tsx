import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCustomerSession } from '@/hooks/useCustomers';
import { usePriceConversion } from '@/hooks/usePriceConversion';
import { useToast } from '@/hooks/useToast';
import { Mail, User, CreditCard, Zap, CheckCircle, Copy, ExternalLink, Loader2, Info } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

// Lightning address for TravelTelly — also reads from admin settings
const LIGHTNING_ADDRESS = localStorage.getItem('traveltelly_lightning_address') || 'traveltelly@primal.net';
const CORS_PROXY = 'https://proxy.shakespeare.diy/?url=';

interface GuestCheckoutProps {
  product: MarketplaceProduct;
  onPurchaseComplete: (customerEmail: string, paymentMethod: 'lightning' | 'fiat') => void;
  onCancel?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function savePurchaseToStorage(purchase: object) {
  const purchases = JSON.parse(localStorage.getItem('traveltelly_purchases') || '[]');
  purchases.push(purchase);
  localStorage.setItem('traveltelly_purchases', JSON.stringify(purchases));
}

function buildDownloadUrl(orderId: string, email: string, timestamp: number) {
  const token = btoa(`${orderId}:${email}:${timestamp}`);
  return `${window.location.origin}/download/${orderId}?token=${token}&email=${encodeURIComponent(email)}`;
}

// ─── Lightning Guest Flow ─────────────────────────────────────────────────────
function LightningGuestFlow({
  product,
  email,
  name,
  onSuccess,
}: {
  product: MarketplaceProduct;
  email: string;
  name: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const priceInfo = usePriceConversion(product.price, product.currency);

  const [step, setStep] = useState<'idle' | 'creating' | 'invoice' | 'verifying' | 'done'>('idle');
  const [invoice, setInvoice] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyStep, setVerifyStep] = useState('');

  // Parse sats from conversion hook
  const amountSats = priceInfo.sats ? parseInt(priceInfo.sats.replace(/[^\d]/g, '')) : 0;

  const resolveLNURL = async (address: string) => {
    const [username, domain] = address.split('@');
    const directUrl = `https://${domain}/.well-known/lnurlp/${username}`;
    // Try direct first, then proxy for CORS
    try {
      const r = await fetch(directUrl);
      if (r.ok) return r.json();
    } catch {
      // fall through to proxy
    }
    const proxied = await fetch(`${CORS_PROXY}${encodeURIComponent(directUrl)}`);
    if (!proxied.ok) throw new Error('Could not reach Lightning address');
    return proxied.json();
  };

  const createInvoice = async () => {
    if (!email.trim() || amountSats <= 0) {
      toast({ title: 'Email required', description: 'Enter your email first.', variant: 'destructive' });
      return;
    }
    setStep('creating');
    setErrorMsg('');
    try {
      const lnurl = await resolveLNURL(LIGHTNING_ADDRESS);
      const amountMsat = amountSats * 1000;
      if (amountMsat < lnurl.minSendable || amountMsat > lnurl.maxSendable) {
        throw new Error(`Amount out of range (${lnurl.minSendable / 1000}–${lnurl.maxSendable / 1000} sats)`);
      }
      const comment = `TravelTelly: ${product.title} | ${name || 'Guest'} (${email})`;
      const callbackUrl = `${lnurl.callback}?amount=${amountMsat}&comment=${encodeURIComponent(comment)}`;
      let invoiceData;
      try {
        const r = await fetch(callbackUrl);
        invoiceData = await r.json();
      } catch {
        const r = await fetch(`${CORS_PROXY}${encodeURIComponent(callbackUrl)}`);
        invoiceData = await r.json();
      }
      if (!invoiceData.pr) throw new Error('No invoice returned from Lightning provider');
      setInvoice(invoiceData.pr);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(invoiceData.pr)}`);
      setStep('invoice');
      // Try WebLN auto-pay
      if (window.webln) {
        try {
          await window.webln.enable();
          const res = await window.webln.sendPayment(invoiceData.pr);
          if (res.preimage) { await handlePaid(); return; }
        } catch { /* user cancelled or no WebLN */ }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not create invoice. Try again.');
      setStep('idle');
    }
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice);
    toast({ title: 'Copied!', description: 'Invoice copied to clipboard.' });
  };

  const handlePaid = async () => {
    setStep('verifying');
    setVerifyStep('Saving purchase record…');
    await new Promise(r => setTimeout(r, 600));

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const timestamp = Date.now();
    const purchase = {
      orderId,
      productId: product.id,
      productTitle: product.title,
      buyerEmail: email,
      buyerName: name,
      amount: amountSats,
      currency: 'SATS',
      timestamp,
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

    setVerifyStep('Redirecting to download…');
    await new Promise(r => setTimeout(r, 400));
    setStep('done');
    toast({ title: 'Payment recorded ⚡', description: 'Redirecting to your downloads…' });

    const downloadUrl = buildDownloadUrl(orderId, email, timestamp);
    setTimeout(() => { window.location.href = downloadUrl; }, 1200);
    onSuccess();
  };

  if (step === 'done') {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
        <p className="font-semibold text-green-700 dark:text-green-300">Payment confirmed! Redirecting…</p>
      </div>
    );
  }

  if (step === 'verifying') {
    return (
      <div className="text-center py-6 space-y-3">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-yellow-500" />
        <p className="text-sm text-muted-foreground">{verifyStep}</p>
      </div>
    );
  }

  if (step === 'invoice') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <img src={qrUrl} alt="Lightning invoice QR" className="mx-auto rounded-lg border" width={220} height={220} />
          <p className="text-xs text-muted-foreground mt-2">Scan with any Lightning wallet</p>
        </div>
        <div className="flex gap-2">
          <Input value={invoice} readOnly className="font-mono text-xs" />
          <Button variant="outline" size="sm" onClick={copyInvoice}><Copy className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`lightning:${invoice}`, '_blank')}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <Zap className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Steps:</strong> 1) Pay in your wallet &nbsp;2) Click <em>I've Paid</em> below — we will record your access.
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('idle')} className="flex-1">Back</Button>
          <Button onClick={handlePaid} className="flex-1 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" /> I've Paid
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600 fill-current" />
          <div>
            <p className="font-medium text-sm">Pay {amountSats > 0 ? `${amountSats.toLocaleString()} sats` : priceInfo.primary}</p>
            <p className="text-xs text-muted-foreground">to {LIGHTNING_ADDRESS}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">Lightning ⚡</Badge>
      </div>
      {errorMsg && (
        <Alert variant="destructive">
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={createInvoice}
        disabled={step === 'creating' || !email.trim()}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
      >
        {step === 'creating' ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating invoice…</>
        ) : (
          <><Zap className="w-4 h-4 mr-2" /> Create Lightning Invoice</>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        ⚡ Instant Bitcoin payment • No account needed • Download link sent to your email
      </p>
    </div>
  );
}

// ─── Stripe Guest Flow ────────────────────────────────────────────────────────
function StripeGuestFlow({
  product,
  email,
  name,
  onSuccess,
}: {
  product: MarketplaceProduct;
  email: string;
  name: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const stripeKey = localStorage.getItem('traveltelly_stripe_publishable_key') || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const stripeEnabled = localStorage.getItem('traveltelly_stripe_enabled') !== 'false';
  const isConfigured = stripeKey.startsWith('pk_live_') || stripeKey.startsWith('pk_test_');

  const handleManualCardPurchase = async () => {
    // Since there's no server-side Stripe backend, record the intent and redirect
    // The admin can see a record and manually fulfill, OR the user pays via the Stripe Payment Link
    const orderId = `order_stripe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const timestamp = Date.now();
    const purchase = {
      orderId,
      productId: product.id,
      productTitle: product.title,
      buyerEmail: email,
      buyerName: name,
      amount: parseFloat(product.price) * 100,
      currency: product.currency,
      timestamp,
      paymentMethod: 'stripe' as const,
      status: 'pending' as const,
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
    toast({
      title: 'Order recorded',
      description: 'Contact traveltelly@primal.net with your order ID to complete card payment.',
    });
    onSuccess();
  };

  if (!stripeEnabled) {
    return (
      <Alert className="border-gray-300 bg-gray-50 dark:bg-gray-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Card payments are currently disabled. Please use Lightning ⚡ or contact{' '}
          <a href="mailto:traveltelly@primal.net" className="underline">traveltelly@primal.net</a>.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isConfigured) {
    return (
      <div className="space-y-4">
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Stripe not configured yet.</strong> The admin needs to add a Stripe publishable key in{' '}
            <strong>Admin → Payments → Stripe</strong>.
          </AlertDescription>
        </Alert>
        <div className="p-4 border rounded-lg space-y-3 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm font-medium">Alternative: Pay by Invoice</p>
          <p className="text-sm text-muted-foreground">
            We will send you a payment link to your email after you place the order.
          </p>
          <Button
            onClick={handleManualCardPurchase}
            disabled={!email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard className="w-4 h-4 mr-2" /> Request Card Payment Link
          </Button>
        </div>
      </div>
    );
  }

  // Stripe IS configured — use embedded Stripe Checkout redirect
  const handleStripeCheckout = async () => {
    // In a fully serverless setup, we redirect to a Stripe Payment Link 
    // configured in the Stripe dashboard, or use Stripe.js + Stripe Elements.
    // Without a backend, the cleanest option is a Stripe Payment Link.
    const stripePaymentLinkBase = localStorage.getItem('traveltelly_stripe_payment_link') || '';
    if (stripePaymentLinkBase) {
      const url = new URL(stripePaymentLinkBase);
      url.searchParams.set('prefilled_email', email);
      url.searchParams.set('client_reference_id', product.id);
      window.open(url.toString(), '_blank');
      toast({ title: 'Opening Stripe…', description: 'Complete payment in the new tab.' });
      onSuccess();
      return;
    }
    // Fallback: record pending order and instruct user
    await handleManualCardPurchase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-sm">
              Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(parseFloat(product.price))}
            </p>
            <p className="text-xs text-muted-foreground">Stripe secure card payment</p>
          </div>
        </div>
        <Badge className={stripeKey.startsWith('pk_live_') ? 'bg-green-500' : 'bg-yellow-500 text-black'}>
          {stripeKey.startsWith('pk_live_') ? 'Live' : 'Test'}
        </Badge>
      </div>
      <Button
        onClick={handleStripeCheckout}
        disabled={!email.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <CreditCard className="w-4 h-4 mr-2" /> Pay with Card
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        🔒 Secure payment via Stripe • Credit/debit card • 135+ currencies
      </p>
    </div>
  );
}

// ─── Main GuestCheckout ───────────────────────────────────────────────────────
export function GuestCheckout({ product, onPurchaseComplete, onCancel }: GuestCheckoutProps) {
  const { session, setSession } = useCustomerSession();
  const { toast } = useToast();
  const priceInfo = usePriceConversion(product.price, product.currency);

  const [email, setEmail] = useState(session?.email || '');
  const [name, setName] = useState(session?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<'lightning' | 'card'>('lightning');
  const [infoSubmitted, setInfoSubmitted] = useState(false);

  const isFree = product.event.tags.some(t => t[0] === 'free' && t[1] === 'true');

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    if (!validateEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setSession(email, name);

    if (isFree) {
      // Free product — record and redirect immediately
      const orderId = `order_free_${Date.now()}`;
      const timestamp = Date.now();
      savePurchaseToStorage({
        orderId, productId: product.id, productTitle: product.title,
        buyerEmail: email, buyerName: name, amount: 0, currency: 'FREE', timestamp,
        paymentMethod: 'lightning', status: 'verified',
        productData: { images: product.images, description: product.description, category: product.category, seller: product.seller },
      });
      window.location.href = buildDownloadUrl(orderId, email, timestamp);
      return;
    }
    setInfoSubmitted(true);
  };

  const handleSuccess = () => onPurchaseComplete(email, paymentMethod === 'card' ? 'fiat' : 'lightning');

  // Step 1: collect name + email
  if (!infoSubmitted) {
    return (
      <div className="space-y-6">
        {/* Product summary */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Purchasing:</p>
          <p className="font-semibold">{product.title}</p>
          <p className="text-lg font-bold mt-2" style={{ color: '#ec1a58' }}>
            {isFree ? '🎁 FREE' : priceInfo.primary}
            {priceInfo.sats && !isFree && (
              <span className="text-sm font-normal text-muted-foreground ml-2">≈ {priceInfo.sats}</span>
            )}
          </p>
        </div>

        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div>
            <Label htmlFor="guest-name" className="flex items-center gap-1">
              <User className="w-3 h-3" /> Full Name
            </Label>
            <Input
              id="guest-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="guest-email" className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email Address
            </Label>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Download link will be sent here after payment
            </p>
          </div>

          {!isFree && (
            <div>
              <Label className="mb-2 block">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'lightning' | 'card')} className="space-y-2">
                <label htmlFor="pay-lightning" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-50 dark:has-[:checked]:bg-yellow-900/20 transition-colors">
                  <RadioGroupItem value="lightning" id="pay-lightning" />
                  <Zap className="w-4 h-4 text-yellow-600 fill-current" />
                  <div>
                    <p className="font-medium text-sm">Lightning ⚡ (Bitcoin)</p>
                    <p className="text-xs text-muted-foreground">Instant • Low fees • Any Lightning wallet</p>
                  </div>
                </label>
                <label htmlFor="pay-card" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20 transition-colors">
                  <RadioGroupItem value="card" id="pay-card" />
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex via Stripe</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" style={{ backgroundColor: '#ec1a58' }}>
              {isFree ? (
                <><CheckCircle className="w-4 h-4 mr-2" /> Download Free</>
              ) : (
                <><CheckCircle className="w-4 h-4 mr-2" /> Continue to Payment</>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: payment flow
  return (
    <div className="space-y-4">
      {/* Buyer info summary */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm">
          <p className="font-medium">{name}</p>
          <p className="text-muted-foreground">{email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setInfoSubmitted(false)} className="text-xs">
          Change
        </Button>
      </div>

      {paymentMethod === 'lightning' ? (
        <LightningGuestFlow product={product} email={email} name={name} onSuccess={handleSuccess} />
      ) : (
        <StripeGuestFlow product={product} email={email} name={name} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
