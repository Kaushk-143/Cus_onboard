import { useState, useEffect } from 'react';
import { InvestmentGoal } from '../../../lib/supabase';
import { TrendingUp, Calendar, PiggyBank, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InvestmentGoalsStepProps {
  initialData: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
  loading: boolean;
  userId: string;
}

export function InvestmentGoalsStep({ initialData, onSubmit, onBack, loading, userId }: InvestmentGoalsStepProps) {
  const [goals, setGoals] = useState<InvestmentGoal[]>(initialData?.goals || []);
  const [currentGoal, setCurrentGoal] = useState<Partial<InvestmentGoal>>({
    goal_name: '',
    goal_type: 'retirement',
    target_amount: 0,
    target_date: '',
    current_savings: 0,
    expected_return_rate: 12.0
  });
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  const goalTypes = [
    { id: 'retirement', name: 'Retirement Planning' },
    { id: 'child_education', name: 'Child Education' },
    { id: 'house', name: 'House Purchase' },
    { id: 'wedding', name: 'Wedding Planning' },
    { id: 'emergency', name: 'Emergency Fund' },
    { id: 'other', name: 'Other Goal' }
  ];

  useEffect(() => {
    if (currentGoal.target_amount && currentGoal.target_date && currentGoal.current_savings !== undefined) {
      calculateSip();
    }
  }, [currentGoal]);

  const calculateSip = () => {
    if (!currentGoal.target_amount || !currentGoal.target_date || currentGoal.current_savings === undefined) return;

    const targetDate = new Date(currentGoal.target_date);
    const currentDate = new Date();
    const monthsDiff = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                      (targetDate.getMonth() - currentDate.getMonth());
    
    if (monthsDiff <= 0) return;

    const rate = (currentGoal.expected_return_rate || 12) / 100 / 12;
    const futureValueOfCurrentSavings = (currentGoal.current_savings || 0) * Math.pow(1 + rate, monthsDiff);
    const remainingAmount = (currentGoal.target_amount || 0) - futureValueOfCurrentSavings;
    
    if (remainingAmount <= 0) {
      setMonthlyContribution(0);
      generateChartData(0, monthsDiff);
      return;
    }

    const sip = (remainingAmount * rate) / (Math.pow(1 + rate, monthsDiff) - 1);
    setMonthlyContribution(Math.max(0, Math.round(sip)));
    generateChartData(sip, monthsDiff);
  };

  const generateChartData = (sip: number, months: number) => {
    const data = [];
    const currentSavings = currentGoal.current_savings || 0;
    const rate = (currentGoal.expected_return_rate || 12) / 100 / 12;
    
    let currentValue = currentSavings;
    
    for (let i = 0; i <= months; i += Math.max(1, Math.floor(months / 12))) {
      if (i > 0) {
        currentValue = currentValue * (1 + rate) + sip;
      }
      data.push({
        month: i,
        value: Math.round(currentValue)
      });
    }
    
    setChartData(data);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setCurrentGoal(prev => ({ ...prev, [field]: value }));
  };

  const addGoal = () => {
    if (!currentGoal.goal_name || !currentGoal.target_amount || !currentGoal.target_date) return;
    
    const newGoal: InvestmentGoal = {
      id: Date.now().toString(),
      user_id: userId,
      goal_name: currentGoal.goal_name || '',
      goal_type: currentGoal.goal_type || 'other',
      target_amount: currentGoal.target_amount || 0,
      target_date: currentGoal.target_date || '',
      monthly_contribution: monthlyContribution,
      current_savings: currentGoal.current_savings || 0,
      expected_return_rate: currentGoal.expected_return_rate || 12.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setGoals(prev => [...prev, newGoal]);
    setCurrentGoal({
      goal_name: '',
      goal_type: 'retirement',
      target_amount: 0,
      target_date: '',
      current_savings: 0,
      expected_return_rate: 12.0
    });
    setMonthlyContribution(0);
    setChartData([]);
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const handleSubmit = () => {
    onSubmit({ goals });
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Goals Setup</h2>
        <p className="text-gray-600">Set your financial goals and calculate how to achieve them</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('form')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'form'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add New Goal
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Your Goals ({goals.length})
          </button>
        </nav>
      </div>

      {activeTab === 'form' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name *
              </label>
              <input
                type="text"
                value={currentGoal.goal_name || ''}
                onChange={(e) => handleInputChange('goal_name', e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="e.g., Child's Education, Retirement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Type
              </label>
              <select
                value={currentGoal.goal_type || 'other'}
                onChange={(e) => handleInputChange('goal_type', e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                {goalTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  value={currentGoal.target_amount || ''}
                  onChange={(e) => handleInputChange('target_amount', parseFloat(e.target.value) || 0)}
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="1000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={currentGoal.target_date || ''}
                  onChange={(e) => handleInputChange('target_date', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Savings (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  value={currentGoal.current_savings || ''}
                  onChange={(e) => handleInputChange('current_savings', parseFloat(e.target.value) || 0)}
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="500000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Annual Return (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={currentGoal.expected_return_rate || ''}
                  onChange={(e) => handleInputChange('expected_return_rate', parseFloat(e.target.value) || 12)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="12"
                  min="1"
                  max="30"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {currentGoal.target_amount && currentGoal.target_date && (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SIP Calculator</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">₹{monthlyContribution.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly Investment</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{(currentGoal.target_amount || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Target Amount</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentGoal.target_date ? Math.floor((new Date(currentGoal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0} months
                  </div>
                  <div className="text-sm text-gray-600">Time Horizon</div>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          <button
            onClick={addGoal}
            disabled={!currentGoal.goal_name || !currentGoal.target_amount || !currentGoal.target_date}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <PiggyBank className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No goals yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first investment goal.</p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveTab('form')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Add Goal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{goal.goal_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{goal.goal_type.replace('_', ' ')}</p>
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Target Amount</p>
                      <p className="font-medium">₹{goal.target_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target Date</p>
                      <p className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly SIP</p>
                      <p className="font-medium">₹{(goal.monthly_contribution || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time Horizon</p>
                      <p className="font-medium">
                        {Math.floor((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={goals.length === 0 || loading}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}