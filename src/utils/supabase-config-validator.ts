// Utility to validate Supabase configuration
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSupabaseConfig(config: SupabaseConfig): ConfigValidationResult {
  const result: ConfigValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if URL is provided
  if (!config.url) {
    result.errors.push('Supabase URL is missing');
    result.isValid = false;
  }

  // Check if anon key is provided
  if (!config.anonKey) {
    result.errors.push('Supabase anon key is missing');
    result.isValid = false;
  }

  // Validate URL format
  if (config.url && !config.url.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/i)) {
    result.errors.push('Invalid Supabase URL format. Expected format: https://your-project.supabase.co');
    result.isValid = false;
  }

  // Check for placeholder values
  if (config.url && config.url.includes('obbycwigtdzgnyapbdjl')) {
    result.errors.push('Using placeholder Supabase URL. Please update with your actual Supabase project URL.');
    result.isValid = false;
  }

  // Validate anon key format (JWT token)
  if (config.anonKey && !config.anonKey.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
    result.warnings.push('Supabase anon key does not appear to be a valid JWT token format');
  }

  // Check anon key length
  if (config.anonKey && config.anonKey.length < 50) {
    result.warnings.push('Supabase anon key seems unusually short');
  }

  return result;
}

export function getSupabaseConfigFromEnv(): SupabaseConfig {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
}