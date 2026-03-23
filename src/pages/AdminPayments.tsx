import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useAuthor } from '@/hooks/useAuthor';
import { nip19 } from 'nostr-tools';
import {
  ArrowLeft,
  Zap,
  CreditCard,
  Check,
  AlertCircle,
  ExternalLink,
  Copy,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Settings,
  Info,
  CheckCircle,
  Shield,
  Globe,
  Smartphone,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

// Local-storage keys for Stripe settings (editable by admin)
const LS_STRIPE_PK = 'traveltelly_stripe_publishable_key';
const LS_STRIPE_ENABLED = 'traveltelly_stripe_enabled';
const LS_LIGHTNING_ENABLED = 'traveltelly_lightning_enabled';

// ─── Lightning Address Section ─────────────────────────────────────────────────
function LightningPaymentSettings() {
  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending: isUpdating } = useNostrPublish();
  const { toast } = useToast();
  const author = useAuthor(user?.pubkey || '');
  const metadata = author.data?.metadata;

  const [lightningAddress, setLightningAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [lightningEnabled, setLightningEnabled] = useState(
    localStorage.getItem(LS_LIGHTNING_ENABLED) !== 'false'
  );

  const currentAddress = metadata?.lud16 || metadata?.lud06 || '';

  const validateLightningAddress = async (address: string) => {
    if (!address.includes('@')) { setIsValid(false); return; }
    setIsValidating(true);
    try {
      const [username, domain] = address.split('@');
      const resp = await fetch(`https://${domain}/.well-known/lnurlp/${username}`);
      const data = await resp.json();
      setIsValid(data.tag === 'payRequest' && !!data.callback);
    } catch {
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setLightningAddress(value);
    setIsValid(null);
    if (value.includes('@')) {
      const id = setTimeout(() => validateLightningAddress(value), 900);
      return () => clearTimeout(id);
    }
  };

  const handleSave = () => {
    if (!user || !lightningAddress || !isValid) return;
    createEvent({
      kind: 0,
      content: JSON.stringify({ ...(metadata || {}), lud16: lightningAddress }),
      tags: [],
    });
    toast({ title: 'Lightning address saved!', description: 'Your Nostr profile has been updated.' });
  };

  const handleToggle = (val: boolean) => {
    setLightningEnabled(val);
    localStorage.setItem(LS_LIGHTNING_ENABLED, String(val));
    toast({ title: val ? 'Lightning payments enabled' : 'Lightning payments disabled' });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    toast({ title: 'Copied!', description: 'Lightning address copied to clipboard.' });
  };

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-400">
            <Zap className="w-5 h-5 text-black fill-current" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Lightning Network Payments</p>
            <p className="text-sm text-muted-foreground">Bitcoin micropayments — instant, low fees</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={lightningEnabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
            {lightningEnabled ? 'Active' : 'Disabled'}
          </Badge>
          <Switch checked={lightningEnabled} onCheckedChange={handleToggle} />
        </div>
      </div>

      {/* Current address display */}
      {currentAddress && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">Active Lightning Address</p>
                  <p className="text-sm font-mono text-green-600 dark:text-green-400">{currentAddress}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={copyAddress} className="border-green-400 text-green-700 hover:bg-green-100">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Lightning Address</CardTitle>
          <CardDescription>
            This address receives all Lightning payments from the marketplace. It is stored in your Nostr profile (kind 0).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ln-address">Lightning Address (LNURL)</Label>
            <div className="relative">
              <Input
                id="ln-address"
                type="email"
                placeholder="you@wallet.com"
                value={lightningAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                className={isValid === true ? 'border-green-500 pr-10' : isValid === false ? 'border-red-500 pr-10' : 'pr-10'}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-yellow-500 rounded-full" />
                </div>
              )}
              {isValid === true && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
              {isValid === false && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}
            </div>
            {isValid === false && <p className="text-sm text-red-600">Invalid Lightning address. Check the format (username@domain.com).</p>}
            {isValid === true && <p className="text-sm text-green-600">Valid Lightning address confirmed!</p>}
          </div>
          <Button
            onClick={handleSave}
            disabled={!lightningAddress || !isValid || isUpdating}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            {isUpdating ? 'Saving...' : 'Save Lightning Address'}
          </Button>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            How Lightning Payments Work on Traveltelly
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Payment Flow</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Buyer selects a product and chooses Lightning</li>
                <li>An invoice is generated from your Lightning address</li>
                <li>Buyer scans QR or uses WebLN wallet</li>
                <li>Payment goes directly to your Lightning address</li>
                <li>Buyer gets download access automatically</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Benefits</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Near-zero fees (&lt;1%)</li>
                <li>Instant settlement</li>
                <li>No chargebacks</li>
                <li>Global — no banks needed</li>
                <li>Works with any Lightning wallet</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended wallets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended Lightning Wallets / Addresses</CardTitle>
          <CardDescription>Compatible providers that give you a Lightning address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Wallet of Satoshi', url: 'https://walletofsatoshi.com', desc: 'Easiest — mobile app', badge: 'Popular' },
              { name: 'Strike', url: 'https://strike.me', desc: 'USD-denominated, easy cash out', badge: 'Strike' },
              { name: 'Alby', url: 'https://getalby.com', desc: 'Browser extension + hub', badge: 'Web' },
              { name: 'Primal', url: 'https://primal.net', desc: 'Built-in Nostr wallet', badge: 'Nostr' },
              { name: 'Phoenix', url: 'https://phoenix.acinq.co', desc: 'Self-custodial mobile', badge: 'Self-custody' },
              { name: 'Blink', url: 'https://blink.sv', desc: 'Simple & reliable', badge: 'Simple' },
            ].map((w) => (
              <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors group">
                <div>
                  <p className="font-medium text-sm group-hover:text-yellow-600 transition-colors">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.desc}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">{w.badge}</Badge>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Stripe Payment Section ────────────────────────────────────────────────────
function StripePaymentSettings() {
  const { toast } = useToast();
  const [publishableKey, setPublishableKey] = useState(
    localStorage.getItem(LS_STRIPE_PK) || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  );
  const [stripeEnabled, setStripeEnabled] = useState(
    localStorage.getItem(LS_STRIPE_ENABLED) !== 'false'
  );
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLiveKey = publishableKey.startsWith('pk_live_');
  const isTestKey = publishableKey.startsWith('pk_test_');
  const isKeyValid = isLiveKey || isTestKey;

  const handleSaveStripe = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    localStorage.setItem(LS_STRIPE_PK, publishableKey);
    localStorage.setItem(LS_STRIPE_ENABLED, String(stripeEnabled));
    setIsSaving(false);
    toast({
      title: 'Stripe settings saved!',
      description: isLiveKey ? 'Live mode active — real payments enabled.' : 'Test mode active — no real charges.',
    });
  };

  const handleToggle = (val: boolean) => {
    setStripeEnabled(val);
    localStorage.setItem(LS_STRIPE_ENABLED, String(val));
    toast({ title: val ? 'Stripe payments enabled' : 'Stripe payments disabled' });
  };

  const maskedKey = publishableKey
    ? publishableKey.slice(0, 12) + '••••••••••••' + publishableKey.slice(-4)
    : '';

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-600">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Stripe Card Payments</p>
            <p className="text-sm text-muted-foreground">Credit/debit cards — USD, EUR, GBP and more</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={
            !stripeEnabled ? 'bg-gray-400 text-white' :
            isLiveKey ? 'bg-green-500 text-white' :
            isTestKey ? 'bg-yellow-500 text-black' :
            'bg-red-400 text-white'
          }>
            {!stripeEnabled ? 'Disabled' : isLiveKey ? 'Live' : isTestKey ? 'Test Mode' : 'Not Configured'}
          </Badge>
          <Switch checked={stripeEnabled} onCheckedChange={handleToggle} />
        </div>
      </div>

      {/* Key entry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stripe Publishable Key</CardTitle>
          <CardDescription>
            Find this in your{' '}
            <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1">
              Stripe Dashboard <ExternalLink className="w-3 h-3" />
            </a>{' '}
            under Developers &gt; API Keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isKeyValid && !showKey && (
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm">
              <Shield className="w-4 h-4 text-gray-500" />
              <span>{maskedKey}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowKey(true)} className="ml-auto text-xs">
                Show
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="stripe-pk">
              {showKey || !isKeyValid ? 'Publishable Key' : 'Edit Key'}
            </Label>
            <div className="relative">
              <Input
                id="stripe-pk"
                type={showKey ? 'text' : 'password'}
                placeholder="pk_live_... or pk_test_..."
                value={publishableKey}
                onChange={(e) => { setPublishableKey(e.target.value); setShowKey(true); }}
                className={
                  isLiveKey ? 'border-green-500' :
                  isTestKey ? 'border-yellow-500' :
                  publishableKey ? 'border-red-400' : ''
                }
              />
              {isLiveKey && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
              {isTestKey && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />}
            </div>
            {isLiveKey && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Live key detected — real payments will be processed.</p>}
            {isTestKey && <p className="text-sm text-yellow-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Test key — no real charges. Switch to live key for production.</p>}
            {publishableKey && !isKeyValid && <p className="text-sm text-red-600">Key must start with pk_live_ or pk_test_</p>}
          </div>

          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
              <strong>Secret Key:</strong> Never enter your Stripe <em>secret</em> key here. Only the publishable key (pk_…) is safe to store client-side. Your secret key stays on your server.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleSaveStripe}
            disabled={isSaving || !isKeyValid}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Stripe Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Supported currencies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Supported Currencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['USD 🇺🇸', 'EUR 🇪🇺', 'GBP 🇬🇧', 'CAD 🇨🇦', 'AUD 🇦🇺', 'JPY 🇯🇵', 'CHF 🇨🇭', 'SGD 🇸🇬', 'NZD 🇳🇿', 'SEK 🇸🇪'].map((c) => (
              <Badge key={c} variant="secondary" className="text-sm px-3 py-1">{c}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Stripe supports 135+ currencies. Contact Stripe for full list.</p>
        </CardContent>
      </Card>

      {/* Setup steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stripe Setup Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Create Stripe account at stripe.com', done: true, url: 'https://stripe.com' },
              { label: 'Complete business verification', done: true, url: 'https://dashboard.stripe.com/account' },
              { label: 'Activate your account (go live)', done: isLiveKey, url: 'https://dashboard.stripe.com/account/onboarding' },
              { label: 'Add publishable key above', done: isKeyValid, url: null },
              { label: 'Set up webhook for payment confirmation', done: false, url: 'https://dashboard.stripe.com/webhooks' },
              { label: 'Enable card payments in marketplace', done: stripeEnabled && isLiveKey, url: null },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {step.done ? <Check className="w-3 h-3 text-white" /> : <span className="text-xs text-gray-500">{i + 1}</span>}
                </div>
                <span className={`text-sm ${step.done ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                  {step.label}
                </span>
                {step.url && (
                  <a href={step.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
                    <ExternalLink className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Payment Overview / Sales page ────────────────────────────────────────────
function PaymentOverview() {
  // Read local settings
  const lightningEnabled = localStorage.getItem(LS_LIGHTNING_ENABLED) !== 'false';
  const stripeEnabled = localStorage.getItem(LS_STRIPE_ENABLED) !== 'false';
  const stripeKey = localStorage.getItem(LS_STRIPE_PK) || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const isLiveStripe = stripeKey.startsWith('pk_live_');
  const isTestStripe = stripeKey.startsWith('pk_test_');

  // Simulated sales stats from localStorage purchases
  const purchases = JSON.parse(localStorage.getItem('traveltelly_purchases') || '[]') as Array<{
    paymentMethod: string;
    amount: number;
    currency: string;
    timestamp: number;
    status: string;
  }>;

  const lightningPurchases = purchases.filter((p) => p.paymentMethod === 'lightning' && p.status === 'verified');
  const stripePurchases = purchases.filter((p) => p.paymentMethod === 'stripe' && p.status === 'verified');
  const totalSats = lightningPurchases.reduce((s, p) => s + (p.currency === 'SATS' ? p.amount : 0), 0);
  const totalStripeUSD = stripePurchases.reduce((s, p) => s + (p.currency === 'USD' ? p.amount / 100 : 0), 0);

  const stats = [
    { label: 'Lightning Sales', value: lightningPurchases.length, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Stripe Sales', value: stripePurchases.length, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Sats Earned', value: `${totalSats.toLocaleString()} sats`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Total Card Revenue', value: `$${totalStripeUSD.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero overview */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Payment Solutions Overview</h2>
        <p className="text-gray-300 text-sm mb-6">Traveltelly accepts two payment methods — Lightning (Bitcoin) and Stripe (cards). Both work independently and can be active simultaneously.</p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Lightning */}
          <div className={`rounded-xl p-4 border-2 ${lightningEnabled ? 'border-yellow-400 bg-yellow-500/10' : 'border-gray-600 bg-gray-700/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-yellow-400">
                  <Zap className="w-4 h-4 text-black fill-current" />
                </div>
                <span className="font-semibold">Lightning ⚡</span>
              </div>
              <Badge className={lightningEnabled ? 'bg-yellow-400 text-black' : 'bg-gray-500 text-white'}>
                {lightningEnabled ? 'Active' : 'Off'}
              </Badge>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✅ Instant Bitcoin payments</li>
              <li>✅ Near-zero fees</li>
              <li>✅ No chargebacks</li>
              <li>✅ Global reach</li>
              <li>✅ WebLN browser support</li>
            </ul>
          </div>

          {/* Stripe */}
          <div className={`rounded-xl p-4 border-2 ${stripeEnabled && isLiveStripe ? 'border-blue-400 bg-blue-500/10' : stripeEnabled && isTestStripe ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-600 bg-gray-700/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-600">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Stripe 💳</span>
              </div>
              <Badge className={
                !stripeEnabled ? 'bg-gray-500 text-white' :
                isLiveStripe ? 'bg-green-500 text-white' :
                isTestStripe ? 'bg-yellow-400 text-black' :
                'bg-red-400 text-white'
              }>
                {!stripeEnabled ? 'Off' : isLiveStripe ? 'Live' : isTestStripe ? 'Test' : 'Not set'}
              </Badge>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✅ Credit &amp; debit cards</li>
              <li>✅ 135+ currencies</li>
              <li>✅ Guest checkout</li>
              <li>✅ PCI-compliant</li>
              <li>✅ Familiar checkout UX</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className={`${s.bg} border-transparent`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-4 h-4" />
            Recent Marketplace Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No transactions yet. Sales will appear here once buyers start purchasing.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...purchases].reverse().slice(0, 10).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {p.paymentMethod === 'lightning'
                      ? <Zap className="w-4 h-4 text-yellow-600" />
                      : <CreditCard className="w-4 h-4 text-blue-600" />
                    }
                    <div>
                      <p className="text-sm font-medium capitalize">{p.paymentMethod} payment</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {p.currency === 'SATS' ? `${p.amount.toLocaleString()} sats` : `$${(p.amount / 100).toFixed(2)}`}
                    </p>
                    <Badge variant={p.status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Why both payment methods */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-base">Why Offer Both Payment Methods?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Lightning Best For
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Nostr users with Bitcoin wallets</li>
                <li>• Micro-transactions (any amount)</li>
                <li>• International buyers (no bank needed)</li>
                <li>• Instant settlement, zero chargeback risk</li>
                <li>• Privacy-conscious customers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" /> Stripe Best For
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Mainstream customers without crypto</li>
                <li>• Corporate/business licensing</li>
                <li>• Buyers who need invoices/receipts</li>
                <li>• Subscription billing</li>
                <li>• Markets where Bitcoin isn't mainstream</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">External Payment Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Stripe Dashboard', url: 'https://dashboard.stripe.com', desc: 'View sales & payouts', icon: CreditCard, color: 'text-blue-600' },
              { name: 'Strike Dashboard', url: 'https://dashboard.strike.me', desc: 'Manage Lightning wallet', icon: Zap, color: 'text-yellow-600' },
              { name: 'Primal Wallet', url: 'https://primal.net/wallet', desc: 'Nostr Lightning wallet', icon: Smartphone, color: 'text-purple-600' },
              { name: 'Alby Hub', url: 'https://hub.getalby.com', desc: 'Lightning node management', icon: Zap, color: 'text-orange-600' },
              { name: 'Stripe Webhooks', url: 'https://dashboard.stripe.com/webhooks', desc: 'Payment event hooks', icon: Settings, color: 'text-gray-600' },
              { name: 'Stripe API Keys', url: 'https://dashboard.stripe.com/apikeys', desc: 'Get your API keys', icon: Shield, color: 'text-green-600' },
            ].map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors group">
                <link.icon className={`w-5 h-5 ${link.color} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{link.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPayments() {
  const { user } = useCurrentUser();
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  if (!isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-6">Only the Traveltelly admin can access this page.</p>
              <Link to="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
                <Zap className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Payment Settings</h1>
                <p className="text-muted-foreground">Manage Lightning and Stripe payment options for the marketplace</p>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="lightning" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Lightning ⚡</span>
              </TabsTrigger>
              <TabsTrigger value="stripe" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Stripe 💳</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <PaymentOverview />
            </TabsContent>

            <TabsContent value="lightning">
              <LightningPaymentSettings />
            </TabsContent>

            <TabsContent value="stripe">
              <StripePaymentSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
