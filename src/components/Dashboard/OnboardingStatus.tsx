import { Profile } from '../../lib/supabase';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface OnboardingStatusProps {
  profile: Profile | null;
}

export function OnboardingStatus({ profile }: OnboardingStatusProps) {
  const completionPercentage = profile?.onboarding_completion_percentage || 0;
  const isComplete = profile?.onboarding_completed || false;

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
      isComplete ? 'border-green-500' : 'border-orange-500'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {isComplete ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <AlertCircle className="h-8 w-8 text-orange-500" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isComplete ? 'Onboarding Complete!' : 'Complete Your Onboarding'}
            </h2>
            <p className="text-gray-600">
              {isComplete 
                ? 'Your account is fully set up and ready to use.'
                : 'Finish setting up your profile to access all features.'
              }
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
            {completionPercentage}%
          </div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {!isComplete && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Continue where you left off
          </div>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <span>Continue Onboarding</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {isComplete && (
        <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Account verified and ready to use!
          </span>
        </div>
      )}
    </div>
  );
}