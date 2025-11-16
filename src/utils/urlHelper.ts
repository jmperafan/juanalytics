/**
 * URL helper utilities for consistent path handling
 */

/**
 * Get the base URL from import.meta.env
 * @returns The base URL with trailing slash removed
 */
export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base === '/' ? '' : base.replace(/\/$/, '');
}

/**
 * Join base URL with a path, ensuring no double slashes
 * @param path - The path to join (with or without leading slash)
 * @returns The complete URL path
 */
export function buildUrl(path: string): string {
  const base = getBaseUrl();
  // Normalize the path: remove multiple slashes and ensure single leading slash
  const normalizedPath = path.replace(/\/+/g, '/');
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return `${base}${cleanPath}`;
}
