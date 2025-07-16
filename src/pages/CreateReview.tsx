import { useSeoMeta } from '@unhead/react';
import { CreateReviewForm } from '@/components/CreateReviewForm';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { CoordinateDebugger } from '@/components/CoordinateDebugger';

const CreateReview = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Create Review - Reviewstr',
    description: 'Share your experience and create a location-based review on Nostr.',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Create Review
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-6">
                  You need to be logged in to create a review.
                </p>
                <LoginArea className="max-w-60 mx-auto" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create a Review
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Share your experience and help others discover great places
            </p>
          </div>

          <CreateReviewForm />

          {/* Development debugging tools */}
          {import.meta.env.DEV && <CoordinateDebugger />}
        </div>
      </div>
    </div>
  );
};

export default CreateReview;