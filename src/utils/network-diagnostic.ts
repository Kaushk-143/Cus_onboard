// Network diagnostic utility to help identify connectivity issues
export async function diagnoseNetworkConnectivity(): Promise<{
  browserOnline: boolean;
  supabaseAccessible: boolean;
  errorMessage?: string;
}> {
  const result = {
    browserOnline: navigator.onLine,
    supabaseAccessible: false,
    errorMessage: undefined as string | undefined
  };

  if (!navigator.onLine) {
    result.errorMessage = 'Browser reports offline status';
    return result;
  }

  // First test general internet connectivity with primary endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // Using a CORS-friendly endpoint that supports all origins
    const response = await fetch('https://1.1.1.1/cdn-cgi/trace', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Try secondary endpoint
      throw new Error('Primary connectivity check failed');
    }
    result.supabaseAccessible = true;
    return result;
  } catch (err) {
    // Try secondary connectivity check
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Simple HEAD request to reduce data transfer
      const response = await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        result.errorMessage = 'General internet connectivity appears to be down';
        return result;
      }
      result.supabaseAccessible = true;
      return result;
    } catch {
      // Log the error for debugging but don't process it
      console.debug('All connectivity checks failed:', (err as Error).message || err);
      result.errorMessage = 'General internet connectivity appears to be down';
      return result;
    }
  }
}

export function formatNetworkError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;
    if (message.includes('ERR_CONNECTION_CLOSED')) {
      return 'Connection was closed unexpectedly. This might be due to network issues or Supabase service problems.';
    }
    if (message.includes('ERR_CONNECTION_REFUSED')) {
      return 'Connection was refused. Please check if the Supabase URL is correct.';
    }
    if (message.includes('ERR_NETWORK_CHANGED')) {
      return 'Network connection changed. Please try again.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please check your network connection.';
    }
    if (message.includes('404')) {
      return 'The requested resource was not found. Please check your Supabase URL configuration.';
    }
    return message;
  }
  return 'An unknown network error occurred';
}