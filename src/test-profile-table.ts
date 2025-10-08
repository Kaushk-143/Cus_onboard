import { supabase } from './lib/supabase';

async function testProfileTable() {
  console.log('Testing profile table access...');
  
  try {
    // First check auth state
    console.log('Checking auth state...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('Auth state:', { session, authError });
    
    // Check if user is authenticated
    if (!session?.user) {
      console.log('User not authenticated, testing with public access...');
      
      // Try to fetch onboarding steps (public data)
      console.log('Fetching onboarding steps...');
      const { data: steps, error: stepsError } = await supabase
        .from('onboarding_steps')
        .select('*')
        .limit(1);
        
      console.log('Onboarding steps result:', { steps, stepsError });
      
      // Try a simple select query with a condition that will never match
      console.log('Attempting to fetch from profiles table...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent UUID
        .limit(1);

      if (error) {
        console.error('Profile table access test failed:', error);
        // Check if it's a permission error
        if (error.message.includes('permission') || error.message.includes('Forbidden')) {
          console.error('This might be a RLS (Row Level Security) permission issue');
          console.error('Make sure your Supabase tables have the correct policies set up');
        } else if (error.message.includes('does not exist')) {
          console.error('This might indicate that the profiles table has not been created yet');
          console.error('Please run the database migrations to set up the required tables');
        }
        return false;
      }

      console.log('Profile table access test successful:', data);
      return true;
    } else {
      console.log('User is authenticated, testing with authenticated access...');
      
      // Try to fetch the user's profile
      console.log('Fetching user profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      console.log('User profile result:', { data, error });
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Profile fetch error:', error);
        return false;
      }
      
      console.log('Profile table access test successful');
      return true;
    }
  } catch (error) {
    console.error('Profile table access test error:', error);
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
testProfileTable().then(success => {
  if (success) {
    console.log('✅ Profile table access test passed');
  } else {
    console.log('❌ Profile table access test failed');
    console.log('Please check the error messages above for troubleshooting information');
  }
});