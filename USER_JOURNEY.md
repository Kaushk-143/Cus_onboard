# User Journey Flowchart

```mermaid
graph TD
    A[User Registration] --> B[Email/Phone Verification]
    B --> C[Welcome & Basic Details]
    C --> D[KYC Documentation]
    D --> E[Risk Profiling Questionnaire]
    E --> F[Investment Goals Setup]
    F --> G[Personalized Recommendations]
    G --> H[Onboarding Complete]
    H --> I[Dashboard Access]
    
    B --> B1[Enter Email/Phone]
    B --> B2[Receive OTP]
    B --> B3[Verify OTP]
    
    C --> C1[Demographics]
    C --> C2[Investment Experience]
    C --> C3[Progress Indicators]
    
    D --> D1[Upload PAN Card]
    D --> D2[Upload Aadhaar Front]
    D --> D3[Upload Aadhaar Back]
    D --> D4[Upload Bank Statement]
    D --> D5[Upload Photo]
    D --> D6[Upload Signature]
    
    E --> E1[Answer 8 Questions]
    E --> E2[Risk Scoring]
    E --> E3[Risk Category Assignment]
    
    F --> F1[Select Goal Type]
    F --> F2[Set Target Amount]
    F --> F3[Set Target Date]
    F --> F4[SIP Calculator]
    F --> F5[Visual Timeline]
    
    G --> G1[Fund Suggestions]
    G --> G2[Portfolio Allocation]
    G --> G3[Welcome Email]
    
    I --> I1[Investment Goals Tracking]
    I --> I2[Portfolio Overview]
    I --> I3[Notifications]
    I --> I4[Profile Management]
```

## Decision Points

### 1. Registration Path
- **Email Registration**: User enters email → Receives verification email → Clicks verification link
- **Phone Registration**: User enters phone number → Receives SMS OTP → Enters OTP

### 2. KYC Document Upload
- **Document Quality**: Clear document → Proceed to next step | Blurry document → Request new upload
- **Document Type**: Valid document type → Accept | Invalid document type → Reject with reason

### 3. Risk Profiling
- **Conservative Profile**: Score 0-8 → Low-risk fund recommendations
- **Moderate Profile**: Score 9-16 → Balanced fund recommendations
- **Aggressive Profile**: Score 17-24 → High-growth fund recommendations

### 4. Investment Goals
- **Short-term Goals** (1-3 years): Debt and hybrid funds
- **Medium-term Goals** (3-7 years): Balanced and equity funds
- **Long-term Goals** (7+ years): Equity and ELSS funds

### 5. Fund Recommendations
- **Conservative Allocation**: 70% Debt, 30% Hybrid
- **Moderate Allocation**: 50% Equity, 30% Hybrid, 20% Debt
- **Aggressive Allocation**: 70% Equity, 20% Hybrid, 10% ELSS

## Edge Cases Handled

### 1. Incomplete Onboarding
- **Auto-save Progress**: User data saved at each step
- **Resume Later**: Users can return to last completed step
- **Session Timeout**: Automatic logout after inactivity

### 2. Document Verification Failures
- **Rejected Documents**: Clear rejection reasons provided
- **Resubmission**: Easy process to upload corrected documents
- **Support Request**: Option to contact support team

### 3. Risk Profile Mismatches
- **Profile Review**: Users can retake risk assessment
- **Advisor Consultation**: Option to speak with investment advisor
- **Profile Adjustment**: Manual adjustment of risk profile

### 4. Technical Issues
- **Offline Support**: Basic functionality available offline
- **Error Recovery**: Automatic recovery from common errors
- **Support Access**: Easy access to help and support

## User Experience Optimizations

### 1. Performance
- **Progressive Loading**: Load only necessary components
- **Caching**: Cache frequently accessed data
- **Optimized Assets**: Compressed images and assets

### 2. Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Contrast Ratios**: WCAG compliant color schemes

### 3. Mobile Experience
- **Touch Targets**: Appropriately sized touch targets
- **Gestures**: Support for common mobile gestures
- **Orientation**: Works in both portrait and landscape

### 4. Feedback Mechanisms
- **Real-time Validation**: Immediate form validation
- **Loading States**: Clear loading indicators
- **Success Messages**: Confirmation of successful actions