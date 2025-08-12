import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RobustImage } from '@/components/RobustImage';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ImageDiagnosticProps {
  images: string[];
  title: string;
}

interface ImageStatus {
  url: string;
  status: 'loading' | 'success' | 'error';
  error?: string;
  loadTime?: number;
}

export function ImageDiagnostic({ images, title }: ImageDiagnosticProps) {
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testImages = async () => {
    if (images.length === 0) return;

    setIsRunning(true);
    const statuses: ImageStatus[] = images.map(url => ({ url, status: 'loading' }));
    setImageStatuses(statuses);

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const startTime = Date.now();

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        const loadTime = Date.now() - startTime;
        setImageStatuses(prev =>
          prev.map((status, idx) =>
            idx === i ? { ...status, status: 'success', loadTime } : status
          )
        );
      } catch (error) {
        const loadTime = Date.now() - startTime;
        setImageStatuses(prev =>
          prev.map((status, idx) =>
            idx === i ? {
              ...status,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              loadTime
            } : status
          )
        );
      }
    }

    setIsRunning(false);
  };

  useEffect(() => {
    if (images.length > 0) {
      testImages();
    }
  }, [images.length]);

  const getStatusIcon = (status: ImageStatus['status']) => {
    switch (status) {
      case 'loading':
        return <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ImageStatus['status']) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  if (images.length === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            No Images Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 dark:text-orange-300 text-sm">
            This product has no images to display. This could be because:
          </p>
          <ul className="list-disc list-inside mt-2 text-orange-700 dark:text-orange-300 text-sm space-y-1">
            <li>No images were uploaded when creating the product</li>
            <li>Image tags are missing from the Nostr event</li>
            <li>Images were uploaded but not properly saved</li>
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-800 dark:text-blue-200">
            Image Diagnostic - {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={testImages}
            disabled={isRunning}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Retest
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p><strong>Total images:</strong> {images.length}</p>
          <p><strong>Successful:</strong> {imageStatuses.filter(s => s.status === 'success').length}</p>
          <p><strong>Failed:</strong> {imageStatuses.filter(s => s.status === 'error').length}</p>
          <p><strong>Loading:</strong> {imageStatuses.filter(s => s.status === 'loading').length}</p>
        </div>

        <div className="space-y-3">
          {imageStatuses.map((status, index) => (
            <div key={index} className="border rounded-lg p-3 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(status.status)}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Image {index + 1}</span>
                    {getStatusBadge(status.status)}
                    {status.loadTime && (
                      <Badge variant="outline" className="text-xs">
                        {status.loadTime}ms
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400 break-all">
                    {status.url}
                  </div>

                  {status.error && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      <strong>Error:</strong> {status.error}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <a
                      href={status.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in new tab
                    </a>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-16 h-16 border rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <RobustImage
                      src={status.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      retryAttempts={0}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}