# Test Cases

## Overview

This document outlines the test cases for the Indian Investment Onboarding System, covering happy path scenarios, edge cases, and error conditions.

## Test Environment

- **Frontend**: React with TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Testing Framework**: Jest with React Testing Library
- **Browser**: Chrome, Firefox, Safari, Edge

## Test Categories

### 1. Authentication Tests

#### Happy Path
1. **User Registration**
   - Input: Valid email, password, and full name
   - Expected: User account created, profile initialized, welcome notification sent
   - Test ID: AUTH-001

2. **User Login**
   - Input: Valid email and password
   - Expected: User authenticated, session created, redirected to onboarding/dashboard
   - Test ID: AUTH-002

3. **User Logout**
   - Input: Authenticated user clicks logout
   - Expected: Session destroyed, redirected to login page
   - Test ID: AUTH-003

#### Edge Cases
1. **Invalid Email Format**
   - Input: Invalid email format during registration
   - Expected: Validation error displayed
   - Test ID: AUTH-004

2. **Weak Password**
   - Input: Password with less than 6 characters
   - Expected: Validation error displayed
   - Test ID: AUTH-005

3. **Duplicate Email**
   - Input: Email already registered
   - Expected: Error message about existing account
   - Test ID: AUTH-006

4. **Incorrect Login Credentials**
   - Input: Wrong email or password
   - Expected: Authentication error displayed
   - Test ID: AUTH-007

### 2. OTP Verification Tests

#### Happy Path
1. **Phone OTP Request**
   - Input: Valid Indian phone number
   - Expected: OTP sent via SMS, verification screen displayed
   - Test ID: OTP-001

2. **Email OTP Request**
   - Input: Valid email address
   - Expected: OTP sent via email, verification screen displayed
   - Test ID: OTP-002

3. **OTP Verification**
   - Input: Correct 6-digit OTP
   - Expected: Verification successful, proceed to next step
   - Test ID: OTP-003

#### Edge Cases
1. **Invalid Phone Number**
   - Input: Non-Indian or invalid phone number format
   - Expected: Validation error displayed
   - Test ID: OTP-004

2. **Expired OTP**
   - Input: OTP older than 10 minutes
   - Expected: Expired OTP error, option to resend
   - Test ID: OTP-005

3. **Incorrect OTP**
   - Input: Wrong OTP code
   - Expected: Invalid OTP error, 3 attempts allowed
   - Test ID: OTP-006

4. **OTP Resend**
   - Input: Click resend OTP button
   - Expected: New OTP generated and sent
   - Test ID: OTP-007

### 3. KYC Documentation Tests

#### Happy Path
1. **PAN Card Upload**
   - Input: Clear image of PAN card
   - Expected: File uploaded, preview displayed, proceed enabled
   - Test ID: KYC-001

2. **Aadhaar Card Upload**
   - Input: Clear images of both sides of Aadhaar card
   - Expected: Files uploaded, previews displayed, proceed enabled
   - Test ID: KYC-002

3. **Bank Statement Upload**
   - Input: Clear image of bank statement (last 3 months)
   - Expected: File uploaded, preview displayed, proceed enabled
   - Test ID: KYC-003

4. **Photo and Signature Upload**
   - Input: Clear images of passport photo and signature
   - Expected: Files uploaded, previews displayed, proceed enabled
   - Test ID: KYC-004

#### Edge Cases
1. **Invalid File Type**
   - Input: Document in unsupported format (e.g., .txt)
   - Expected: Error message, file rejected
   - Test ID: KYC-005

2. **Large File Size**
   - Input: Document larger than 10MB
   - Expected: Error message, file rejected
   - Test ID: KYC-006

3. **Blurry Document**
   - Input: Low-quality document image
   - Expected: Warning message, option to re-upload
   - Test ID: KYC-007

4. **Missing Required Documents**
   - Input: Proceed without uploading all required documents
   - Expected: Error message, highlighting missing documents
   - Test ID: KYC-008

### 4. Risk Profiling Tests

#### Happy Path
1. **Complete Risk Questionnaire**
   - Input: Answer all 8 questions
   - Expected: Risk score calculated, risk profile assigned, proceed enabled
   - Test ID: RISK-001

2. **Conservative Profile Assignment**
   - Input: Answers resulting in score 0-8
   - Expected: Conservative risk profile assigned
   - Test ID: RISK-002

3. **Moderate Profile Assignment**
   - Input: Answers resulting in score 9-16
   - Expected: Moderate risk profile assigned
   - Test ID: RISK-003

4. **Aggressive Profile Assignment**
   - Input: Answers resulting in score 17-24
   - Expected: Aggressive risk profile assigned
   - Test ID: RISK-004

