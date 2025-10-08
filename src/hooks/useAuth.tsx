import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import { formatNetworkError } from '../utils/network-diagnostic';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  sendOtp: (phone: string, email: string, type: 'phone' | 'email') => Promise<boolean>;
  verifyOtp: (otp: string, type: 'phone' | 'email') => Promise<boolean>;
  refreshAuthState: () => Promise<void>;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Function to check network connectivity
  const checkConnectivity = useCallback(async () => {
    // First check browser's online status
    if (!navigator.onLine) {
      return false;
    }
    
    // Try a general internet connectivity test first with primary endpoint
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
      return true;
    } catch (err) {
      // Try secondary connectivity check with a different approach
      try {
        // Simple HEAD request to a CORS-enabled endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('https://httpbin.org/get', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          return false;
        }
        return true;
      } catch {
        // As a last resort, try to fetch a known resource from the same origin
        try {
          // This won't actually make a network request but will test if fetch API works
          await fetch('/ping', { method: 'HEAD', mode: 'no-cors' });
          return true;
        } catch {
          // Log the error for debugging but don't process it
          console.debug('General connectivity check failed:', (err as Error).message || err);
          return false;
        }
      }
    }
  }, []);

  // Function to refresh auth state with retry logic
  const refreshAuthState = useCallback(async (attempt = 1) => {
    const maxRetries = 3;
    
    try {
      console.log('AuthProvider: Refreshing auth state (attempt ' + attempt + ')');
      
      // Check network connectivity first
      await checkConnectivity();
      // We'll proceed even if connectivity check fails as it might be a false negative
      
      setLoading(true);
      setError(null);
      
      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        if (attempt < maxRetries && (sessionError.message.includes('Network') || 
                                     sessionError.message.includes('fetch') ||
                                     sessionError.message.includes('connection') ||
                                     sessionError.message.includes('ERR_CONNECTION_CLOSED'))) {
          console.log(`AuthProvider: Session fetch failed, retrying in ${attempt * 2000}ms...`);
          setTimeout(() => refreshAuthState(attempt + 1), attempt * 2000);
          return;
        }
        // For non-network errors or when we've exhausted retries, we'll still update the state
        // to prevent infinite loading
        console.warn('AuthProvider: Session fetch failed, proceeding with current state', sessionError.message);
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
      
      // Reset retry count on success or when we've handled the error
      // setRetryCount(0); // This is unused, let's remove the state if not needed
    } catch (err) {
      console.error('AuthProvider: Error refreshing auth state:', err);
      const formattedError = formatNetworkError(err);
      
      if (attempt < maxRetries) {
        console.log(`AuthProvider: Refresh failed, retrying in ${attempt * 2000}ms...`);
        setTimeout(() => refreshAuthState(attempt + 1), attempt * 2000);
        return;
      }
      
      // Even on final failure, we need to stop loading to prevent UI lockup
      setLoading(false);
      // Only set error for non-network issues to avoid excessive error messages
      if (!formattedError.includes('Network') && !formattedError.includes('connection')) {
        setError(formattedError);
      }
    }
  }, [checkConnectivity]);

  useEffect(() => {
    // Monitor network connectivity
    const handleOnline = () => {
      console.log('Network connection restored');
      setIsOnline(true);
      // When coming back online, refresh auth state with a delay to ensure network is truly restored
      if (error) {
        setTimeout(() => {
          refreshAuthState();
        }, 1000);
      }
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
      setIsOnline(false);
      // Don't immediately set error state, just show that we're offline
      // The UI can handle this appropriately
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout | null = null;
    let refreshInterval: NodeJS.Timeout | null = null;
    
    console.log('AuthProvider: Initializing auth');
    
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting session');
        
        // Check network connectivity first with a more lenient approach
        await checkConnectivity();
        // Even if connectivity check fails, we'll still try to get the session
        // as the check might be giving false negatives
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        console.log('AuthProvider: Session result', { session, sessionError });
        
        if (sessionError) {
          console.error('AuthProvider: Session error details', sessionError);
          // Handle network-related errors specifically
          if (sessionError.message.includes('404') && supabaseUrl?.includes('obbycwigtdzgnyapbdjl')) {
            console.error('AuthProvider: Invalid Supabase URL detected. Please check your .env file.');
            const formattedError = 'Invalid Supabase configuration. Please check your .env file and ensure the Supabase URL is correct.';
            throw new Error(formattedError);
          } else if (sessionError.message.includes('Network') || 
              sessionError.message.includes('fetch') ||
              sessionError.message.includes('connection') ||
              sessionError.message.includes('ERR_CONNECTION_CLOSED')) {
            // Don't throw immediately, let the app continue with no session
            console.warn('AuthProvider: Network issue detected, proceeding with no session');
          } else {
            const formattedError = formatNetworkError(sessionError);
            throw new Error(`Failed to get session: ${formattedError}`);
          }
        }
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('AuthProvider: User found, fetching profile', session.user.id);
            await fetchProfile(session.user.id);
          } else {
            console.log('AuthProvider: No user found, setting loading to false');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        const formattedError = formatNetworkError(error);
        // Even on error, we should stop loading to allow the UI to show error state
        if (isMounted) {
          setLoading(false);
          // Only set error if it's not a network issue that we're handling gracefully
          if (!formattedError.includes('Network') && !formattedError.includes('connection')) {
            setError(formattedError);
          }
        }
      }
    };

    // Listen for auth changes
    console.log('AuthProvider: Setting up auth state change listener');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed', { event, session });
      
      // Clear any existing timeout when auth state changes
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }
      
      // Add detailed logging for each event type
      switch (event) {
        case 'INITIAL_SESSION':
          console.log('AuthProvider: Initial session event');
          break;
        case 'SIGNED_IN':
          console.log('AuthProvider: Signed in event');
          break;
        case 'SIGNED_OUT':
          console.log('AuthProvider: Signed out event');
          break;
        case 'TOKEN_REFRESHED':
          console.log('AuthProvider: Token refreshed event');
          break;
        case 'USER_UPDATED':
          console.log('AuthProvider: User updated event');
          break;
        default:
          console.log('AuthProvider: Other auth event', event);
      }
      
      if (!isMounted) {
        console.log('AuthProvider: Component not mounted, ignoring auth state change');
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          console.log('AuthProvider: User logged in, fetching profile', session.user.id);
          await fetchProfile(session.user.id);
        } catch (err) {
          console.error('AuthProvider: Error fetching profile:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
          setError(errorMessage);
        }
      } else {
        console.log('AuthProvider: User logged out, resetting profile');
        setProfile(null);
        setLoading(false);
        setError(null); // Clear any previous errors when signing out
      }
    });

    // Add a timeout to prevent infinite loading - reduced from 15s to 10s for better UX
    loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('AuthProvider: Loading timeout reached, forcing loading to false');
        setLoading(false);
        // Only set error if we don't already have user data
        if (!user) {
          setError('Authentication timeout - please check your internet connection and Supabase configuration');
        }
      }
    }, 10000); // Reduced timeout to 10 seconds

    initializeAuth().catch(err => {
      console.error('AuthProvider: Error in initializeAuth:', err);
      if (isMounted) {
        setLoading(false);
        setError(err instanceof Error ? err.message : 'Authentication initialization failed');
      }
    });

    // Set up periodic refresh to handle network issues
    refreshInterval = setInterval(() => {
      if (!loading && isMounted) {
        // Refresh session periodically to ensure it's still valid
        supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
          if (!error && currentSession?.user?.id !== user?.id) {
            // User has changed, trigger a refresh
            refreshAuthState();
          }
          // For network errors, we just silently ignore them in periodic refresh
          // as they might be temporary
        }).catch(err => {
          console.error('AuthProvider: Error in periodic refresh (ignoring):', err);
          // Don't set error here as it might be a temporary network issue
          // We'll retry on the next interval
        });
      }
    }, 60000); // Refresh every 60 seconds

    return () => {
      console.log('AuthProvider: Cleaning up');
      isMounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, refreshAuthState, checkConnectivity]);

  const fetchProfile = async (userId: string) => {
    console.log('AuthProvider: Fetching profile for user', userId);
    
    try {
      // Use a more explicit query that's less likely to cause 406 errors
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle cases where profile doesn't exist

      console.log('AuthProvider: Profile fetch result', { data, error });
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('406') || error.message.includes('Not Acceptable')) {
          console.error('AuthProvider: 406 Not Acceptable error - this might be due to RLS policies');
          // Try a different approach - fetch without user_id filter to see if we can access the table at all
          const { error: testError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
            
          if (testError) {
            console.error('AuthProvider: Cannot access profiles table at all:', testError);
            throw new Error('Cannot access user profiles. Please check your Supabase table policies.');
          } else {
            console.log('AuthProvider: Profiles table is accessible, but user-specific query failed');
            // This suggests an RLS policy issue
            throw new Error('Access denied to your profile. Please contact support.');
          }
        } else if (error.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is not an error in this case
          throw error;
        }
      }

      if (data) {
        console.log('AuthProvider: Profile found', data);
        setProfile(data);
      } else {
        console.log('AuthProvider: No profile found, creating new profile');
        // Create a new profile if it doesn't exist
        await createProfile(userId);
        return; // Exit early since createProfile handles setLoading
      }
    } catch (error) {
      console.error('AuthProvider: Error fetching profile:', error);
      throw error;
    } finally {
      console.log('AuthProvider: Setting loading to false');
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    console.log('AuthProvider: Creating profile for user', userId);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('AuthProvider: User data result', { userData, userError });
      
      if (userError) throw userError;
      
      const email = userData.user?.email || '';
      
      // Try to insert the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: email,
        })
        .select()
        .maybeSingle(); // Use maybeSingle to handle potential issues

      console.log('AuthProvider: Profile creation result', { profileData, profileError });
      
      if (profileError) {
        console.error('AuthProvider: Profile creation failed:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }
      
      if (profileData) {
        // Set the newly created profile directly
        console.log('AuthProvider: Setting newly created profile');
        setProfile(profileData);
      } else {
        console.warn('AuthProvider: Profile creation succeeded but no data returned');
        // Try to fetch the profile we just created
        await fetchProfile(userId);
      }
    } catch (error) {
      console.error('AuthProvider: Error creating profile:', error);
      throw error;
    } finally {
      console.log('AuthProvider: Profile creation complete, setting loading to false');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Signing up user:', { email, fullName });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      console.log('Sign up result:', { data, error });

      if (error) {
        console.error('Sign up error details:', error);
        throw error;
      }

      if (data.user) {
        console.log('User signed up, waiting for profile creation...');

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (existingProfile) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                full_name: fullName,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', data.user.id);

            if (updateError) {
              console.error('Profile update error:', updateError);
            }
          }
        } catch (err) {
          console.warn('Error updating profile after signup:', err);
        }

        try {
          await sendWelcomeNotification(data.user.id);
        } catch (err) {
          console.warn('Could not send welcome notification:', err);
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', { email });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in result:', { error });
      
      if (error) {
        console.error('Sign in error details:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      console.log('Sign out result:', { error });
      
      if (error) {
        console.error('Sign out error details:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      console.log('Updating profile:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      console.log('Profile update result:', { error });
      
      if (error) {
        console.error('Profile update error details:', error);
        throw error;
      }

      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const sendOtp = async (phone: string, email: string, type: 'phone' | 'email'): Promise<boolean> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      console.log('Sending OTP:', { phone, email, type });
      
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      // Save OTP to database
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          user_id: user.id,
          phone: type === 'phone' ? phone : undefined,
          email: type === 'email' ? email : undefined,
          otp_code: otp,
          otp_type: type,
          expires_at: expiresAt
        });

      console.log('OTP send result:', { error });
      
      if (error) {
        console.error('OTP send error details:', error);
        throw error;
      }
      
      // In a real application, you would send the OTP via SMS/email service
      console.log(`OTP for ${type}: ${otp}`);
      
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  };

  const verifyOtp = async (otp: string, type: 'phone' | 'email'): Promise<boolean> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      console.log('Verifying OTP:', { otp, type });
      
      // Get the latest OTP for this user and type
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('otp_type', type)
        .gt('expires_at', new Date().toISOString())
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('OTP verification result:', { data, error });
      
      if (error || !data) {
        console.error('OTP verification error details:', error);
        throw new Error('No valid OTP found');
      }

      // Check if OTP matches
      if (data.otp_code === otp) {
        // Mark OTP as verified
        const { error: updateError } = await supabase
          .from('otp_verifications')
          .update({
            is_verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (updateError) {
          console.error('OTP verification update error details:', updateError);
          throw updateError;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  };

  const sendWelcomeNotification = async (userId: string) => {
    try {
      console.log('Sending welcome notification for user:', userId);
      
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Cannot send notification: Auth session error:', sessionError);
        return;
      }
      
      if (!session?.user) {
        console.error('Cannot send notification: User not authenticated');
        return;
      }
      
      // Try to send the notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '🎉 Welcome to Our Investment Platform!',
          message: 'We\'re excited to have you on board. Let\'s get you set up with a quick onboarding process to start your wealth journey.',
          type: 'success',
          category: 'onboarding'
        });
      
      if (error) {
        console.error('Error sending welcome notification:', error);
        // Don't throw error here as it shouldn't break the signup flow
      } else {
        console.log('Welcome notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      // Don't throw error here as it shouldn't break the signup flow
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    sendOtp,
    verifyOtp,
    refreshAuthState,
    isOnline
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}