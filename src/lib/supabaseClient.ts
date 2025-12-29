import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in a build environment without env vars
const isMissingEnv = !supabaseUrl || !supabaseAnonKey;

// Create a single supabase client for client-side operations
// Only create if we have the required env vars
export const supabase = isMissingEnv 
  ? null as unknown as ReturnType<typeof createBrowserClient<Database>>
  : createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to get Supabase storage URL with transformations
export function getStorageUrl(
  bucket: string,
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    blur?: number;
    format?: 'webp' | 'avif' | 'origin';
  }
): string {
  if (!path) return '';
  
  // If it's already a full URL (like Unsplash), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  const transformParams: string[] = [];
  
  if (options?.width) transformParams.push(`width=${options.width}`);
  if (options?.height) transformParams.push(`height=${options.height}`);
  if (options?.quality) transformParams.push(`quality=${options.quality}`);
  if (options?.blur) transformParams.push(`blur=${options.blur}`);
  if (options?.format) transformParams.push(`format=${options.format}`);
  
  const transformQuery = transformParams.length > 0 ? `?${transformParams.join('&')}` : '';
  
  // Use Supabase Image Transformation
  if (transformParams.length > 0) {
    return `${supabaseUrl}/storage/v1/render/image/public/${bucket}/${path}${transformQuery}`;
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// Get blurred image URL for locked state
export function getBlurredImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // For Unsplash images, add blur parameter
  if (imageUrl.includes('unsplash.com')) {
    const url = new URL(imageUrl);
    url.searchParams.set('blur', '50');
    url.searchParams.set('w', '100');
    return url.toString();
  }
  
  // For Supabase storage images
  if (imageUrl.includes(supabaseUrl || '')) {
    return getStorageUrl('confession-media', imageUrl, {
      width: 100,
      blur: 50,
      quality: 50,
    });
  }
  
  return imageUrl;
}

// Get full resolution image URL for unlocked state
export function getUnlockedImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // For Unsplash images, ensure good quality
  if (imageUrl.includes('unsplash.com')) {
    const url = new URL(imageUrl);
    url.searchParams.delete('blur');
    url.searchParams.set('w', '400');
    url.searchParams.set('q', '80');
    return url.toString();
  }
  
  // For Supabase storage images
  if (imageUrl.includes(supabaseUrl || '')) {
    return getStorageUrl('confession-media', imageUrl, {
      width: 400,
      quality: 80,
      format: 'webp',
    });
  }
  
  return imageUrl;
}

// Upload image to Supabase Storage
export async function uploadImage(
  file: File,
  userId: string
): Promise<{ path: string; url: string } | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('confession-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const url = getStorageUrl('confession-media', data.path);
    
    return {
      path: data.path,
      url,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Delete image from storage
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('confession-media')
      .remove([path]);
    
    if (error) {
      console.error('Delete error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