#### Edge Cases
1. **Incomplete Questionnaire**
   - Input: Proceed without answering all questions
   - Expected: Error message, highlighting unanswered questions
   - Test ID: RISK-005

2. **Inconsistent Answers**
   - Input: Contradictory answers (e.g., low risk tolerance but high return expectation)
   - Expected: Warning message, option to review answers
   - Test ID: RISK-006

3. **Question Navigation**
   - Input: Navigate between questions using progress indicators
   - Expected: Correct question displayed, previous answers preserved
   - Test ID: RISK-007

### 5. Investment Goals Tests

#### Happy Path
1. **Create Retirement Goal**
   - Input: Goal name "Retirement", target amount ₹1,00,00,000, target date 30 years from now
   - Expected: SIP calculated, goal saved, visual timeline displayed
   - Test ID: GOALS-001

2. **Create Child Education Goal**
   - Input: Goal name "Child Education", target amount ₹20,00,000, target date 15 years from now
   - Expected: SIP calculated, goal saved, visual timeline displayed
   - Test ID: GOALS-002

3. **Create House Purchase Goal**
   - Input: Goal name "House Purchase", target amount ₹50,00,000, target date 10 years from now
   - Expected: SIP calculated, goal saved, visual timeline displayed
   - Test ID: GOALS-003

4. **Multiple Goals**
   - Input: Create 3 different investment goals
   - Expected: All goals saved, displayed in goals list
   - Test ID: GOALS-004

#### Edge Cases
1. **Invalid Target Amount**
   - Input: Negative or zero target amount
   - Expected: Validation error displayed
   - Test ID: GOALS-005

2. **Past Target Date**
   - Input: Target date in the past
   - Expected: Validation error displayed
   - Test ID: GOALS-006

3. **Unrealistic Return Expectation**
   - Input: Expected return rate above 30%
   - Expected: Warning message about unrealistic expectations
   - Test ID: GOALS-007

4. **Goal Deletion**
   - Input: Delete an existing goal
   - Expected: Goal removed from list, confirmation message displayed
   - Test ID: GOALS-008

### 6. Personalized Recommendations Tests

#### Happy Path
1. **Conservative Portfolio**
   - Input: User with Conservative risk profile
   - Expected: Debt and hybrid funds recommended, 70/30 allocation suggested
   - Test ID: RECOMMENDATIONS-001

2. **Moderate Portfolio**
   - Input: User with Moderate risk profile
   - Expected: Balanced funds recommended, 50/30/20 allocation suggested
   - Test ID: RECOMMENDATIONS-002

3. **Aggressive Portfolio**
   - Input: User with Aggressive risk profile
   - Expected: Equity funds recommended, 70/20/10 allocation suggested
   - Test ID: RECOMMENDATIONS-003

4. **Portfolio Allocation**
   - Input: User allocates 100% across recommended funds
   - Expected: Allocation saved, confirmation message displayed
   - Test ID: RECOMMENDATIONS-004

#### Edge Cases
1. **Incomplete Allocation**
   - Input: Proceed with allocation < 100%
   - Expected: Error message, highlighting incomplete allocation
   - Test ID: RECOMMENDATIONS-005

2. **Over-Allocation**
   - Input: Allocation > 100%
   - Expected: Error message, highlighting over-allocation
   - Test ID: RECOMMENDATIONS-006

3. **Fund Selection**
   - Input: User selects different funds than recommended
   - Expected: Custom portfolio created, risk warning displayed
   - Test ID: RECOMMENDATIONS-007

4. **Welcome Email**
   - Input: User requests welcome email
   - Expected: Email simulation triggered, confirmation message displayed
   - Test ID: RECOMMENDATIONS-008

### 7. Onboarding Progress Tests

#### Happy Path
1. **Step Completion**
   - Input: Complete each onboarding step
   - Expected: Progress bar updates, next step unlocked
   - Test ID: PROGRESS-001

2. **Progress Saving**
   - Input: Enter data in each step and navigate away
   - Expected: Data saved, pre-filled on return
   - Test ID: PROGRESS-002

3. **Onboarding Completion**
   - Input: Complete all onboarding steps
   - Expected: Onboarding marked complete, redirected to dashboard
   - Test ID: PROGRESS-003

#### Edge Cases
1. **Step Skipping**
   - Input: Attempt to skip required steps
   - Expected: Redirected to required step, error message displayed
   - Test ID: PROGRESS-004

2. **Browser Refresh**
   - Input: Refresh browser during onboarding
   - Expected: Session preserved, returned to last active step
   - Test ID: PROGRESS-005

3. **Session Timeout**
   - Input: Inactivity for extended period
   - Expected: Session expired, redirected to login
   - Test ID: PROGRESS-006

### 8. Dashboard Tests

