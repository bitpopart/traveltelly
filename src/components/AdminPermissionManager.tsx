import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissionRequests, useGrantPermission, useBlockRequest } from '@/hooks/useReviewPermissions';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { getShortNpub } from '@/lib/nostrUtils';
import { useToast } from '@/hooks/useToast';
import { Shield, Check, X, Calendar, User, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

interface PermissionRequestItemProps {
  request: NostrEvent;
}

function PermissionRequestItem({ request }: PermissionRequestItemProps) {
  const author = useAuthor(request.pubkey);
  const metadata = author.data?.metadata;
  const { mutate: grantPermission, isPending: isGranting } = useGrantPermission();
  const { mutate: blockRequest, isPending: isBlocking } = useBlockRequest();
  const { toast } = useToast();

  const displayName = metadata?.name || genUserName(request.pubkey);
  const profileImage = metadata?.picture;

  const handleGrant = () => {
    grantPermission(
      { pubkey: request.pubkey, requestId: request.id },
      {
        onSuccess: () => {
          toast({
            title: 'Permission granted!',
            description: `${displayName} can now post reviews.`,
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
      { pubkey: request.pubkey, requestId: request.id },
      {
        onSuccess: () => {
          toast({
            title: 'Request blocked',
            description: `Request from ${displayName} has been blocked.`,
          });
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
    <Card className="border-l-4 border-l-orange-200 dark:border-l-orange-800">
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
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20">
            Pending
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

        <div className="flex gap-2">
          <Button
            onClick={handleGrant}
            disabled={isGranting || isBlocking}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Grant Permission
          </Button>
          <Button
            onClick={handleBlock}
            disabled={isGranting || isBlocking}
            variant="destructive"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Block Request
          </Button>
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
          <Skeleton className="h-6 w-16" />
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

export function AdminPermissionManager() {
  const { data: requests, isLoading, error, refetch, isFetching } = usePermissionRequests();

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Failed to load permission requests. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Review Permission Requests
                {requests && requests.length > 0 && (
                  <Badge variant="default" className="ml-2">
                    {requests.length}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage requests from users who want to post reviews on Traveltelly.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <RequestSkeleton key={i} />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <User className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              No pending permission requests.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <PermissionRequestItem key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}