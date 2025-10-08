# Indian Investment Onboarding System

## Overview

This is a complete customer onboarding system for an Indian investment platform that takes users from registration to being ready to start their wealth journey in under 10 minutes.

## Environment Variables

Before running the application, you need to set up the following environment variables in a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can copy the `.env.example` file to `.env` and replace the placeholder values with your actual Supabase credentials.

## Features Implemented

### 1. Multi-step Onboarding Wizard
- Welcome & Basic Details (OTP verification)
- KYC Documentation (PAN, Aadhaar, Bank proofs)
- Financial Risk Profiling (Questionnaire with scoring)
- Investment Goals Setup (SIP calculator, visual timeline)
- Personalized Recommendations (Fund suggestions, allocation)

### 2. Database Schema
The system uses a PostgreSQL database with the following tables:
- `profiles` - User profiles with Indian investment context
- `risk_questions` - Risk profiling questionnaire
- `risk_options` - Options for risk questions
- `risk_responses` - User responses to risk questions
- `investment_goals` - User investment goals
- `mutual_funds` - Mutual fund schemes
- `fund_allocations` - User fund allocations
- `kyc_documents` - KYC document storage references
- `otp_verifications` - OTP verification system
- `onboarding_steps` - Onboarding process steps
- `onboarding_progress` - User onboarding progress tracking
- `notifications` - System notifications

### 3. Risk Profiling
- 8-question risk assessment tailored for Indian investors
- Scoring algorithm to determine risk profile (Conservative, Moderate, Aggressive)
- Visual risk profile display with charts

### 4. Investment Goals
- Goal selection with templates for Indian families
- SIP calculator with visual timeline
- Support for multiple goal types (retirement, education, house, etc.)

### 5. Document Verification
- PAN card upload
- Aadhaar card (front and back) upload
- Bank statement upload
- Photo and signature upload

### 6. Personalized Recommendations
- Mutual fund suggestions based on risk profile
- Portfolio allocation recommendations
- Welcome email simulation

### 7. OTP Verification
- Phone and email OTP verification
- Expiration and verification tracking

## Technical Implementation

### Frontend
- React with TypeScript
- Context API for state management
- Responsive design with Tailwind CSS
- Recharts for data visualization
- Lucide React for icons

### Backend
- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Serverless functions for business logic

### Database
- PostgreSQL with Row Level Security
- Proper data modeling for Indian financial context
- Triggers for automatic progress calculation

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Onboarding
- `GET /onboarding/steps` - Get onboarding steps
- `POST /onboarding/progress` - Update onboarding progress
- `GET /onboarding/status` - Get onboarding status

### Risk Profiling
- `GET /risk/questions` - Get risk profiling questions
- `POST /risk/responses` - Save risk responses
- `GET /risk/profile` - Get user risk profile

### Investment Goals
- `GET /goals` - Get user investment goals
- `POST /goals` - Create investment goal
- `PUT /goals/{id}` - Update investment goal
- `DELETE /goals/{id}` - Delete investment goal

### Documents
- `POST /documents/upload` - Upload KYC document
- `GET /documents/{id}` - Get document details
- `PUT /documents/{id}/verify` - Verify document

### Recommendations
- `GET /funds` - Get mutual fund recommendations
- `POST /allocations` - Save fund allocations

## Testing

### Unit Tests
- Component rendering tests
- Form validation tests
- State management tests

### Integration Tests
- Onboarding flow tests
- Risk profiling tests
- Investment goals tests

### End-to-End Tests
- Complete user journey tests
- Edge case scenario tests

## AI Tool Usage

### Component Generation
- Used AI to generate React components for each onboarding step
- Leveraged AI for form logic implementation
- Used AI to create responsive UI designs

### Test Data Generation
- Generated realistic Indian user profiles
- Created sample investment goals for Indian families
- Generated mutual fund data with Indian context

### Documentation
- Used AI to create this documentation
- Generated code comments and explanations
- Created user journey flowcharts

### Debugging
- Used AI tools to identify and fix complex user flows
- Optimized performance with AI suggestions
- Improved error handling with AI recommendations

## UX Decisions

### Mobile-First Design
- Implemented responsive design for mobile devices
- Optimized touch interactions
- Streamlined forms for mobile input

### Progressive Disclosure
- Showed one step at a time to reduce cognitive load
- Provided clear progress indicators
- Allowed users to navigate between steps

### Visual Feedback
- Used charts to visualize risk profiles
- Implemented progress bars for goal tracking
- Provided clear success/error messages

### Accessibility
- Implemented keyboard navigation
- Added ARIA labels for screen readers
- Ensured sufficient color contrast

## Compliance Considerations

### Indian Financial Services
- Designed for Indian investment behavior
- Included PAN and Aadhaar verification
- Added bank account verification
- Implemented risk profiling suitable for Indian investors

### Data Privacy
- Implemented Row Level Security
- Secured sensitive data
- Followed data protection best practices

## Deployment

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Build Process
```bash
npm install
npm run build
```

### Development
```bash
npm install
npm run dev
```

## Future Enhancements

### Advanced Features
- Auto-save progress with resume functionality
- Smart form pre-filling using existing data
- Onboarding analytics for drop-off tracking
- Email progress notifications
- Enhanced accessibility features

### Integration
- Actual file upload to cloud storage
- Real OTP sending via SMS/email services
- Integration with actual mutual fund APIs
- Payment gateway integration

### Security
- Enhanced document verification
- Two-factor authentication
- Advanced fraud detection