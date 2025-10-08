import { Profile } from '../../../lib/supabase';
import { CheckCircle, User, FileText } from 'lucide-react';

interface FinalReviewStepProps {
  profile: Profile | null;
  onComplete: (data: Record<string, unknown>) => void;
  loading: boolean;
}

export function FinalReviewStep({ profile, onComplete, loading }: FinalReviewStepProps) {
  const handleComplete = () => {
    onComplete({ reviewCompleted: true, completedAt: new Date().toISOString() });
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h2>
        <p className="text-gray-600">Please review your information before completing the onboarding</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{profile?.full_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{profile?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Document Verification */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Document Verification</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-sm text-gray-600">
            <p>Documents uploaded and ready for verification</p>
            <p className="mt-1">Verification typically takes 1-2 business days</p>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Onboarding Progress</h3>
              <p className="text-sm text-gray-600">You're ready to complete your onboarding!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {profile?.onboarding_completion_percentage || 0}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-800 mb-2">Important Notice</h4>
          <p className="text-sm text-yellow-700">
            By completing this onboarding process, you acknowledge that you have read and agree to our 
            Terms of Service and Privacy Policy. Your account will be activated upon successful verification 
            of your submitted documents.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleComplete}
          disabled={loading}
          className="px-12 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white text-lg font-medium rounded-lg hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {loading ? 'Completing Onboarding...' : 'Complete Onboarding'}
        </button>
      </div>
    </div>
  );
}