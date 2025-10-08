import { diagnoseNetworkConnectivity } from './utils/network-diagnostic';

async function runNetworkDiagnostics() {
  console.log('=== NETWORK DIAGNOSTICS ===');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('❌ Missing VITE_SUPABASE_URL environment variable');
    return;
  }
  
  console.log('Testing connectivity...');
  
  try {
    const result = await diagnoseNetworkConnectivity();
    
    console.log('\n=== RESULTS ===');
    console.log('Browser online status:', result.browserOnline);
    console.log('Network accessible:', result.supabaseAccessible);
    
    if (result.errorMessage) {
      console.log('Error:', result.errorMessage);
    }
    
    if (result.supabaseAccessible) {
      console.log('✅ Network connectivity test PASSED');
      console.log('\nNote: This test confirms general internet connectivity.');
      console.log('The application will now attempt to connect to Supabase.');
    } else {
      console.log('❌ Network connectivity test FAILED');
      console.log('\nTroubleshooting steps:');
      console.log('1. Check your internet connection');
      console.log('2. Check if you\'re behind a firewall or proxy');
      console.log('3. Try accessing other websites to confirm general connectivity');
    }
  } catch (error) {
    console.error('❌ Network diagnostics failed:', error);
  }
}

// Run the diagnostics
runNetworkDiagnostics();

export default runNetworkDiagnostics;