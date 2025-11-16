/**
 * Environment Variable Validation
 * Validates that required environment variables are set and properly formatted
 */

interface EnvConfig {
  SITE_URL?: string;
  NODE_ENV?: string;
}

/**
 * Validates environment variables
 * @throws Error if validation fails in production
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Get site URL from Astro config or environment
  const siteUrl = import.meta.env.SITE || import.meta.env.PUBLIC_SITE_URL || 'https://juanalytics.com';

  // Validate site URL format
  if (siteUrl && !isValidUrl(siteUrl)) {
    errors.push(`Invalid SITE_URL format: ${siteUrl}`);
  }

  // Validate NODE_ENV
  const nodeEnv = import.meta.env.MODE || 'development';
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(nodeEnv)) {
    errors.push(`Invalid NODE_ENV: ${nodeEnv}. Must be one of: ${validEnvs.join(', ')}`);
  }

  // Log warnings in development, throw in production
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`;

    if (import.meta.env.PROD) {
      throw new Error(errorMessage);
    } else {
      console.warn('⚠️  Environment validation warnings:');
      errors.forEach(error => console.warn(`  - ${error}`));
    }
  }

  return {
    SITE_URL: siteUrl,
    NODE_ENV: nodeEnv,
  };
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets a required environment variable
 * @throws Error if variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];

  if (!value) {
    const errorMessage = `Missing required environment variable: ${key}`;
    if (import.meta.env.PROD) {
      throw new Error(errorMessage);
    } else {
      console.warn(`⚠️  ${errorMessage}`);
      return '';
    }
  }

  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

// Run validation on import (build-time check)
if (import.meta.env.PROD) {
  validateEnv();
}
