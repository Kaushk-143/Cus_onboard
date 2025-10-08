import { useState, useEffect } from 'react';
import { supabase, MutualFund, FundAllocation, InvestmentGoal } from '../../../lib/supabase';
import { TrendingUp, PieChart, CheckCircle, Mail } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PersonalizedRecommendationsStepProps {
  initialData: Record<string, unknown> | undefined;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
  loading: boolean;
  userId: string;
  riskProfile: string;
  goals: InvestmentGoal[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export function PersonalizedRecommendationsStep({ 
  initialData, 
  onSubmit, 
  onBack, 
  loading, 
  userId, 
  riskProfile, 
  goals 
}: PersonalizedRecommendationsStepProps) {
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [allocations, setAllocations] = useState<FundAllocation[]>(initialData?.allocations as FundAllocation[] || []);
  const [recommendedFunds, setRecommendedFunds] = useState<MutualFund[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchMutualFunds();
  }, []);

  useEffect(() => {
    if (funds.length > 0 && goals.length > 0) {
      generateRecommendations();
    }
  }, [funds, goals, riskProfile]);

  const fetchMutualFunds = async () => {
    try {
      const { data, error } = await supabase
        .from('mutual_funds')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setFunds(data || []);
    } catch (error) {
      console.error('Error fetching mutual funds:', error);
    }
  };

  const generateRecommendations = () => {
    // Simple recommendation logic based on risk profile
    let filteredFunds = [...funds];
    
    switch (riskProfile.toLowerCase()) {
      case 'conservative':
        filteredFunds = funds.filter(fund => 
          fund.risk_level === 'low' || fund.category === 'debt'
        );
        break;
      case 'moderate':
        filteredFunds = funds.filter(fund => 
          fund.risk_level === 'moderate' || fund.category === 'hybrid'
        );
        break;
      case 'aggressive':
        filteredFunds = funds.filter(fund => 
          fund.risk_level === 'high' || fund.category === 'equity' || fund.category === 'elss'
        );
        break;
      default:
        filteredFunds = funds;
    }
    
    // Sort by expected return (descending for aggressive, ascending for conservative)
    if (riskProfile.toLowerCase() === 'conservative') {
      filteredFunds.sort((a, b) => (a.expected_return || 0) - (b.expected_return || 0));
    } else {
      filteredFunds.sort((a, b) => (b.expected_return || 0) - (a.expected_return || 0));
    }
    
    // Take top 5 recommendations
    setRecommendedFunds(filteredFunds.slice(0, 5));
  };

  const handleAllocate = (fundId: string, percentage: number) => {
    setAllocations(prev => {
      const existing = prev.find(a => a.fund_id === fundId);
      if (existing) {
        return prev.map(a => 
          a.fund_id === fundId ? { ...a, allocation_percentage: percentage } : a
        );
      } else {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            user_id: userId,
            goal_id: goals[0]?.id || '',
            fund_id: fundId,
            allocation_percentage: percentage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }
    });
  };

  const getTotalAllocation = () => {
    return allocations.reduce((sum, allocation) => sum + (allocation.allocation_percentage || 0), 0);
  };

  const sendWelcomeEmail = async () => {
    setSendingEmail(true);
    try {
      // In a real application, you would integrate with an email service
      // For this demo, we'll just simulate the email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubmit = () => {
    if (getTotalAllocation() !== 100) {
      alert('Total allocation must equal 100%');
      return;
    }
    
    onSubmit({ allocations, emailSent });
  };

  const getChartData = () => {
    return recommendedFunds.map((fund, index) => ({
      name: fund.scheme_name,
      value: 100 / recommendedFunds.length,
      expectedReturn: fund.expected_return,
      color: COLORS[index % COLORS.length]
    }));
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalized Recommendations</h2>
        <p className="text-gray-600">Based on your risk profile and goals</p>
      </div>

      <div className="space-y-8">
        {/* Risk Profile Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Risk Profile</p>
              <p className="font-medium text-purple-600">{riskProfile}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Investment Goals</p>
              <p className="font-medium text-blue-600">{goals.length} goals</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Recommended Funds</p>
              <p className="font-medium text-green-600">{recommendedFunds.length} funds</p>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Portfolio Allocation</h3>
          
          {recommendedFunds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={getChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                    >
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#000000'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total Allocation</span>
                    <span className={getTotalAllocation() === 100 ? 'text-green-600' : 'text-red-600'}>
                      {getTotalAllocation()}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getTotalAllocation() === 100 ? 'bg-green-600' : 
                        getTotalAllocation() > 100 ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, getTotalAllocation())}%` }}
                    ></div>
                  </div>
                </div>
                
                {recommendedFunds.map((fund) => {
                  const allocation = allocations.find(a => a.fund_id === fund.id);
                  return (
                    <div key={fund.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{fund.scheme_name}</h4>
                          <p className="text-sm text-gray-600">{fund.fund_house}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          fund.risk_level === 'low' ? 'bg-blue-100 text-blue-800' :
                          fund.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {fund.risk_level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expected Return: {fund.expected_return}%</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={allocation?.allocation_percentage || 0}
                            onChange={(e) => handleAllocate(fund.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations yet</h3>
              <p className="mt-1 text-sm text-gray-500">Please complete your risk profiling to get personalized recommendations.</p>
            </div>
          )}
        </div>

        {/* Welcome Email */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome Email</h3>
          <p className="text-gray-600 mb-4">
            We'll send you a welcome email with your personalized investment recommendations and next steps.
          </p>
          
          {emailSent ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Welcome email sent successfully!</span>
            </div>
          ) : (
            <button
              onClick={sendWelcomeEmail}
              disabled={sendingEmail}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendingEmail ? 'Sending...' : 'Send Welcome Email'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || getTotalAllocation() !== 100}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Completing...' : 'Complete Onboarding'}
        </button>
      </div>
    </div>
  );
}