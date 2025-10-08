/*
  # Indian Investment Onboarding System Schema Update

  Adding tables and modifications for:
  1. Risk profiling with questionnaire and scoring
  2. Investment goals with calculators
  3. OTP verification system
  4. Indian-specific financial data
  5. Mutual fund schemes
  6. Enhanced KYC documentation
*/

-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS onboarding_progress CASCADE;
DROP TABLE IF EXISTS onboarding_steps CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- User profiles with Indian investment context
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  city text,
  state text,
  pincode text,
  pan_number text,
  aadhaar_number text,
  bank_account_number text,
  bank_ifsc_code text,
  employment_status text,
  annual_income numeric,
  investment_experience text,
  investment_objective text,
  risk_profile text, -- conservative, moderate, aggressive
  risk_score integer,
  onboarding_completed boolean DEFAULT false,
  onboarding_completion_percentage integer DEFAULT 0,
  last_active_step integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Risk profiling questions
CREATE TABLE risk_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL, -- single_choice, multiple_choice, scale
  category text, -- knowledge, experience, attitude, capacity
  is_active boolean DEFAULT true,
  order_sequence integer,
  created_at timestamptz DEFAULT now()
);

-- Risk profiling options
CREATE TABLE risk_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES risk_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User risk profiling responses
CREATE TABLE risk_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES risk_questions(id) ON DELETE CASCADE,
  option_ids uuid[], -- For multiple choice questions
  score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Investment goals
CREATE TABLE investment_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name text NOT NULL,
  goal_type text, -- retirement, child_education, house, wedding, emergency, other
  target_amount numeric NOT NULL,
  target_date date NOT NULL,
  monthly_contribution numeric,
  current_savings numeric DEFAULT 0,
  expected_return_rate numeric DEFAULT 12.0, -- Default expected return for SIP calculator
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mutual fund schemes
CREATE TABLE mutual_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name text NOT NULL,
  fund_house text NOT NULL,
  category text NOT NULL, -- equity, debt, hybrid, elss, liquid
  risk_level text, -- low, moderate, high
  expected_return numeric, -- Annual expected return percentage
  aum numeric, -- Assets under management
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User fund allocations
CREATE TABLE fund_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES investment_goals(id) ON DELETE CASCADE,
  fund_id uuid REFERENCES mutual_funds(id) ON DELETE CASCADE,
  allocation_percentage numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- KYC documents with Indian context
CREATE TABLE kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- pan, aadhaar_front, aadhaar_back, bank_statement, photo, signature
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  verification_status text DEFAULT 'pending', -- pending, verified, rejected
  rejection_reason text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OTP verification
CREATE TABLE otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  email text,
  otp_code text NOT NULL,
  otp_type text NOT NULL, -- phone, email
  expires_at timestamptz NOT NULL,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Onboarding steps for Indian investment context
CREATE TABLE onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number integer NOT NULL,
  step_name text NOT NULL,
  step_description text,
  is_required boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User onboarding progress
