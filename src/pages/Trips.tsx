import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateTripForm } from '@/components/CreateTripForm';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Trips() {
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ffcc0020' }}>
                <MapPin className="w-8 h-8" style={{ color: '#ffcc00' }} />
              </div>
              <h1 className="text-4xl font-bold">Trips</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Share your travel adventures with photos and GPS routes
            </p>
          </div>

          {user ? (
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Trip
                </TabsTrigger>
                <TabsTrigger value="my-trips">
                  My Trips
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <CreateTripForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="my-trips" className="mt-6">
                <Card>
                  <CardContent className="py-12 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first trip to get started!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="py-12 text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: '#ffcc00' }} />
                <h3 className="text-2xl font-semibold mb-4">Sign in to create trips</h3>
                <p className="text-muted-foreground mb-6">
                  Log in with Nostr to share your travel adventures
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
