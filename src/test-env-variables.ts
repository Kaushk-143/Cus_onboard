// Test script to verify environment variables are loaded correctly
console.log('=== Environment Variables Test ===');

// Test Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');

if (supabaseUrl) {
  console.log('Supabase URL length:', supabaseUrl.length);
  console.log('Supabase URL preview:', supabaseUrl.substring(0, Math.min(50, supabaseUrl.length)) + (supabaseUrl.length > 50 ? '...' : ''));
}

if (supabaseAnonKey) {
  console.log('Supabase Anon Key length:', supabaseAnonKey.length);
  console.log('Supabase Anon Key preview:', supabaseAnonKey.substring(0, Math.min(20, supabaseAnonKey.length)) + (supabaseAnonKey.length > 20 ? '...' : ''));
}

// Check for placeholder values
if (supabaseUrl && supabaseUrl.includes('obbycwigtdzgnyapbdjl')) {
  console.error('❌ ERROR: Using placeholder Supabase URL. Please update your .env file.');
} else if (supabaseUrl) {
  console.log('✅ Supabase URL appears to be properly configured');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Missing required Supabase environment variables');
  console.error('Please ensure your .env file contains both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
} else {
  console.log('✅ All required environment variables are set');
}

export {};