/**
 * Image optimization utility - converts images to WebP and resizes
 */

export interface OptimizedImage {
  blob: Blob;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  fileName: string;
}

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 0.8;

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image'));
            return;
          }

          // Generate new filename with .webp extension
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const fileName = `${baseName}.webp`;

          resolve({
            blob,
            originalSize: file.size,
            optimizedSize: blob.size,
            width,
            height,
            fileName,
          });
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function calculateSavings(original: number, optimized: number): string {
  const savings = ((original - optimized) / original) * 100;
  return `${savings.toFixed(0)}%`;
}
