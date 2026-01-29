/**
 * Image compression utility for optimizing photos before upload
 * Reduces file size and dimensions for faster loading
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  outputFormat: 'image/jpeg',
};

/**
 * Compress an image file to reduce size and dimensions
 * @param file - The original image file
 * @param options - Compression options
 * @returns Compressed image as File
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxWidth = opts.maxWidth || DEFAULT_OPTIONS.maxWidth!;
        const maxHeight = opts.maxHeight || DEFAULT_OPTIONS.maxHeight!;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // Create new file from blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              {
                type: opts.outputFormat || 'image/jpeg',
                lastModified: Date.now(),
              }
            );

            console.log('Image compressed:', {
              original: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
              reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
              dimensions: `${width}x${height}`,
            });

            resolve(compressedFile);
          },
          opts.outputFormat || 'image/jpeg',
          opts.quality || 0.85
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images in parallel
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Get optimal compression settings based on use case
 */
export const COMPRESSION_PRESETS = {
  thumbnail: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.75,
    outputFormat: 'image/jpeg' as const,
  },
  review: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    outputFormat: 'image/jpeg' as const,
  },
  trip: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    outputFormat: 'image/jpeg' as const,
  },
  stockMedia: {
    maxWidth: 2560,
    maxHeight: 2560,
    quality: 0.90,
    outputFormat: 'image/jpeg' as const,
  },
} as const;
