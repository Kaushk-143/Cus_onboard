import { Profile } from '../../lib/supabase';
import { User, Mail, Phone, MapPin, Building } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile | null;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-16 h-16 flex items-center justify-center">
            <User className="text-white h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">User</h2>
            <p className="text-gray-600">Profile not available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-16 h-16 flex items-center justify-center">
          <User className="text-white h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{profile.full_name || 'User'}</h2>
          <p className="text-gray-600">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-3" />
          <span>{profile.email}</span>
        </div>

        {profile.phone && (
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-3" />
            <span>{profile.phone}</span>
          </div>
        )}

        {(profile.city || profile.state) && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-3" />
            <span>{profile.city}{profile.city && profile.state ? ', ' : ''}{profile.state}</span>
          </div>
        )}

        {profile.employment_status && (
          <div className="flex items-center text-gray-600">
            <Building className="h-4 w-4 mr-3" />
            <span>{profile.employment_status}</span>
          </div>
        )}
      </div>
    </div>
  );
}