#### Happy Path
1. **Dashboard Access**
   - Input: Completed onboarding user logs in
   - Expected: Dashboard displayed with personalized content
   - Test ID: DASHBOARD-001

2. **Goal Tracking**
   - Input: View investment goals on dashboard
   - Expected: Goals displayed with progress indicators
   - Test ID: DASHBOARD-002

3. **Portfolio Overview**
   - Input: View fund allocations on dashboard
   - Expected: Portfolio displayed with allocation percentages
   - Test ID: DASHBOARD-003

4. **Notifications**
   - Input: View system notifications
   - Expected: Notifications displayed, unread count updated
   - Test ID: DASHBOARD-004

#### Edge Cases
1. **No Goals**
   - Input: User with no investment goals
   - Expected: Empty state displayed with CTA to create goal
   - Test ID: DASHBOARD-005

2. **No Allocations**
   - Input: User with no fund allocations
   - Expected: Empty state displayed with CTA to view recommendations
   - Test ID: DASHBOARD-006

3. **No Notifications**
   - Input: User with no notifications
   - Expected: Empty state displayed
   - Test ID: DASHBOARD-007

### 9. Mobile Responsiveness Tests

#### Happy Path
1. **Mobile Layout**
   - Input: Access application on mobile device
   - Expected: Responsive layout, touch-friendly controls
   - Test ID: MOBILE-001

2. **Tablet Layout**
   - Input: Access application on tablet device
   - Expected: Optimized layout for larger screen
   - Test ID: MOBILE-002

#### Edge Cases
1. **Orientation Change**
   - Input: Rotate device from portrait to landscape
   - Expected: Layout adjusts appropriately
   - Test ID: MOBILE-003

2. **Small Screen**
   - Input: Access on small mobile screen
   - Expected: Content readable, controls accessible
   - Test ID: MOBILE-004

### 10. Accessibility Tests

#### Happy Path
1. **Keyboard Navigation**
   - Input: Navigate entire application using keyboard only
   - Expected: All interactive elements accessible via keyboard
   - Test ID: ACCESSIBILITY-001

2. **Screen Reader**
   - Input: Use screen reader to navigate application
   - Expected: All content properly announced with appropriate context
   - Test ID: ACCESSIBILITY-002

#### Edge Cases
1. **High Contrast Mode**
   - Input: Enable high contrast mode
   - Expected: Application remains usable with enhanced contrast
   - Test ID: ACCESSIBILITY-003

2. **Text Scaling**
   - Input: Increase browser text size
   - Expected: Layout adjusts without breaking, content remains readable
   - Test ID: ACCESSIBILITY-004

## Test Execution

### Automated Tests
- Unit tests for components and hooks
- Integration tests for API endpoints
- End-to-end tests for critical user flows

### Manual Tests
- Cross-browser compatibility testing
- Mobile device testing
- Accessibility testing with screen readers
- User acceptance testing

## Test Data

### Sample Users
1. **Conservative Investor**
   - Age: 55
   - Income: ₹8,00,000
   - Experience: New to investing
   - Objective: Capital preservation

2. **Moderate Investor**
   - Age: 35
   - Income: ₹15,00,000
   - Experience: 2 years
   - Objective: Steady income

3. **Aggressive Investor**
   - Age: 28
   - Income: ₹25,00,000
   - Experience: 5 years
   - Objective: High growth

### Sample Investment Goals
1. **Retirement Planning**
   - Target: ₹1,00,00,000
   - Timeline: 30 years
   - Monthly SIP: ₹8,000

2. **Child Education**
   - Target: ₹20,00,000
   - Timeline: 15 years
   - Monthly SIP: ₹5,000

3. **House Purchase**
   - Target: ₹50,00,000
   - Timeline: 10 years
   - Monthly SIP: ₹25,000

### Sample Mutual Funds
1. **HDFC Top 100 Fund**
   - Category: Equity
   - Risk: High
   - Return: 12.5%

2. **ICICI Pru Balanced Advantage Fund**
   - Category: Hybrid
   - Risk: Moderate
   - Return: 10.0%

3. **HDFC Short Term Debt Fund**
   - Category: Debt
   - Risk: Low
   - Return: 7.0%

## Test Results Tracking

### Pass Criteria
- All happy path tests pass
- Critical edge cases handled appropriately
- No critical or high severity bugs
- Performance within acceptable limits

### Fail Criteria
- Any happy path test fails
- Critical functionality broken
- Security vulnerabilities identified
- Performance below minimum requirements

## Continuous Integration

### Pre-commit Hooks
- Run unit tests
- Check code formatting
- Validate TypeScript types

### CI Pipeline
- Run all automated tests
- Generate test coverage report
- Deploy to staging environment
- Run accessibility checks

### CD Pipeline
- Deploy to production after successful CI
- Run smoke tests on production
- Monitor application performance