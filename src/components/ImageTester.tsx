import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ImageTestResult {
  url: string;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

export function ImageTester() {
  const [testUrl, setTestUrl] = useState('');
  const [results, setResults] = useState<ImageTestResult[]>([]);

  const testImage = async (url: string) => {
    const result: ImageTestResult = { url, status: 'loading' };
    setResults(prev => [...prev, result]);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      setResults(prev =>
        prev.map(r => r.url === url ? { ...r, status: 'success' } : r)
      );
    } catch (error) {
      setResults(prev =>
        prev.map(r => r.url === url ? {
          ...r,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        } : r)
      );
    }
  };

  const handleTest = () => {
    if (testUrl.trim()) {
      testImage(testUrl.trim());
      setTestUrl('');
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Image URL Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL to test..."
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTest()}
          />
          <Button onClick={handleTest} disabled={!testUrl.trim()}>
            Test
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                {result.status === 'loading' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
                {result.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {result.status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">{result.url}</p>
                  {result.error && (
                    <p className="text-xs text-red-500">{result.error}</p>
                  )}
                </div>

                <Badge
                  variant={
                    result.status === 'success' ? 'default' :
                    result.status === 'error' ? 'destructive' :
                    'secondary'
                  }
                >
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}