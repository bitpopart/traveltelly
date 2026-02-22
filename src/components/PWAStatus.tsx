import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Wifi,
  WifiOff,
  Smartphone,
  Globe,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
  HardDrive,
} from 'lucide-react';

export function PWAStatus() {
  const {
    isSupported,
    isRegistered,
    version,
    isStandalone,
    isOnline,
    cacheStats,
    checkForUpdates,
    clearCache,
    refreshCacheStats,
  } = useServiceWorker();

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            Connection Status
          </CardTitle>
          <CardDescription>
            Current network connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {!isOnline && (
              <span className="text-sm text-muted-foreground">
                Using cached content
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Service Worker
          </CardTitle>
          <CardDescription>
            PWA offline functionality status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Supported</div>
              <div className="flex items-center gap-2">
                {isSupported ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">No</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1">Registered</div>
              <div className="flex items-center gap-2">
                {isRegistered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">Not Active</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {version && (
            <div>
              <div className="text-sm font-medium mb-1">Version</div>
              <Badge variant="outline">{version}</Badge>
            </div>
          )}

          <Button
            onClick={checkForUpdates}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Check for Updates
          </Button>
        </CardContent>
      </Card>

      {/* Installation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Installation
          </CardTitle>
          <CardDescription>
            PWA installation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isStandalone ? "default" : "outline"}>
              {isStandalone ? 'Installed (Standalone)' : 'Running in Browser'}
            </Badge>
          </div>

          {!isStandalone && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Install as App</AlertTitle>
              <AlertDescription>
                Install TravelTelly on your device for a native app experience.
                Look for the install button in your browser's menu.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Cache Storage
          </CardTitle>
          <CardDescription>
            Offline content stored on device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cacheStats ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Cache Count</div>
                  <div className="text-2xl font-bold">{cacheStats.cacheCount}</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Total Size</div>
                  <div className="text-2xl font-bold">{cacheStats.formattedSize}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={refreshCacheStats}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>

                <Button
                  onClick={clearCache}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Cached files allow the app to work offline. Clearing cache will
                  require re-downloading content when online.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Loading cache statistics...
            </div>
          )}
        </CardContent>
      </Card>

      {/* PWA Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            PWA Features
          </CardTitle>
          <CardDescription>
            Progressive Web App capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Offline support with Service Worker</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Smart caching strategies</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>App-like experience when installed</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Automatic background updates</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Push notification support</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Background sync (coming soon)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
