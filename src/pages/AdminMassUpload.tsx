import { AdminMassUpload as AdminMassUploadComponent } from '@/components/AdminMassUpload';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminMassUpload() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mass Upload</h1>
              <p className="text-muted-foreground mt-1">
                Upload multiple stock media items at once using CSV
              </p>
            </div>
            <LoginArea className="max-w-60" />
          </div>
        </div>

        {/* Login Required */}
        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You must be logged in as the Traveltelly admin to access mass upload functionality.</p>
              <LoginArea className="w-full" />
            </CardContent>
          </Card>
        ) : (
          <AdminMassUploadComponent />
        )}
      </div>
    </div>
  );
}
