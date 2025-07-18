import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSubmitPermissionRequest } from '@/hooks/useReviewPermissions';
import { useToast } from '@/hooks/useToast';
import { UserCheck, Loader2, Shield } from 'lucide-react';
import { nip19 } from 'nostr-tools';

const requestSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)').max(500, 'Reason is too long'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export function PermissionRequestForm() {
  const { user } = useCurrentUser();
  const { mutate: submitRequest, isPending } = useSubmitPermissionRequest();
  const { toast } = useToast();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    try {
      submitRequest(data);

      form.reset();

      toast({
        title: 'Request submitted!',
        description: 'Your permission request has been sent to the admin for review.',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Failed to submit request',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            You must be logged in to request review posting permission.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Request Review Permission
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Only authorized users can post reviews. Please explain why you'd like to contribute reviews.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="reason">Why would you like to post reviews?</Label>
            <Textarea
              id="reason"
              placeholder="Tell us about your travel experience, local knowledge, or why you'd like to contribute reviews..."
              rows={4}
              {...form.register('reason')}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Your Nostr Public Key:</strong>
            </p>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-1 break-all">
              {nip19.npubEncode(user.pubkey)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Submit Permission Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}