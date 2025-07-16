import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractGPSFromImage } from '@/lib/exifUtils';
import { parse as parseExif } from 'exifr';

export function GPSDebugger() {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isDebugging, setIsDebugging] = useState(false);

  const handleDebugFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDebugging(true);
    setDebugInfo('Starting debug analysis...\n\n');

    try {
      // Get all EXIF data
      const fullExif = await parseExif(file);
      
      let debugText = `📱 FILE INFO:\n`;
      debugText += `Name: ${file.name}\n`;
      debugText += `Type: ${file.type}\n`;
      debugText += `Size: ${(file.size / 1024).toFixed(1)} KB\n\n`;

      debugText += `📊 FULL EXIF DATA:\n`;
      debugText += JSON.stringify(fullExif, null, 2) + '\n\n';

      if (fullExif) {
        debugText += `🔍 GPS-RELATED FIELDS:\n`;
        const gpsFields = Object.keys(fullExif).filter(key => 
          key.toLowerCase().includes('gps') || 
          key.toLowerCase().includes('lat') || 
          key.toLowerCase().includes('lon')
        );
        
        if (gpsFields.length > 0) {
          gpsFields.forEach(field => {
            debugText += `${field}: ${JSON.stringify(fullExif[field])}\n`;
          });
        } else {
          debugText += 'No GPS-related fields found in top-level EXIF data\n';
        }
        debugText += '\n';

        if (fullExif.GPS) {
          debugText += `🛰️ GPS OBJECT:\n`;
          debugText += JSON.stringify(fullExif.GPS, null, 2) + '\n\n';
        }
      }

      // Try our GPS extraction
      debugText += `🎯 GPS EXTRACTION RESULT:\n`;
      const coordinates = await extractGPSFromImage(file);
      if (coordinates) {
        debugText += `✅ SUCCESS: ${coordinates.latitude}, ${coordinates.longitude}\n`;
      } else {
        debugText += `❌ FAILED: No GPS coordinates extracted\n`;
      }

      setDebugInfo(debugText);
    } catch (error) {
      setDebugInfo(`❌ ERROR: ${error}\n\nConsole may have more details.`);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔧 GPS Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleDebugFile}
            className="text-sm"
            disabled={isDebugging}
          />
        </div>
        
        {debugInfo && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {debugInfo}
          </div>
        )}
        
        {debugInfo && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(debugInfo);
            }}
          >
            📋 Copy Debug Info
          </Button>
        )}
      </CardContent>
    </Card>
  );
}