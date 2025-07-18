import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { nip19 } from 'nostr-tools';
import { Shield } from 'lucide-react';

export function AdminDebugInfo() {
  const { user } = useCurrentUser();
  const { isAdmin, hasPermission, isCheckingPermission } = useReviewPermissions();

  if (!import.meta.env.DEV) {
    return null;
  }

  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Admin Debug Info (Development Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <p className="font-medium mb-1">Current User:</p>
          {user ? (
            <div className="space-y-1">
              <p><strong>Pubkey (hex):</strong> <span className="font-mono">{user.pubkey}</span></p>
              <p><strong>Npub:</strong> <span className="font-mono">{nip19.npubEncode(user.pubkey)}</span></p>
            </div>
          ) : (
            <p className="text-muted-foreground">Not logged in</p>
          )}
        </div>

        <div>
          <p className="font-medium mb-1">Expected Admin:</p>
          <div className="space-y-1">
            <p><strong>Npub:</strong> <span className="font-mono">{ADMIN_NPUB}</span></p>
            <p><strong>Hex:</strong> <span className="font-mono">{ADMIN_HEX}</span></p>
          </div>
        </div>

        <div>
          <p className="font-medium mb-1">Permission Status:</p>
          <div className="space-y-1">
            <p><strong>Is Admin:</strong> <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>{String(isAdmin)}</span></p>
            <p><strong>Has Permission:</strong> <span className={hasPermission ? 'text-green-600' : 'text-red-600'}>{String(hasPermission)}</span></p>
            <p><strong>Is Checking:</strong> {String(isCheckingPermission)}</p>
            <p><strong>Pubkeys Match:</strong> <span className={user?.pubkey === ADMIN_HEX ? 'text-green-600' : 'text-red-600'}>{String(user?.pubkey === ADMIN_HEX)}</span></p>
          </div>
        </div>

        {user?.pubkey === ADMIN_HEX && (
          <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 font-medium">✅ You are logged in as the Traveltelly admin!</p>
          </div>
        )}

        {user && user.pubkey !== ADMIN_HEX && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-700 dark:text-yellow-300 font-medium">⚠️ You are not the Traveltelly admin</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}