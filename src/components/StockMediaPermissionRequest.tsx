import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useStockMediaPermissions, useSubmitStockMediaPermissionRequest } from '@/hooks/useStockMediaPermissions';
import { useToast } from '@/hooks/useToast';
import { Camera, Send, Shield, CheckCircle, Clock } from 'lucide-react';

export function StockMediaPermissionRequest() {
  const { user } = useCurrentUser();
  const { hasPermission, isCheckingPermission, isAdmin } = useStockMediaPermissions();
  const { mutate: submitRequest, isPending } = useSubmitStockMediaPermissionRequest();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    reason: '',
    portfolio: '',
    experience: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for your request.',
        variant: 'destructive',
      });
      return;
    }

    submitRequest(formData, {
      onSuccess: () => {
        toast({
          title: 'Request submitted!',
          description: 'Your stock media permission request has been sent to the admin.',
        });
        setFormData({ reason: '', portfolio: '', experience: '' });
      },
      onError: () => {
        toast({
          title: 'Failed to submit request',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Camera className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Please log in to request stock media upload permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isCheckingPermission) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card className="border-l-4 border-l-purple-200 dark:border-l-purple-800">
        <CardContent className="py-8 text-center">
          <Shield className="w-8 h-8 mx-auto mb-3 text-purple-600" />
          <h3 className="font-semibold mb-2">Admin Access</h3>
          <p className="text-muted-foreground">
            You have admin privileges and can upload stock media without requesting permission.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission) {
    return (
      <Card className="border-l-4 border-l-green-200 dark:border-l-green-800">
        <CardContent className="py-8 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
          <h3 className="font-semibold mb-2">Permission Granted</h3>
          <p className="text-muted-foreground">
            You have permission to upload stock media to Traveltelly.
          </p>
          <Badge variant="outline" className="mt-3 bg-green-50 dark:bg-green-900/20">
            <Camera className="w-3 h-3 mr-1" />
            Stock Media Access
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Request Stock Media Upload Permission
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Submit a request to upload stock media content to Traveltelly. Please provide details about your photography experience and portfolio.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">
              Reason for Request <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why you'd like to upload stock media to Traveltelly. Include your photography background, travel experience, and how you plan to contribute quality content..."
              className="mt-1 min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="portfolio">Portfolio URL (optional)</Label>
            <Input
              id="portfolio"
              type="url"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
              placeholder="https://your-portfolio.com or social media profile"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link to your photography portfolio, Instagram, or other work samples
            </p>
          </div>

          <div>
            <Label htmlFor="experience">Photography Experience (optional)</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Describe your photography experience, equipment, specialties, and any relevant qualifications..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isPending || !formData.reason.trim()}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">What happens next?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Your request will be reviewed by the Traveltelly admin</li>
              <li>• You'll be notified when a decision is made</li>
              <li>• If approved, you'll be able to upload stock media content</li>
              <li>• High-quality, travel-focused content is preferred</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}