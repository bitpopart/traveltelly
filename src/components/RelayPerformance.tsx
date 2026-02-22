import { useEffect, useState } from 'react';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

interface RelayStats {
  url: string;
  name: string;
  connected: boolean;
  reviewCount: number;
  storyCount: number;
  tripCount: number;
  totalContent: number;
  loadTime: number; // in milliseconds
  error?: string;
}

export function RelayPerformance() {
  const { nostr } = useNostr();
  const { config, updateConfig, presetRelays } = useAppContext();
  const [stats, setStats] = useState<RelayStats[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeRelays = async () => {
    if (!presetRelays) return;
    
    setIsAnalyzing(true);
    setShowAnalysis(true);
    const results: RelayStats[] = [];

    for (const relay of presetRelays) {
      const startTime = Date.now();
      
      try {
        // Test query to get content counts
        const signal = AbortSignal.timeout(3000); // 3 second timeout per relay
        
        const [reviews, stories, trips] = await Promise.all([
          nostr.query([{ kinds: [34879], limit: 100 }], { signal, relays: [relay.url] }),
          nostr.query([{ kinds: [30023], limit: 100 }], { signal, relays: [relay.url] }),
          nostr.query([{ kinds: [30025], limit: 100 }], { signal, relays: [relay.url] }),
        ]);

        const loadTime = Date.now() - startTime;
        
        results.push({
          url: relay.url,
          name: relay.name,
          connected: true,
          reviewCount: reviews.length,
          storyCount: stories.length,
          tripCount: trips.length,
          totalContent: reviews.length + stories.length + trips.length,
          loadTime,
        });
      } catch (error) {
        const loadTime = Date.now() - startTime;
        results.push({
          url: relay.url,
          name: relay.name,
          connected: false,
          reviewCount: 0,
          storyCount: 0,
          tripCount: 0,
          totalContent: 0,
          loadTime,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    }

    // Sort by total content (descending), then by load time (ascending)
    results.sort((a, b) => {
      if (b.totalContent !== a.totalContent) {
        return b.totalContent - a.totalContent;
      }
      return a.loadTime - b.loadTime;
    });

    setStats(results);
    setIsAnalyzing(false);
  };

  const switchToRelay = (relayUrl: string) => {
    updateConfig((current) => ({
      ...current,
      relayUrls: [relayUrl],
    }));
  };

  const currentRelay = config.relayUrls[0];
  const bestRelay = stats.length > 0 ? stats[0] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Relay Performance
        </CardTitle>
        <CardDescription>
          Test relays to find the fastest with most content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={analyzeRelays} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Relays...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Test All Relays
            </>
          )}
        </Button>

        {showAnalysis && stats.length > 0 && (
          <div className="space-y-3">
            {bestRelay && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="bg-green-600">
                    🏆 Best Relay
                  </Badge>
                  <span className="font-semibold">{bestRelay.name}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>📊 Total Content: {bestRelay.totalContent} items</div>
                  <div>⚡ Load Time: {bestRelay.loadTime}ms</div>
                  <div className="text-xs">
                    {bestRelay.reviewCount} reviews • {bestRelay.storyCount} stories • {bestRelay.tripCount} trips
                  </div>
                </div>
                {currentRelay !== bestRelay.url && (
                  <Button
                    size="sm"
                    onClick={() => switchToRelay(bestRelay.url)}
                    className="mt-2 w-full bg-green-600 hover:bg-green-700"
                  >
                    Switch to {bestRelay.name}
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              {stats.map((relay, index) => (
                <div
                  key={relay.url}
                  className={`p-3 border rounded-lg ${
                    currentRelay === relay.url
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {index === 0 && relay.connected && (
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      )}
                      <span className="font-medium">{relay.name}</span>
                      {currentRelay === relay.url && (
                        <Badge variant="default" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    {!relay.connected && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {relay.connected ? (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Content:</span>
                        <span className="font-medium">{relay.totalContent} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span className="font-medium">{relay.loadTime}ms</span>
                      </div>
                      <div className="text-xs opacity-70">
                        {relay.reviewCount} reviews • {relay.storyCount} stories • {relay.tripCount} trips
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-red-500">
                      {relay.error || 'Failed to connect'}
                    </div>
                  )}

                  {currentRelay !== relay.url && relay.connected && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => switchToRelay(relay.url)}
                      className="mt-2 w-full text-xs"
                    >
                      Switch to {relay.name}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
