import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, Notification, InvestmentGoal, MutualFund } from '../../lib/supabase';
import { ProfileCard } from './ProfileCard';
import { OnboardingStatus } from './OnboardingStatus';
import { NotificationPanel } from './NotificationPanel';
import { TrendingUp, Target, Bell, User, CheckCircle, Clock } from 'lucide-react';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchNotifications(),
        fetchInvestmentGoals(),
        fetchMutualFunds()
      ]).then(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchInvestmentGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_goals')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching investment goals:', error);
    }
  };

  const fetchMutualFunds = async () => {
    try {
      const { data, error } = await supabase
        .from('mutual_funds')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (error) throw error;
      setFunds(data || []);
    } catch (error) {
      console.error('Error fetching mutual funds:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || 'User'}!
              </h1>
              <p className="text-gray-600">Manage your investments and track your financial goals</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="h-6 w-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Onboarding Status */}
            <OnboardingStatus profile={profile} />

            {/* Investment Goals */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Investment Goals</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All
                </button>
              </div>
              
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">{goal.goal_name}</h3>
                        <span className="text-sm text-gray-500 capitalize">
                          {goal.goal_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-600">
                          ₹{goal.current_savings.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                        </span>
                        <span className="text-gray-600">
                          {Math.round((goal.current_savings / goal.target_amount) * 100)}% achieved
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (goal.current_savings / goal.target_amount) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No investment goals yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by setting up your first investment goal.</p>
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Set Goal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Portfolio Overview</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Details
                </button>
              </div>
              
              {funds.length > 0 ? (
                <div className="space-y-4">
                  {funds.slice(0, 3).map((fund) => (
                    <div key={fund.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{fund.scheme_name}</h3>
                        <p className="text-sm text-gray-600">{fund.fund_house}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{fund.expected_return}%</p>
                        <p className="text-sm text-gray-600">Expected Return</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No investments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start building your portfolio with our recommended funds.</p>
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Target className="h-4 w-4 mr-2" />
                      View Recommendations
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start space-x-3 p-4 rounded-lg border ${
                        notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        notification.read ? 'bg-gray-400' : 'bg-blue-500'
                      }`} />
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Profile Card */}
            <ProfileCard profile={profile} />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Overview</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Profile</div>
                  <div className="text-sm text-gray-600">
                    {profile?.full_name ? 'Complete' : 'Incomplete'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.onboarding_completion_percentage || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Onboarding</div>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.onboarding_completed ? 'Active' : 'Pending'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>

            {/* Notifications Panel */}
            <NotificationPanel 
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
            />
          </div>
        </div>
      </main>
    </div>
  );
}