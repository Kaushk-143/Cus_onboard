import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test a simple query to see if we can connect
    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('count()', { count: 'exact' });
    
    console.log('Supabase connection test result:', { data, error });
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful!');
    }
  } catch (error) {
    console.error('Unexpected error during Supabase test:', error);
  }
}

testSupabaseConnection();