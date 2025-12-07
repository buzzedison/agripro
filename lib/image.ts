import imageUrlBuilder from '@sanity/image-url';
import { client } from '../app/lib/client';

const builder = imageUrlBuilder(client);

export function urlForImage(source: any) {
  return builder.image(source);
}

/**
 * Get an optimized image URL from Sanity with specified dimensions
 * This uses Sanity's CDN-based image transformation which is much faster
 * than Next.js image optimization for external images
 */
export function getOptimizedImageUrl(
  source: any,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
  } = {}
): string {
  if (!source) return '';
  
  const { width = 1200, height, quality = 80, fit = 'max' } = options;
  
  let imageBuilder = builder.image(source).auto('format').quality(quality).fit(fit);
  
  if (width) imageBuilder = imageBuilder.width(width);
  if (height) imageBuilder = imageBuilder.height(height);
  
  return imageBuilder.url() || '';
} 