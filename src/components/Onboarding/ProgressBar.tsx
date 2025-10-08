import { OnboardingStep, OnboardingProgress } from '../../lib/supabase';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  steps: OnboardingStep[];
  currentStep: number;
  progress: OnboardingProgress[];
}

export function ProgressBar({ steps, currentStep, progress }: ProgressBarProps) {
  const isStepCompleted = (stepNumber: number) => {
    const stepData = steps.find(s => s.step_number === stepNumber);
    if (!stepData) return false;
    return progress.some(p => p.step_id === stepData.id && p.completed);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        {steps.map((step) => {
          const isActive = step.step_number === currentStep;
          const isCompleted = isStepCompleted(step.step_number);
          const isAccessible = step.step_number <= currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isActive 
                    ? 'bg-blue-600 text-white' 
                    : isAccessible 
                      ? 'bg-gray-200 text-gray-600' 
                      : 'bg-gray-100 text-gray-400'
                }
              `}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.step_number
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step.step_name}
                </div>
                {step.step_description && (
                  <div className="text-xs text-gray-400 mt-1 max-w-24">
                    {step.step_description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Line */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}