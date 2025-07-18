import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { PermissionRequestForm } from '@/components/PermissionRequestForm';
import { Shield, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ children, fallback }: PermissionGateProps) {
  const { hasPermission, isCheckingPermission, isAdmin } = useReviewPermissions();

  if (isCheckingPermission) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission || isAdmin) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-orange-600" />
          <h3 className="text-lg font-semibold mb-2">Review Permission Required</h3>
          <p className="text-muted-foreground mb-6">
            Only authorized users can post reviews on Traveltelly. This helps maintain quality and prevents spam.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <Clock className="w-6 h-6 mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">1. Request</h4>
              <p className="text-muted-foreground text-center">Submit your request with a reason</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <Shield className="w-6 h-6 mb-2 text-orange-600" />
              <h4 className="font-medium mb-1">2. Review</h4>
              <p className="text-muted-foreground text-center">Admin reviews your request</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <CheckCircle className="w-6 h-6 mb-2 text-green-600" />
              <h4 className="font-medium mb-1">3. Approved</h4>
              <p className="text-muted-foreground text-center">Start posting reviews</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button variant="outline">
                Browse Reviews
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <PermissionRequestForm />
    </div>
  );
}