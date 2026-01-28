/**
 * Utility functions untuk menangani URL assets dan uploads
 */

/**
 * Get base URL untuk backend/uploads
 * Di production gunakan domain publishify.me
 * Di development gunakan localhost
 */
function getBackendUrl(): string {
  // Untuk browser, gunakan window.location.origin jika production
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('publishify.me')) {
      return 'https://publishify.me';
    }
  }
  
  // Untuk server-side atau development
  return process.env.NEXT_PUBLIC_BACKEND_URL || 
         process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
         'http://localhost:4000';
}

/**
 * Build full URL untuk file upload (sampul, file naskah, dll)
 * @param relativePath - Path relative dari backend (misal: /uploads/sampul/xxx.png)
 * @returns Full URL yang bisa diakses
 */
export function getUploadUrl(relativePath: string | null | undefined): string {
  if (!relativePath) {
    return '/placeholder-book.png'; // Default placeholder
  }

  // Jika sudah full URL (http/https), return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // Jika path dimulai dengan localhost, extract path nya saja
  if (relativePath.includes('localhost:')) {
    const match = relativePath.match(/localhost:\d+(.+)/);
    if (match) {
      relativePath = match[1];
    }
  }

  // Pastikan path dimulai dengan /
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  // Build full URL
  const backendUrl = getBackendUrl();
  return `${backendUrl}${cleanPath}`;
}

/**
 * Build URL untuk sampul naskah
 */
export function getSampulUrl(urlSampul: string | null | undefined): string {
  return getUploadUrl(urlSampul);
}

/**
 * Build URL untuk file naskah (PDF/DOCX)
 */
export function getFileNaskahUrl(urlFile: string | null | undefined): string {
  return getUploadUrl(urlFile);
}

/**
 * Build URL untuk avatar pengguna
 */
export function getAvatarUrl(urlAvatar: string | null | undefined): string {
  return getUploadUrl(urlAvatar) || '/default-avatar.png';
}

/**
 * Check apakah URL adalah external (Unsplash, dll)
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Sanitize localStorage URLs - replace localhost dengan production URL
 * Untuk migrasi data lama yang masih pakai localhost
 */
export function sanitizeStoredUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Replace localhost URLs dengan production URL
  const backendUrl = getBackendUrl();
  return url.replace(/http:\/\/localhost:\d+/, backendUrl);
}
