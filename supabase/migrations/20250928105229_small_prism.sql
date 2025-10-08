/*
  # Customer Onboarding System Schema

  1. New Tables
    - `profiles` - Extended user profiles with personal information
    - `onboarding_steps` - Individual steps in the onboarding process
    - `onboarding_progress` - User progress tracking
    - `documents` - Document uploads and verification
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Admin policies for viewing all onboarding data

  3. Functions
    - Function to calculate onboarding completion percentage
    - Trigger to update progress automatically
*/

-- Profiles table for extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  company_name text,
  company_size text,
  industry text,
  job_title text,
  avatar_url text,
  onboarding_completed boolean DEFAULT false,
  onboarding_completion_percentage integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Onboarding steps configuration
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number integer NOT NULL,
  step_name text NOT NULL,
  step_description text,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User onboarding progress
CREATE TABLE IF NOT EXISTS onboarding_progress (
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

-- Document uploads
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  verification_status text DEFAULT 'pending',
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert default onboarding steps
INSERT INTO onboarding_steps (step_number, step_name, step_description, is_required) VALUES
  (1, 'Personal Information', 'Complete your personal profile information', true),
  (2, 'Company Details', 'Provide information about your company', true),
  (3, 'Document Verification', 'Upload required documents for verification', true),
  (4, 'Preferences Setup', 'Configure your account preferences', false),
  (5, 'Final Review', 'Review and confirm your onboarding information', true)
ON CONFLICT DO NOTHING;

-- Function to calculate completion percentage
CREATE OR REPLACE FUNCTION calculate_onboarding_completion(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_required_steps integer;
  completed_steps integer;
  completion_percentage integer;
BEGIN
  -- Get total required steps
  SELECT COUNT(*) INTO total_required_steps
  FROM onboarding_steps
  WHERE is_required = true;
  
  -- Get completed required steps for user
  SELECT COUNT(*) INTO completed_steps
  FROM onboarding_progress op
  JOIN onboarding_steps os ON op.step_id = os.id
  WHERE op.user_id = p_user_id
    AND op.completed = true
    AND os.is_required = true;
  
  -- Calculate percentage
  IF total_required_steps = 0 THEN
    completion_percentage := 0;
  ELSE
    completion_percentage := (completed_steps * 100) / total_required_steps;
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET 
    onboarding_completion_percentage = completion_percentage,
    onboarding_completed = (completion_percentage = 100),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN completion_percentage;
END;
$$;

-- Trigger to update completion percentage
CREATE OR REPLACE FUNCTION update_onboarding_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM calculate_onboarding_completion(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER onboarding_progress_updated
  AFTER INSERT OR UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_completion();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
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

-- Onboarding steps policies (read-only for users)
CREATE POLICY "Anyone can read onboarding steps"
  ON onboarding_steps
  FOR SELECT
  TO authenticated
  USING (true);

-- Onboarding progress policies
CREATE POLICY "Users can view own progress"
  ON onboarding_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON onboarding_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can manage own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
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