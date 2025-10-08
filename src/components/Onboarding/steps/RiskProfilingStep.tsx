import { useState, useEffect } from 'react';
import { supabase, RiskQuestion, RiskOption } from '../../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';

interface RiskProfilingStepProps {
  initialData: Record<string, unknown> | undefined;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
  loading: boolean;
}

export function RiskProfilingStep({ initialData, onSubmit, onBack, loading }: RiskProfilingStepProps) {
  const [questions, setQuestions] = useState<RiskQuestion[]>([]);
  const [options, setOptions] = useState<RiskOption[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>(initialData?.responses as Record<string, string> || {});
  const [score, setScore] = useState(typeof initialData?.score === 'number' ? initialData.score : 0);
  const [riskProfile, setRiskProfile] = useState(typeof initialData?.riskProfile === 'string' ? initialData.riskProfile : '');
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    fetchRiskQuestions();
  }, []);

  const fetchRiskQuestions = async () => {
    try {
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('risk_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_sequence');

      if (questionsError) throw questionsError;

      // Fetch options
      const { data: optionsData, error: optionsError } = await supabase
        .from('risk_options')
        .select('*');

      if (optionsError) throw optionsError;

      setQuestions(questionsData || []);
      setOptions(optionsData || []);
    } catch (error) {
      console.error('Error fetching risk questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setResponses(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    const selectedOptions: RiskOption[] = [];

    Object.values(responses).forEach(optionId => {
      const option = options.find(opt => opt.id === optionId);
      if (option) {
        totalScore += option.score;
        selectedOptions.push(option);
      }
    });

    setScore(totalScore);

    // Determine risk profile based on score
    if (totalScore <= 8) {
      setRiskProfile('Conservative');
    } else if (totalScore <= 16) {
      setRiskProfile('Moderate');
    } else {
      setRiskProfile('Aggressive');
    }

    return { totalScore, selectedOptions };
  };

  const handleSubmit = () => {
    const { totalScore, selectedOptions } = calculateScore();
    onSubmit({
      responses,
      score: totalScore,
      riskProfile,
      selectedOptions
    });
  };

  const getOptionsForQuestion = (questionId: string) => {
    return options.filter(option => option.question_id === questionId);
  };

  const getRiskProfileColor = () => {
    switch (riskProfile) {
      case 'Conservative': return 'bg-blue-100 text-blue-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Aggressive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChartData = () => {
    return [
      { name: 'Conservative', score: 0, fullMark: 24 },
      { name: 'Moderate', score: 0, fullMark: 24 },
      { name: 'Aggressive', score: 0, fullMark: 24 }
    ].map(profile => {
      if (profile.name === riskProfile) {
        return { ...profile, score };
      }
      return profile;
    });
  };

  if (loadingQuestions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Risk Profiling</h2>
        <p className="text-gray-600">Answer a few questions to help us understand your risk tolerance</p>
      </div>

      {riskProfile && (
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Your Risk Profile</h3>
              <p className="text-gray-600">Based on your responses</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskProfileColor()}`}>
              {riskProfile}
            </span>
          </div>
          
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 24]} />
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question_text}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getOptionsForQuestion(question.id).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(question.id, option.id)}
                  className={`p-4 text-left rounded-lg border transition-all ${
                    responses[question.id] === option.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                      responses[question.id] === option.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {responses[question.id] === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{option.option_text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
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
          disabled={Object.keys(responses).length !== questions.length || loading}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}