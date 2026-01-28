import { Navigation } from '@/components/Navigation';
import { CategoryMigration } from '@/components/CategoryMigration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CategoryMigrationPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link to="/admin-panel">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Panel
            </Button>
          </Link>

          {/* Header */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Coffee className="w-6 h-6 text-blue-600" />
                Category Migration Tool
              </CardTitle>
              <CardDescription className="text-base">
                Update your reviews to use normalized categories without accents for better compatibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">What does this tool do?</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Finds all your reviews with accented category names (e.g., "Café", "Résumé")</li>
                  <li>Updates them to use normalized versions without accents (e.g., "cafe", "resume")</li>
                  <li>Ensures your cafe reviews display the special coffee cup marker ☕</li>
                  <li>Makes all category emojis display correctly across the app</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Why is this needed?</h3>
                <p className="text-sm text-muted-foreground">
                  Some older reviews use accented characters like "Café" which may not match 
                  the category detection logic. By normalizing these to "cafe", your reviews 
                  will display with the correct markers and emojis on maps and feeds.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2 text-yellow-900 dark:text-yellow-100">
                  ⚠️ Important Notes
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
                  <li>This will republish your reviews (they will show as new events)</li>
                  <li>The original reviews will be replaced (Nostr replaceable events)</li>
                  <li>The process may take a few seconds per review</li>
                  <li>You can safely run this multiple times</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Migration Component */}
          <CategoryMigration />
        </div>
      </div>
    </div>
  );
}
