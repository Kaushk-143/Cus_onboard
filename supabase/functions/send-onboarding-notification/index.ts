/*
  # Send Onboarding Notification Edge Function
  
  This function sends email notifications during the onboarding process
  and creates in-app notifications for users.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface NotificationRequest {
  userId: string;
  type: 'welcome' | 'step_completed' | 'onboarding_completed';
  stepName?: string;
  userEmail?: string;
  userName?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, type, stepName, userEmail, userName }: NotificationRequest = await req.json();

    let title = '';
    let message = '';

    // Create notification content based on type
    switch (type) {
      case 'welcome':
        title = '🎉 Welcome to Our Platform!';
        message = 'We\'re excited to have you on board. Let\'s get you set up with a quick onboarding process.';
        break;
      case 'step_completed':
        title = '✅ Step Completed';
        message = `Great job! You've completed the "${stepName}" step. Keep going to finish your onboarding.`;
        break;
      case 'onboarding_completed':
        title = '🚀 Onboarding Complete!';
        message = 'Congratulations! You\'ve successfully completed the onboarding process. Welcome to the platform!';
        break;
      default:
        title = 'Notification';
        message = 'You have a new notification.';
    }

    // Create in-app notification
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: type === 'onboarding_completed' ? 'success' : 'info'
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    // In a real-world application, you would also send an email here
    // using a service like SendGrid, Resend, or AWS SES
    console.log(`Would send email to ${userEmail}: ${title}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-onboarding-notification function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});