import { useSeoMeta } from '@unhead/react';
import { Navigation } from '@/components/Navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMapProvider } from '@/hooks/useMapProvider';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditProfileForm } from '@/components/EditProfileForm';
import { LightningSetup } from '@/components/LightningSetup';
import { StockMediaPermissionRequest } from '@/components/StockMediaPermissionRequest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, User, Zap, Map, Camera } from 'lucide-react';

const Settings = () => {
  const { user } = useCurrentUser();
  const { mapProvider, setMapProvider } = useMapProvider();

  useSeoMeta({
    title: 'Settings - Traveltelly',
    description: 'Manage your profile and Lightning settings on Traveltelly.',
  });

  if (!user) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your profile, Lightning settings, and app preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="lightning" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Lightning
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="app" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                App
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EditProfileForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lightning">
              <LightningSetup />
            </TabsContent>

            <TabsContent value="permissions">
              <StockMediaPermissionRequest />
            </TabsContent>

            <TabsContent value="app">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    App Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="map-provider">Map Provider</Label>
                    <Select value={mapProvider} onValueChange={setMapProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select map provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openstreetmap">
                          🗺️ OpenStreetMap (Default)
                        </SelectItem>
                        <SelectItem value="satellite">
                          🛰️ Satellite View
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the map style for location displays. OpenStreetMap is free and open-source.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;