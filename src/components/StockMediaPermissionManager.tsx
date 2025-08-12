import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  useStockMediaPermissionRequests, 
  useGrantStockMediaPermission, 
  useBlockStockMediaRequest,
  useRevokeStockMediaPermission 
} from '@/hooks/useStockMediaPermissions';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { getShortNpub } from '@/lib/nostrUtils';
import { useToast } from '@/hooks/useToast';
import { 
  Camera, 
  Check, 
  X, 
  Calendar, 
  User, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  ExternalLink,
  Briefcase,
  Star,
  UserX
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

interface StockMediaRequestItemProps {
  request: NostrEvent;
}

function StockMediaRequestItem({ request }: StockMediaRequestItemProps) {
  const author = useAuthor(request.pubkey);
  const metadata = author.data?.metadata;
  const { mutate: grantPermission, isPending: isGranting } = useGrantStockMediaPermission();
  const { mutate: blockRequest, isPending: isBlocking } = useBlockStockMediaRequest();
  const { toast } = useToast();
  const [blockReason, setBlockReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const displayName = metadata?.name || genUserName(request.pubkey);
  const profileImage = metadata?.picture;
  
  // Extract additional data from tags
  const portfolio = request.tags.find(([name]) => name === 'portfolio')?.[1];
  const experience = request.tags.find(([name]) => name === 'experience')?.[1];

  const handleGrant = () => {
    grantPermission(
      { pubkey: request.pubkey, requestId: request.id },
      {
        onSuccess: () => {
          toast({
            title: 'Stock media permission granted!',
            description: `${displayName} can now upload stock media.`,
          });
        },
        onError: () => {
          toast({
            title: 'Failed to grant permission',
            description: 'Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleBlock = () => {
    blockRequest(
      { pubkey: request.pubkey, requestId: request.id, reason: blockReason },
      {
        onSuccess: () => {
          toast({
            title: 'Request blocked',
            description: `Stock media request from ${displayName} has been blocked.`,
          });
          setShowBlockDialog(false);
          setBlockReason('');
        },
        onError: () => {
          toast({
            title: 'Failed to block request',
            description: 'Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Card className="border-l-4 border-l-blue-200 dark:border-l-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {getShortNpub(request.pubkey)}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(request.created_at * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
            <Camera className="w-3 h-3 mr-1" />
            Stock Media
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Reason for request:</h4>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {request.content}
          </p>
        </div>

        {portfolio && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              Portfolio:
            </h4>
            <a 
              href={portfolio} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              {portfolio}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {experience && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <Star className="w-4 h-4" />
              Experience:
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {experience}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleGrant}
            disabled={isGranting || isBlocking}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Grant Permission
          </Button>
          
          <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
            <DialogTrigger asChild>
              <Button
                disabled={isGranting || isBlocking}
                variant="destructive"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Block Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block Stock Media Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Block request from <strong>{displayName}</strong>? You can optionally provide a reason.
                </p>
                <div>
                  <Label htmlFor="block-reason">Reason (optional)</Label>
                  <Textarea
                    id="block-reason"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Enter reason for blocking this request..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBlock}
                    disabled={isBlocking}
                    variant="destructive"
                    className="flex-1"
                  >
                    Block Request
                  </Button>
                  <Button
                    onClick={() => setShowBlockDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

interface GrantedUserItemProps {
  pubkey: string;
}

function GrantedUserItem({ pubkey }: GrantedUserItemProps) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const { mutate: revokePermission, isPending: isRevoking } = useRevokeStockMediaPermission();
  const { toast } = useToast();
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const displayName = metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;

  const handleRevoke = () => {
    revokePermission(
      { pubkey, reason: revokeReason },
      {
        onSuccess: () => {
          toast({
            title: 'Permission revoked',
            description: `Stock media permission revoked for ${displayName}.`,
          });
          setShowRevokeDialog(false);
          setRevokeReason('');
        },
        onError: () => {
          toast({
            title: 'Failed to revoke permission',
            description: 'Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Card className="border-l-4 border-l-green-200 dark:border-l-green-800">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {getShortNpub(pubkey)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Granted
            </Badge>
            
            <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isRevoking}>
                  <UserX className="w-3 h-3 mr-1" />
                  Revoke
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Revoke Stock Media Permission</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Revoke stock media permission for <strong>{displayName}</strong>? You can optionally provide a reason.
                  </p>
                  <div>
                    <Label htmlFor="revoke-reason">Reason (optional)</Label>
                    <Textarea
                      id="revoke-reason"
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      placeholder="Enter reason for revoking permission..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRevoke}
                      disabled={isRevoking}
                      variant="destructive"
                      className="flex-1"
                    >
                      Revoke Permission
                    </Button>
                    <Button
                      onClick={() => setShowRevokeDialog(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BlockedUserItem({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;

  return (
    <Card className="border-l-4 border-l-red-200 dark:border-l-red-800">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {getShortNpub(pubkey)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20">
            <ShieldX className="w-3 h-3 mr-1" />
            Blocked
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-200 dark:border-l-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StockMediaPermissionManager() {
  const { data: requestData, isLoading, error } = useStockMediaPermissionRequests();

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Failed to load stock media permission requests. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requestData?.pendingRequests || [];
  const grantedUsers = requestData?.grantedUsers || [];
  const blockedUsers = requestData?.blockedUsers || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Stock Media Permission Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage requests from users who want to upload stock media to Traveltelly.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="granted" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Granted ({grantedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="flex items-center gap-2">
            <ShieldX className="w-4 h-4" />
            Blocked ({blockedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <RequestSkeleton key={i} />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <User className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No pending stock media permission requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <StockMediaRequestItem key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="granted" className="space-y-4">
          {grantedUsers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <ShieldCheck className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No users have been granted stock media permissions yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {grantedUsers.map((pubkey) => (
                <GrantedUserItem key={pubkey} pubkey={pubkey} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          {blockedUsers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <ShieldX className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No users have been blocked from stock media permissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {blockedUsers.map((pubkey) => (
                <BlockedUserItem key={pubkey} pubkey={pubkey} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}