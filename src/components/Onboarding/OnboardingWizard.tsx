import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, OnboardingStep, OnboardingProgress, InvestmentGoal } from '../../lib/supabase';
import { OtpVerificationStep } from './steps/OtpVerificationStep';
import { KycDocumentationStep } from './steps/KycDocumentationStep';
import { RiskProfilingStep } from './steps/RiskProfilingStep';
import { InvestmentGoalsStep } from './steps/InvestmentGoalsStep';
import { PersonalizedRecommendationsStep } from './steps/PersonalizedRecommendationsStep';
import { ProgressBar } from './ProgressBar';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function OnboardingWizard() {
  const { user, profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState<OnboardingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (user) {
      fetchOnboardingData();
    }
  }, [user]);

  useEffect(() => {
    // Set the current step based on profile's last active step
    if (profile?.last_active_step) {
      setCurrentStep(profile.last_active_step);
    }
  }, [profile]);

  const fetchOnboardingData = async () => {
    try {
      // Fetch onboarding steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('is_active', true)
        .order('step_number');

      if (stepsError) throw stepsError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user!.id);

      if (progressError) throw progressError;

      setSteps(stepsData || []);
      setProgress(progressData || []);

      // Initialize onboarding data
      const initialData: Record<string, unknown> = {};
      progressData?.forEach(item => {
        if (item.data) {
          initialData[item.step_id] = item.data;
        }
      });
      setOnboardingData(initialData);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingProgress = async (stepId: string, data: Record<string, unknown>) => {
    if (!user) return;

    try {
      // Update progress in database
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          completed: true,
          completed_at: new Date().toISOString(),
          data: data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step_id'
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => {
        const existing = prev.find(p => p.step_id === stepId);
        if (existing) {
          return prev.map(p => 
            p.step_id === stepId 
              ? { ...p, completed: true, completed_at: new Date().toISOString(), data } 
              : p
          );
        } else {
          return [
            ...prev,
            {
              id: Date.now().toString(),
              user_id: user.id,
              step_id: stepId,
              completed: true,
              completed_at: new Date().toISOString(),
              data: data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
        }
      });

      // Update onboarding data
      setOnboardingData(prev => ({
        ...prev,
        [stepId]: data
      }));
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    }
  };

  const handleStepSubmit = async (stepData: Record<string, unknown>) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const currentStepData = steps.find(s => s.step_number === currentStep);
      if (!currentStepData) return;

      // Special handling for KYC step (step 2) to save document references
      let processedData = stepData;
      if (currentStep === 2 && stepData.documents) {
        // Extract just the document references for progress tracking
        const documentRefs = Object.values(stepData.documents as Record<string, any>)
          .map((doc: any) => ({
            document_type: doc.document_type,
            file_name: doc.file_name,
            verification_status: doc.verification_status
          }));
        
        processedData = {
          ...stepData,
          documentReferences: documentRefs
        };
      }

      // Update progress
      await updateOnboardingProgress(currentStepData.id, processedData);

      // Update profile with last active step
      await updateProfile({
        last_active_step: currentStep + 1
      });

      // Move to next step if not the last one
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding
        await updateProfile({
          onboarding_completed: true,
          onboarding_completion_percentage: 100
        });
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      alert('Failed to submit step. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      // Update profile with last active step
      if (user) {
        await updateProfile({
          last_active_step: currentStep - 1
        });
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepNumber: number) => {
    const stepData = steps.find(s => s.step_number === stepNumber);
    if (!stepData) return false;
    return progress.some(p => p.step_id === stepData.id && p.completed);
  };

  const getStepData = (stepNumber: number) => {
    const stepData = steps.find(s => s.step_number === stepNumber);
    if (!stepData) return null;
    return onboardingData[stepData.id] || {};
  };

  const renderCurrentStep = () => {
    const stepData = getStepData(currentStep);
    const currentStepData = steps.find(s => s.step_number === currentStep);

    if (!currentStepData) return null;

    switch (currentStep) {
      case 1:
        return (
          <OtpVerificationStep
            initialData={stepData as Partial<any> || {}}
            onSubmit={handleStepSubmit}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <KycDocumentationStep
            initialData={stepData}
            onSubmit={handleStepSubmit}
            onBack={handleBack}
            loading={submitting}
            userId={user!.id}
          />
        );
      case 3:
        return (
          <RiskProfilingStep
            initialData={stepData as Record<string, unknown> | undefined}
            onSubmit={handleStepSubmit}
            onBack={handleBack}
            loading={submitting}
          />
        );
      case 4:
        return (
          <InvestmentGoalsStep
            initialData={stepData}
            onSubmit={handleStepSubmit}
            onBack={handleBack}
            loading={submitting}
            userId={user!.id}
          />
        );
      case 5:
        {
          // Get risk profile and goals for recommendations step
          const riskData = getStepData(3); // Risk profiling is step 3
          const goalsData = getStepData(4); // Goals setup is step 4
          return (
            <PersonalizedRecommendationsStep
              initialData={stepData as Record<string, unknown> | undefined}
              onSubmit={handleStepSubmit}
              onBack={handleBack}
              loading={submitting}
              userId={user!.id}
              riskProfile={(riskData as { riskProfile?: string })?.riskProfile || 'Moderate'}
              goals={(goalsData as { goals?: InvestmentGoal[] })?.goals || []}
            />
          );
        }
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Onboarding</h1>
          <p className="text-gray-600">Complete your profile to start your wealth journey</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          steps={steps}
          currentStep={currentStep}
          progress={progress}
        />

        {/* Current Step Content */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500 flex items-center">
            Step {currentStep} of {steps.length}
          </div>

          <button
            onClick={() => {
              // In a real app, you might want to validate before moving forward
              if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={currentStep === steps.length || !isStepCompleted(currentStep)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}