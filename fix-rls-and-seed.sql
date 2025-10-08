-- Fix RLS Policies and Seed Data
-- Run this SQL in your Supabase SQL Editor

-- First, temporarily disable RLS for seeding (we'll re-enable it after)
ALTER TABLE onboarding_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_options DISABLE ROW LEVEL SECURITY;

-- Insert onboarding steps
INSERT INTO onboarding_steps (step_number, step_name, step_description, is_required, is_active) VALUES
  (1, 'Welcome & Basic Details', 'OTP verification, demographics, experience, smooth progress indicators', true, true),
  (2, 'KYC Documentation', 'PAN, Aadhaar, Bank proof uploads with validation', true, true),
  (3, 'Financial Risk Profiling', 'Questionnaire, risk scoring, category assignment', true, true),
  (4, 'Investment Goals Setup', 'Goal selection, SIP calculator, visual timeline', true, true),
  (5, 'Personalized Recommendations', 'Fund suggestions, allocation, welcome email', true, true)
ON CONFLICT (step_number) DO UPDATE SET
  step_name = EXCLUDED.step_name,
  step_description = EXCLUDED.step_description,
  is_required = EXCLUDED.is_required,
  is_active = EXCLUDED.is_active;

-- Insert risk profiling questions
INSERT INTO risk_questions (question_text, question_type, category, order_sequence, is_active) VALUES
  ('What is your age group?', 'single_choice', 'capacity', 1, true),
  ('What is your annual income range?', 'single_choice', 'capacity', 2, true),
  ('What is your investment experience?', 'single_choice', 'experience', 3, true),
  ('What is your primary investment objective?', 'single_choice', 'attitude', 4, true),
  ('How would you react if your investment loses 10% of its value in a month?', 'single_choice', 'attitude', 5, true),
  ('What percentage of your monthly income can you invest?', 'single_choice', 'capacity', 6, true),
  ('How long do you plan to stay invested?', 'single_choice', 'attitude', 7, true),
  ('Which investment option would you prefer?', 'single_choice', 'knowledge', 8, true)
ON CONFLICT DO NOTHING;

-- Insert risk options for each question
-- Age group options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Below 30 years', 3 FROM risk_questions WHERE question_text = 'What is your age group?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '30-45 years', 2 FROM risk_questions WHERE question_text = 'What is your age group?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '46-60 years', 1 FROM risk_questions WHERE question_text = 'What is your age group?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Above 60 years', 0 FROM risk_questions WHERE question_text = 'What is your age group?'
ON CONFLICT DO NOTHING;

-- Annual income options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Below ₹5 lakhs', 0 FROM risk_questions WHERE question_text = 'What is your annual income range?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '₹5-10 lakhs', 1 FROM risk_questions WHERE question_text = 'What is your annual income range?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '₹10-20 lakhs', 2 FROM risk_questions WHERE question_text = 'What is your annual income range?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Above ₹20 lakhs', 3 FROM risk_questions WHERE question_text = 'What is your annual income range?'
ON CONFLICT DO NOTHING;

-- Investment experience options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'No experience', 0 FROM risk_questions WHERE question_text = 'What is your investment experience?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Less than 1 year', 1 FROM risk_questions WHERE question_text = 'What is your investment experience?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '1-3 years', 2 FROM risk_questions WHERE question_text = 'What is your investment experience?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'More than 3 years', 3 FROM risk_questions WHERE question_text = 'What is your investment experience?'
ON CONFLICT DO NOTHING;

-- Investment objective options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Capital preservation', 0 FROM risk_questions WHERE question_text = 'What is your primary investment objective?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Steady income', 1 FROM risk_questions WHERE question_text = 'What is your primary investment objective?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Moderate growth', 2 FROM risk_questions WHERE question_text = 'What is your primary investment objective?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'High growth', 3 FROM risk_questions WHERE question_text = 'What is your primary investment objective?'
ON CONFLICT DO NOTHING;

-- Reaction to loss options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Sell all investments immediately', 0 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Sell some investments', 1 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Hold all investments', 2 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Buy more investments', 3 FROM risk_questions WHERE question_text = 'How would you react if your investment loses 10% of its value in a month?'
ON CONFLICT DO NOTHING;

-- Investment percentage options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Less than 10%', 0 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '10-20%', 1 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '20-30%', 2 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'More than 30%', 3 FROM risk_questions WHERE question_text = 'What percentage of your monthly income can you invest?'
ON CONFLICT DO NOTHING;

-- Investment duration options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Less than 1 year', 0 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '1-3 years', 1 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, '3-7 years', 2 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'More than 7 years', 3 FROM risk_questions WHERE question_text = 'How long do you plan to stay invested?'
ON CONFLICT DO NOTHING;

-- Investment preference options
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Fixed deposits', 0 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Government bonds', 1 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Mutual funds', 2 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?'
ON CONFLICT DO NOTHING;
INSERT INTO risk_options (question_id, option_text, score)
SELECT id, 'Stocks', 3 FROM risk_questions WHERE question_text = 'Which investment option would you prefer?'
ON CONFLICT DO NOTHING;

-- Re-enable RLS
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_options ENABLE ROW LEVEL SECURITY;

-- Add unique constraint for onboarding_steps.step_number if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'onboarding_steps_step_number_key'
  ) THEN
    ALTER TABLE onboarding_steps ADD CONSTRAINT onboarding_steps_step_number_key UNIQUE (step_number);
  END IF;
END $$;

-- Fix notifications policy to allow INSERT
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also allow system to insert notifications (for welcome messages during signup)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

SELECT 'Setup complete! You can now test the application.' as status;
