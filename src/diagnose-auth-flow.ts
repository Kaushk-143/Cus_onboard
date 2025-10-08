// Comprehensive diagnosis tool for the authentication flow
import { supabase } from './lib/supabase';

async function diagnoseAuthFlow() {
  console.log('=== AUTH FLOW DIAGNOSIS ===');
  
  try {
    // Step 1: Check environment variables
    console.log('1. Checking environment variables...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      console.error('❌ Missing VITE_SUPABASE_URL environment variable');
      console.error('   Please check your .env file and ensure it contains the correct Supabase URL');
      return false;
    }
    
    if (!supabaseAnonKey) {
      console.error('❌ Missing VITE_SUPABASE_ANON_KEY environment variable');
      console.error('   Please check your .env file and ensure it contains the correct Supabase anon key');
      return false;
    }
    
    console.log('✅ Environment variables are set correctly');
    console.log('   Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NONE');
    console.log('   Supabase Anon Key: Set (hidden for security)');
    
    // Step 2: Check Supabase client initialization
    console.log('2. Checking Supabase client...');
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      return false;
    }
    console.log('✅ Supabase client initialized');
    
    // Step 3: Check auth session
    console.log('3. Checking auth session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Auth session error:', sessionError);
      if (sessionError.message.includes('connection')) {
        console.error('   This might be a network connectivity issue');
      } else if (sessionError.message.includes('Invalid API key')) {
        console.error('   This might indicate an incorrect Supabase anon key');
      } else if (sessionError.message.includes('Unauthorized') || sessionError.message.includes('401')) {
        console.error('   This indicates an authentication issue with Supabase');
        console.error('   Please verify your Supabase project URL and anon key are correct');
      }
      return false;
    }
    
    console.log('✅ Auth session check completed');
    console.log('   Session exists:', !!session);
    if (session?.user) {
      console.log('   User ID:', session.user.id);
      console.log('   User Email:', session.user.email);
    }
    
    // Step 4: Test database connectivity
    console.log('4. Testing database connectivity...');
    
    // Test public table access
    const { data: steps, error: stepsError } = await supabase
      .from('onboarding_steps')
      .select('id')
      .limit(1);
      
    if (stepsError) {
      console.error('❌ Database connectivity error:', stepsError);
      if (stepsError.message.includes('connection')) {
        console.error('   This might be a network connectivity issue');
      } else if (stepsError.message.includes('permission') || stepsError.message.includes('Forbidden')) {
        console.error('   This might be a Supabase authentication or RLS (Row Level Security) permission issue');
      } else if (stepsError.message.includes('does not exist')) {
        console.error('   This might indicate that the database tables have not been set up correctly');
      } else if (stepsError.message.includes('Unauthorized') || stepsError.message.includes('401')) {
        console.error('   This indicates an authentication issue with Supabase');
        console.error('   Please verify your Supabase project settings and API keys');
      }
      return false;
    }
    
    console.log('✅ Database connectivity test passed');
    console.log('   Onboarding steps accessible:', steps?.length > 0);
    
    // Step 5: Test profile access
    console.log('5. Testing profile access...');
    
    if (session?.user) {
      // Authenticated user - test profile access
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Profile access error:', profileError);
        if (profileError.message.includes('Unauthorized') || profileError.message.includes('401')) {
          console.error('   This indicates an authentication issue with Supabase');
          console.error('   Please check your Supabase table policies and user permissions');
        }
        return false;
      }
      
      console.log('✅ Profile access test passed for authenticated user');
      console.log('   Profile exists:', (profileData?.length || 0) > 0);
    } else {
      // Unauthenticated user - test with non-existent ID
      const { data: _, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .limit(1);
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Profile access error:', profileError);
        if (profileError.message.includes('permission') || profileError.message.includes('Forbidden')) {
          console.error('   This might be a RLS (Row Level Security) permission issue');
          console.error('   Make sure your Supabase tables have the correct policies set up');
        } else if (profileError.message.includes('Unauthorized') || profileError.message.includes('401')) {
          console.error('   This indicates an authentication issue with Supabase');
          console.error('   Please check your Supabase table policies and user permissions');
        }
        return false;
      }
      
      console.log('✅ Profile access test passed for unauthenticated user');
    }
    
    console.log('=== DIAGNOSIS COMPLETE ===');
    console.log('✅ All tests passed - authentication flow should work correctly');
    return true;
    
  } catch (error) {
    console.error('❌ Diagnosis failed with error:', error);
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

// Run the diagnosis
diagnoseAuthFlow().then(success => {
  if (success) {
    console.log('🎉 Auth flow diagnosis completed successfully');
  } else {
    console.log('💥 Auth flow diagnosis failed - check the errors above');
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your .env file contains correct Supabase credentials');
    console.log('2. Check your internet connection');
    console.log('3. Ensure your Supabase project is set up correctly');
    console.log('4. Check that the required database tables exist');
    console.log('5. Verify Row Level Security (RLS) policies are configured correctly');
  }
});

export default diagnoseAuthFlow;