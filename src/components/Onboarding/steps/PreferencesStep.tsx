import { useState } from 'react';
import { Bell, Mail, MessageSquare, Shield } from 'lucide-react';

interface FormData {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
  dataProcessingConsent: boolean;
  [key: string]: any;
}

interface PreferencesStepProps {
  initialData: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

export function PreferencesStep({ initialData, onSubmit, loading }: PreferencesStepProps) {
  const [formData, setFormData] = useState<FormData>({
    emailNotifications: initialData?.emailNotifications !== false,
    smsNotifications: initialData?.smsNotifications || false,
    marketingEmails: initialData?.marketingEmails || false,
    weeklyReports: initialData?.weeklyReports !== false,
    securityAlerts: initialData?.securityAlerts !== false,
    dataProcessingConsent: initialData?.dataProcessingConsent || false,
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleToggle = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const preferences = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive important updates via email',
      icon: Mail,
      required: false
    },
    {
      id: 'smsNotifications',
      title: 'SMS Notifications',
      description: 'Get urgent alerts via text message',
      icon: MessageSquare,
      required: false
    },
    {
      id: 'marketingEmails',
      title: 'Marketing Communications',
      description: 'Receive product updates and promotional content',
      icon: Bell,
      required: false
    },
    {
      id: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Get weekly summaries of your account activity',
      icon: Mail,
      required: false
    },
    {
      id: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important security notifications and alerts',
      icon: Shield,
      required: true
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences Setup</h2>
        <p className="text-gray-600">Customize your account settings and notification preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
          
          {preferences.map((preference) => {
            const IconComponent = preference.icon;
            return (
              <div key={preference.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <IconComponent className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {preference.title}
                      </h4>
                      {preference.required && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {preference.description}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[preference.id]}
                      onChange={() => handleToggle(preference.id)}
                      disabled={preference.required}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
          
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="dataProcessingConsent"
              checked={formData.dataProcessingConsent}
              onChange={() => handleToggle('dataProcessingConsent')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="dataProcessingConsent" className="text-sm font-medium text-gray-900">
                Data Processing Consent
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I consent to the processing of my personal data for the purposes of account management, 
                service provision, and communication as outlined in the privacy policy.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !formData.dataProcessingConsent}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}