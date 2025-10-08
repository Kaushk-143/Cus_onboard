import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can get the Supabase client
    console.log('Test 1: Supabase client initialized');
    
    // Test 2: Check if we can access auth
    console.log('Test 2: Checking auth access');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Auth session check result:', { session, sessionError });
    
    // Test 3: Try to fetch onboarding steps (public data)
    console.log('Test 3: Fetching onboarding steps');
    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      // Provide more specific error information
      if (error.message.includes('connection')) {
        console.error('This might be a network connectivity issue');
      } else if (error.message.includes('permission') || error.message.includes('Forbidden')) {
        console.error('This might be a Supabase authentication or RLS (Row Level Security) permission issue');
      } else if (error.message.includes('does not exist')) {
        console.error('This might indicate that the database tables have not been set up correctly');
      }
      return false;
    }

    console.log('Supabase connection test successful:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
    }
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase connection test passed');
  } else {
    console.log('❌ Supabase connection test failed');
    console.log('Please check the error messages above for troubleshooting information');
  }
});