CREATE TABLE onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id uuid REFERENCES onboarding_steps(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info', -- info, success, warning, error
  category text DEFAULT 'onboarding', -- onboarding, investment, account, system
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert onboarding steps for Indian investment context
INSERT INTO onboarding_steps (step_number, step_name, step_description, is_required) VALUES
  (1, 'Welcome & Basic Details', 'OTP verification, demographics, experience, smooth progress indicators', true),
  (2, 'KYC Documentation', 'PAN, Aadhaar, Bank proof uploads with validation', true),
  (3, 'Financial Risk Profiling', 'Questionnaire, risk scoring, category assignment', true),
  (4, 'Investment Goals Setup', 'Goal selection, SIP calculator, visual timeline', true),
  (5, 'Personalized Recommendations', 'Fund suggestions, allocation, welcome email', true)
ON CONFLICT DO NOTHING;

-- Insert risk profiling questions for Indian context
INSERT INTO risk_questions (question_text, question_type, category, order_sequence) VALUES
  ('What is your age group?', 'single_choice', 'capacity', 1),
  ('What is your annual income range?', 'single_choice', 'capacity', 2),
  ('What is your investment experience?', 'single_choice', 'experience', 3),
  ('What is your primary investment objective?', 'single_choice', 'attitude', 4),
  ('How would you react if your investment loses 10% of its value in a month?', 'single_choice', 'attitude', 5),
  ('What percentage of your monthly income can you invest?', 'single_choice', 'capacity', 6),
  ('How long do you plan to stay invested?', 'single_choice', 'attitude', 7),
  ('Which investment option would you prefer?', 'single_choice', 'knowledge', 8);

-- Insert risk options for each question
-- Age group options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Below 30 years', 3 FROM risk_questions WHERE question_text = 'What is your age group?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '30-45 years', 2 FROM risk_questions WHERE question_text = 'What is your age group?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '46-60 years', 1 FROM risk_questions WHERE question_text = 'What is your age group?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Above 60 years', 0 FROM risk_questions WHERE question_text = 'What is your age group?';

-- Annual income options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Below ₹5 lakhs', 0 FROM risk_questions WHERE question_text = 'What is your annual income range?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '₹5-10 lakhs', 1 FROM risk_questions WHERE question_text = 'What is your annual income range?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '₹10-20 lakhs', 2 FROM risk_questions WHERE question_text = 'What is your annual income range?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Above ₹20 lakhs', 3 FROM risk_questions WHERE question_text = 'What is your annual income range?';

-- Investment experience options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'No experience', 0 FROM risk_questions WHERE question_text = 'What is your investment experience?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Less than 1 year', 1 FROM risk_questions WHERE question_text = 'What is your investment experience?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '1-3 years', 2 FROM risk_questions WHERE question_text = 'What is your investment experience?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'More than 3 years', 3 FROM risk_questions WHERE question_text = 'What is your investment experience?';

-- Investment objective options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Capital preservation', 0 FROM risk_questions WHERE question_text = 'What is your primary investment objective?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Steady income', 1 FROM risk_questions WHERE question_text = 'What is your primary investment objective?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Moderate growth', 2 FROM risk_questions WHERE question_text = 'What is your primary investment objective?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'High growth', 3 FROM risk_questions WHERE question_text = 'What is your primary investment objective?';

-- Reaction to loss options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Sell all investments immediately', 0 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Sell some investments', 1 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Hold all investments', 2 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Buy more investments', 3 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?';

-- Investment percentage options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Less than 10%', 0 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '10-20%', 1 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '20-30%', 2 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'More than 30%', 3 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?';

-- Investment duration options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Less than 1 year', 0 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '1-3 years', 1 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, '3-7 years', 2 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'More than 7 years', 3 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?';

-- Investment preference options
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Fixed deposits', 0 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Government bonds', 1 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Mutual funds', 2 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?';
INSERT INTO risk_options (question_id, option_text, score) 
SELECT id, 'Stocks', 3 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?';

-- Insert popular mutual fund schemes for Indian families
INSERT INTO mutual_funds (scheme_name, fund_house, category, risk_level, expected_return) VALUES
  ('HDFC Top 100 Fund', 'HDFC Mutual Fund', 'equity', 'high', 12.5),
  ('ICICI Pru Bluechip Fund', 'ICICI Prudential', 'equity', 'high', 12.0),
  ('Axis Bluechip Fund', 'Axis Mutual Fund', 'equity', 'high', 13.0),
  ('Mirae Asset Large Cap Fund', 'Mirae Asset', 'equity', 'high', 12.8),
  ('Parag Parikh Flexi Cap Fund', 'Parag Parikh', 'equity', 'high', 13.5),
  ('HDFC Hybrid Equity Fund', 'HDFC Mutual Fund', 'hybrid', 'moderate', 10.5),
  ('ICICI Pru Balanced Advantage Fund', 'ICICI Prudential', 'hybrid', 'moderate', 10.0),
  ('Axis Balanced Advantage Fund', 'Axis Mutual Fund', 'hybrid', 'moderate', 11.0),
  ('HDFC Short Term Debt Fund', 'HDFC Mutual Fund', 'debt', 'low', 7.0),
  ('ICICI Pru Short Term Fund', 'ICICI Prudential', 'debt', 'low', 6.8),
  ('Axis Ultra Short Term Fund', 'Axis Mutual Fund', 'debt', 'low', 7.2),
  ('HDFC TaxSaver Fund', 'HDFC Mutual Fund', 'elss', 'high', 14.0),
  ('ICICI Pru Long Term Equity Fund', 'ICICI Prudential', 'elss', 'high', 13.8),
  ('Axis Long Term Equity Fund', 'Axis Mutual Fund', 'elss', 'high', 14.2),
  ('SBI Magnum Children Benefit Fund', 'SBI Mutual Fund', 'equity', 'high', 12.2),
  ('Kotak Emerging Equity Fund', 'Kotak Mahindra', 'equity', 'high', 12.7),
  ('Franklin India Bluechip Fund', 'Franklin Templeton', 'equity', 'high', 11.8),
  ('Nippon India Large Cap Fund', 'Nippon India', 'equity', 'high', 12.3),
  ('Aditya Birla Sun Life Frontline Equity Fund', 'Aditya Birla', 'equity', 'high', 12.1),
  ('Tata Digital India Fund', 'Tata Mutual Fund', 'equity', 'high', 13.2),
  ('Quantum Long Term Equity Fund', 'Quantum Mutual Fund', 'equity', 'high', 12.9),
  ('Motilal Oswal Nasdaq 100 Fund', 'Motilal Oswal', 'equity', 'high', 15.0);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutual_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Risk questions policies (read-only for users)
CREATE POLICY "Anyone can read risk questions"
  ON risk_questions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Risk options policies (read-only for users)
CREATE POLICY "Anyone can read risk options"
  ON risk_options
  FOR SELECT
  TO authenticated
  USING (true);

-- Risk responses policies
CREATE POLICY "Users can manage own risk responses"
  ON risk_responses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Investment goals policies
CREATE POLICY "Users can manage own investment goals"
  ON investment_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mutual funds policies (read-only for users)
CREATE POLICY "Anyone can read mutual funds"
  ON mutual_funds
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Fund allocations policies
CREATE POLICY "Users can manage own fund allocations"
  ON fund_allocations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- KYC documents policies
CREATE POLICY "Users can manage own kyc documents"
  ON kyc_documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- OTP verifications policies
CREATE POLICY "Users can manage own otp verifications"
  ON otp_verifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Onboarding steps policies (read-only for users)
CREATE POLICY "Anyone can read onboarding steps"
  ON onboarding_steps
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Onboarding progress policies
CREATE POLICY "Users can manage own progress"
  ON onboarding_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);