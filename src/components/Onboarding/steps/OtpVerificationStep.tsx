import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Phone, Mail, Shield } from 'lucide-react';

interface FormData {
  phone: string;
  email: string;
  otp: string;
  [key: string]: any;
}

interface OtpVerificationStepProps {
  initialData: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

export function OtpVerificationStep({ initialData, onSubmit, onBack }: OtpVerificationStepProps) {
  const { sendOtp, verifyOtp, profile } = useAuth();
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [formData, setFormData] = useState<FormData>({
    phone: profile?.phone || '',
    email: profile?.email || '',
    otp: '',
    ...initialData
  });
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (type: 'phone' | 'email') => {
    setSendingOtp(true);
    setError('');
    
    try {
      const success = await sendOtp(
        type === 'phone' ? formData.phone : '',
        type === 'email' ? formData.email : '',
        type
      );
      
      if (success) {
        setStep('verify');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while sending OTP.');
      console.error('OTP send error:', err);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    setError('');
    
    try {
      const success = await verifyOtp(formData.otp, 'phone'); // Default to phone for now
      
      if (success) {
        onSubmit({ ...formData, otpVerified: true });
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while verifying OTP.');
      console.error('OTP verify error:', err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (step === 'send') {
    return (
      <div>
        <div className="mb-8 text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
          <p className="text-gray-600">We need to verify your contact information to proceed</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your phone number"
              />
            </div>
            <button
              onClick={() => handleSendOtp('phone')}
              disabled={sendingOtp || !formData.phone}
              className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sendingOtp ? 'Sending OTP...' : 'Send OTP to Phone'}
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email address"
              />
            </div>
            <button
              onClick={() => handleSendOtp('email')}
              disabled={sendingOtp || !formData.email}
              className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sendingOtp ? 'Sending OTP...' : 'Send OTP to Email'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
        <p className="text-gray-600">Enter the 6-digit code sent to your {formData.phone ? 'phone' : 'email'}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter OTP
          </label>
          <input
            type="text"
            value={formData.otp}
            onChange={(e) => handleInputChange('otp', e.target.value)}
            maxLength={6}
            className="block w-full text-center text-2xl tracking-widest py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0 0 0 0 0 0"
          />
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Didn't receive the code?</p>
          <button
            onClick={() => setStep('send')}
            className="text-blue-600 hover:text-blue-800 font-medium mt-1"
          >
            Resend OTP
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep('send')}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleVerifyOtp}
          disabled={verifyingOtp || formData.otp.length !== 6}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
}