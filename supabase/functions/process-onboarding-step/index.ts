/*
  # Process Onboarding Step Edge Function
  
  This function processes onboarding step submissions,
  validates data, and triggers notifications.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StepSubmission {
  stepId: string;
  data: Record<string, any>;
  userId: string;
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

    const { stepId, data, userId }: StepSubmission = await req.json();

    if (!stepId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get step information
    const { data: stepData, error: stepError } = await supabaseClient
      .from('onboarding_steps')
      .select('*')
      .eq('id', stepId)
      .single();

    if (stepError || !stepData) {
      return new Response(
        JSON.stringify({ error: 'Invalid step ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update or insert onboarding progress
    const { error: progressError } = await supabaseClient
      .from('onboarding_progress')
      .upsert({
        user_id: userId,
        step_id: stepId,
        completed: true,
        completed_at: new Date().toISOString(),
        data: data,
        updated_at: new Date().toISOString()
      });

    if (progressError) {
      console.error('Error updating progress:', progressError);
      throw progressError;
    }

    // Update profile with step-specific data
    if (stepData.step_number === 1) {
      // Personal information step
      await supabaseClient
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else if (stepData.step_number === 2) {
      // Company details step
      await supabaseClient
        .from('profiles')
        .update({
          company_name: data.companyName,
          company_size: data.companySize,
          industry: data.industry,
          job_title: data.jobTitle,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }

    // Get user info for notification
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select('email, full_name, onboarding_completion_percentage')
      .eq('user_id', userId)
      .single();

    // Send step completion notification
    const notificationResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-onboarding-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type: userProfile?.onboarding_completion_percentage === 100 ? 'onboarding_completed' : 'step_completed',
        stepName: stepData.step_name,
        userEmail: userProfile?.email,
        userName: userProfile?.full_name
      })
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Step processed successfully',
        completionPercentage: userProfile?.onboarding_completion_percentage || 0
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
    console.error('Error in process-onboarding-step function:', error);
    
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