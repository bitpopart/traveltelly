import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RobustImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: string) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export function RobustImage({
  src,
  alt,
  className = '',
  fallbackIcon,
  onLoad,
  onError,
  retryAttempts = 2,
  retryDelay = 1000
}: RobustImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error' | 'retrying'>('loading');
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const attemptLoad = React.useCallback((attempt: number) => {
    const img = new Image();

    img.onload = () => {
      setImageState('loaded');
      onLoad?.();
    };

    img.onerror = (e) => {
      const error = `Failed to load image (attempt ${attempt + 1}/${retryAttempts + 1})`;
      console.error(error, src, e);

      if (attempt < retryAttempts) {
        setImageState('retrying');
        setCurrentAttempt(attempt + 1);
        setTimeout(() => attemptLoad(attempt + 1), retryDelay);
      } else {
        setImageState('error');
        setErrorMessage(error);
        onError?.(error);
      }
    };

    // Add cache busting for retries
    const cacheBuster = attempt > 0 ? `?retry=${attempt}&t=${Date.now()}` : '';
    img.src = src + cacheBuster;
  }, [src, retryAttempts, retryDelay, onLoad, onError]);

  useEffect(() => {
    if (src) {
      setImageState('loading');
      setCurrentAttempt(0);
      setErrorMessage('');
      attemptLoad(0);
    }
  }, [src, attemptLoad]);

  const handleRetry = () => {
    setCurrentAttempt(0);
    setImageState('loading');
    attemptLoad(0);
  };

  if (imageState === 'loaded') {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={onLoad}
        onError={(e) => {
          console.error('Image failed after successful load:', src, e);
          setImageState('error');
          setErrorMessage('Image failed to display');
        }}
      />
    );
  }

  if (imageState === 'loading' || imageState === 'retrying') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">
            {imageState === 'retrying' ? `Retrying... (${currentAttempt}/${retryAttempts})` : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
      <div className="text-center p-4">
        {fallbackIcon || <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />}
        <AlertCircle className="w-4 h-4 mx-auto mb-2 text-red-500" />
        <p className="text-xs text-gray-500 mb-2">Failed to load image</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-2 text-left">
            <summary className="text-xs cursor-pointer text-blue-600">Debug Info</summary>
            <div className="text-xs text-gray-600 mt-1 space-y-1">
              <p><strong>URL:</strong> <span className="break-all">{src}</span></p>
              <p><strong>Error:</strong> {errorMessage}</p>
              <p><strong>Attempts:</strong> {currentAttempt + 1}/{retryAttempts + 1}</p>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}