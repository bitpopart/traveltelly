import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useZapAnalytics } from '@/hooks/useZapAnalytics';
import { genUserName } from '@/lib/genUserName';
import { 
  Zap, 
  ArrowLeft,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Wallet,
  Award,
  MessageSquare
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';

function StatCard({ title, value, icon: Icon, color, subtitle }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopZapperCard({ pubkey, amount, count }: { pubkey: string; amount: number; count: number }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-sm">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">{count} zaps</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-orange-500">{amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">sats</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentZapCard({ zap }: { zap: { id: string; amount: number; sender?: string; comment: string; timestamp: number } }) {
  const author = useAuthor(zap.sender);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || (zap.sender ? genUserName(zap.sender) : 'Anonymous');
  const profileImage = metadata?.picture;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="text-sm">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">{displayName}</p>
              <Badge variant="secondary" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                <Zap className="w-3 h-3 mr-1" />
                {zap.amount.toLocaleString()} sats
              </Badge>
            </div>
            {zap.comment && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                <MessageSquare className="w-3 h-3 inline mr-1" />
                {zap.comment}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(zap.timestamp * 1000), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Zaplytics() {
  const { user, metadata } = useCurrentUser();
  const { data: analytics, isLoading } = useZapAnalytics(user?.pubkey);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const displayName = metadata?.name || genUserName(user.pubkey);
  const lightningAddress = metadata?.lud16 || metadata?.lud06;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <Link to="/my-travels">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Travels
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold">Zaplytics</h1>
                <p className="text-sm md:text-base text-muted-foreground">Lightning Zap Analytics</p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-semibold text-sm md:text-base">{displayName}</p>
                  {lightningAddress ? (
                    <p className="text-xs md:text-sm text-muted-foreground font-mono">
                      ⚡ {lightningAddress}
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600">
                      No Lightning address set - Add lud16 to your profile to receive zaps
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard
                title="Total Earnings"
                value={`${analytics?.totalSats.toLocaleString() || 0}`}
                subtitle="sats"
                icon={Zap}
                color="#f97316"
              />
              <StatCard
                title="Total Zaps"
                value={analytics?.totalZaps.toLocaleString() || 0}
                subtitle="received"
                icon={TrendingUp}
                color="#8b5cf6"
              />
              <StatCard
                title="Average Zap"
                value={`${analytics?.averageZap.toLocaleString() || 0}`}
                subtitle="sats"
                icon={BarChart3}
                color="#3b82f6"
              />
              <StatCard
                title="Top Supporters"
                value={analytics?.topZappers.length || 0}
                subtitle="unique zappers"
                icon={Users}
                color="#10b981"
              />
            </div>
          )}

          {/* Top Zappers */}
          {!isLoading && analytics && analytics.topZappers.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Top Supporters
                </CardTitle>
                <CardDescription>Your most generous zappers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.topZappers.map((zapper, index) => (
                  <TopZapperCard
                    key={zapper.pubkey}
                    pubkey={zapper.pubkey}
                    amount={zapper.amount}
                    count={zapper.count}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Zaps */}
          {!isLoading && analytics && analytics.recentZaps.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Recent Zaps
                </CardTitle>
                <CardDescription>Latest 20 zaps received</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.recentZaps.map((zap) => (
                  <RecentZapCard key={zap.id} zap={zap} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && analytics && analytics.totalZaps === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">No zaps received yet</h3>
                <p className="text-muted-foreground mb-4">
                  {lightningAddress 
                    ? 'Share your content and start receiving Lightning zaps!'
                    : 'Add a Lightning address to your profile to receive zaps'}
                </p>
                {!lightningAddress && (
                  <Button asChild>
                    <Link to="/settings">Setup Lightning Address</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm md:text-base">About Zaplytics</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Zaplytics shows analytics for Lightning zaps (tips) you've received on Nostr. 
                    All data is fetched directly from Nostr relays using NIP-57 zap receipts (kind 9735).
                  </p>
                  {lightningAddress && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Your Lightning Address:</strong> <code className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded">{lightningAddress}</code>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
