# Authentication Setup Instructions

## Issues Found and Fixed

### 1. Environment Variables
- Updated `.env` file with your correct Supabase credentials

### 2. Missing Database Data
- Onboarding steps and risk profiling questions were not populated
- Created SQL script to seed the database

### 3. RLS Policy Issues
- Notification policies were blocking inserts
- Fixed policies to allow proper authentication flow

### 4. Email Confirmation Issue
- Supabase project has email confirmation enabled which can cause "invalid email" errors
- Updated signup flow to be more resilient

## Required Setup Steps

### Step 1: Disable Email Confirmation (IMPORTANT)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pqcyefbhrstspzdnvpra
2. Navigate to: **Authentication** → **Providers** → **Email**
3. Find the setting **"Confirm email"** and **DISABLE** it
4. Click **Save**

This is required because the app doesn't have email confirmation flow implemented yet.

### Step 2: Run the SQL Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pqcyefbhrstspzdnvpra
2. Navigate to: **SQL Editor**
3. Click **"New query"**
4. Copy and paste the entire contents of `fix-rls-and-seed.sql` file
5. Click **Run** or press Ctrl+Enter

This will:
- Populate onboarding steps (5 steps)
- Populate risk profiling questions (8 questions)
- Populate risk options for each question
- Fix RLS policies for notifications
- Add necessary database constraints

### Step 3: Verify Setup

After running the SQL script, you should see:
- 5 onboarding steps in the `onboarding_steps` table
- 8 risk questions in the `risk_questions` table
- 32 risk options in the `risk_options` table
- 22 mutual funds in the `mutual_funds` table

### Step 4: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Try signing up with a new account:
   - Email: your-email@example.com (use a real email format)
   - Password: Choose a strong password (min 6 characters)
   - Full Name: Your Name

4. After successful signup, you should:
   - Be automatically logged in
   - See the onboarding wizard
   - Be able to complete all onboarding steps

## Common Issues and Solutions

### Issue: "Email address is invalid"
**Solution**: Make sure you disabled email confirmation in Step 1 above.

### Issue: "No onboarding steps found"
**Solution**: Run the SQL script from Step 2 above.

### Issue: Profile creation fails
**Solution**: Check that RLS policies are correctly set up by running the SQL script.

### Issue: Welcome notification not sent
**Solution**: This is a minor issue and won't block the auth flow. The notification policy fix in the SQL script should resolve it.

## Auth Flow Overview

1. **Sign Up**:
   - User enters email, password, and full name
   - Account is created in Supabase Auth
   - Profile is automatically created in `profiles` table
   - User is redirected to onboarding wizard

2. **Sign In**:
   - User enters email and password
   - Session is created
   - Profile is fetched from database
   - User is redirected to dashboard (if onboarding complete) or onboarding wizard

3. **Onboarding**:
   - User completes 5 steps:
     1. Personal Info & OTP Verification
     2. KYC Documentation
     3. Risk Profiling
     4. Investment Goals
     5. Personalized Recommendations
   - Progress is saved after each step
   - User can resume from where they left off

## Project Structure

```
src/
├── hooks/
│   └── useAuth.tsx          # Authentication logic and context
├── components/
│   ├── Auth/
│   │   └── AuthForm.tsx     # Login/signup form
│   ├── Onboarding/
│   │   ├── OnboardingWizard.tsx  # Main onboarding flow
│   │   ├── ProgressBar.tsx       # Progress indicator
│   │   └── steps/                # Individual onboarding steps
│   └── Dashboard/
│       └── Dashboard.tsx    # Post-onboarding dashboard
├── lib/
│   └── supabase.ts          # Supabase client configuration
└── App.tsx                   # Main app component
```

## Database Tables

- `profiles` - User profile information
- `onboarding_steps` - Configuration for onboarding steps
- `onboarding_progress` - User progress through onboarding
- `risk_questions` - Risk profiling questionnaire
- `risk_options` - Options for each risk question
- `risk_responses` - User responses to risk questions
- `investment_goals` - User investment goals
- `mutual_funds` - Available mutual fund schemes
- `fund_allocations` - User fund allocations
- `kyc_documents` - KYC document uploads
- `otp_verifications` - OTP verification records
- `notifications` - System notifications

## Need Help?

If you encounter any issues:

1. Check the browser console for detailed error messages
2. Verify that all setup steps were completed
3. Check Supabase logs in the dashboard
4. Ensure your environment variables are correct in `.env`

## Security Notes

- RLS (Row Level Security) is enabled on all tables
- Users can only access their own data
- Auth policies ensure proper access control
- Sensitive data is properly protected

## Next Steps

After authentication is working:

1. Implement file upload for KYC documents
2. Set up OTP verification service (Twilio, etc.)
3. Add email notification service
4. Implement actual investment recommendations logic
5. Add more detailed error handling and user feedback
