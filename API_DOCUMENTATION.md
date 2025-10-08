# API Documentation

## Overview

This document describes the API endpoints for the Indian Investment Onboarding System. The API is built using Supabase, which provides RESTful endpoints for database operations.

## Authentication

### Sign Up
```
POST /auth/v1/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "full_name": "User Name"
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "full_name": "User Name"
  },
  "session": {
    "access_token": "jwt-token",
    "expires_in": 3600
  }
}
```

### Sign In
```
POST /auth/v1/token?grant_type=password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "expires_in": 3600,
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

### Sign Out
```
POST /auth/v1/logout
```

**Headers:**
```
Authorization: Bearer jwt-token
```

## Onboarding

### Get Onboarding Steps
```
GET /rest/v1/onboarding_steps?is_active=eq.true&order=step_number.asc
```

**Response:**
```json
[
  {
    "id": "step-1",
    "step_number": 1,
    "step_name": "Welcome & Basic Details",
    "step_description": "OTP verification, demographics, experience, smooth progress indicators",
    "is_required": true,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

### Update Onboarding Progress
```
POST /rest/v1/onboarding_progress
```

**Request Body:**
```json
{
  "user_id": "user-id",
  "step_id": "step-1",
  "completed": true,
  "data": {
    "phone": "+919876543210",
    "otp_verified": true
  }
}
```

**Response:**
```json
{
  "id": "progress-id",
  "user_id": "user-id",
  "step_id": "step-1",
  "completed": true,
  "data": {
    "phone": "+919876543210",
    "otp_verified": true
  },
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get Onboarding Status
```
GET /rest/v1/profiles?user_id=eq.user-id&select=onboarding_completed,onboarding_completion_percentage,last_active_step
```

**Response:**
```json
[
  {
    "onboarding_completed": false,
    "onboarding_completion_percentage": 20,
    "last_active_step": 1
  }
]
```

## Risk Profiling

### Get Risk Questions
```
GET /rest/v1/risk_questions?is_active=eq.true&order=order_sequence.asc
```

**Response:**
```json
[
  {
    "id": "question-1",
    "question_text": "What is your age group?",
    "question_type": "single_choice",
    "category": "capacity",
    "order_sequence": 1,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

### Get Risk Options
```
GET /rest/v1/risk_options?question_id=eq.question-1
```

**Response:**
```json
[
  {
    "id": "option-1",
    "question_id": "question-1",
    "option_text": "Below 30 years",
    "score": 3,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

### Save Risk Responses
```
POST /rest/v1/risk_responses
```

**Request Body:**
```json
{
  "user_id": "user-id",
  "question_id": "question-1",
  "option_ids": ["option-1"],
  "score": 3
}
```

**Response:**
```json
{
  "id": "response-id",
  "user_id": "user-id",
  "question_id": "question-1",
  "option_ids": ["option-1"],
  "score": 3,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get User Risk Profile
```
GET /rest/v1/profiles?user_id=eq.user-id&select=risk_profile,risk_score
```

**Response:**
```json
[
  {
    "risk_profile": "Aggressive",
    "risk_score": 20
  }
]
```

## Investment Goals

### Create Investment Goal
```
POST /rest/v1/investment_goals
```

**Request Body:**
```json
{
  "user_id": "user-id",
  "goal_name": "Child Education",
  "goal_type": "child_education",
  "target_amount": 1000000,
  "target_date": "2035-06-01",
  "current_savings": 100000,
  "expected_return_rate": 12.0
}
```

**Response:**
```json
{
  "id": "goal-id",
  "user_id": "user-id",
  "goal_name": "Child Education",
  "goal_type": "child_education",
  "target_amount": 1000000,
  "target_date": "2035-06-01",
  "current_savings": 100000,
  "expected_return_rate": 12.0,
  "monthly_contribution": 5000,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get User Investment Goals
```
GET /rest/v1/investment_goals?user_id=eq.user-id
```

**Response:**
```json
[
  {
    "id": "goal-id",
    "user_id": "user-id",
    "goal_name": "Child Education",
    "goal_type": "child_education",
    "target_amount": 1000000,
    "target_date": "2035-06-01",
    "current_savings": 100000,
    "expected_return_rate": 12.0,
    "monthly_contribution": 5000,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Update Investment Goal
```
PATCH /rest/v1/investment_goals?id=eq.goal-id
```

**Request Body:**
```json
{
  "target_amount": 1200000,
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Delete Investment Goal
```
DELETE /rest/v1/investment_goals?id=eq.goal-id
```

## Documents

### Upload KYC Document
```
POST /storage/v1/object/documents/user-id/document-name.pdf
```

**Headers:**
```
Authorization: Bearer jwt-token
Content-Type: application/pdf
```

**Request Body:**
Binary file data

**Response:**
```json
{
  "Key": "documents/user-id/document-name.pdf",
  "Bucket": "documents"
}
```

### Save Document Reference
```
POST /rest/v1/kyc_documents
```

**Request Body:**
```json
{
  "user_id": "user-id",
  "document_type": "pan",
  "file_name": "pan-card.pdf",
  "file_url": "/storage/v1/object/documents/user-id/pan-card.pdf",
  "file_size": 1024000,
  "mime_type": "application/pdf",
  "verification_status": "pending"
}
```

**Response:**
```json
{
  "id": "document-id",
  "user_id": "user-id",
  "document_type": "pan",
  "file_name": "pan-card.pdf",
  "file_url": "/storage/v1/object/documents/user-id/pan-card.pdf",
  "file_size": 1024000,
  "mime_type": "application/pdf",
  "verification_status": "pending",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get User Documents
```
GET /rest/v1/kyc_documents?user_id=eq.user-id
```

**Response:**
```json
[
  {
    "id": "document-id",
    "user_id": "user-id",
    "document_type": "pan",
    "file_name": "pan-card.pdf",
    "file_url": "/storage/v1/object/documents/user-id/pan-card.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "verification_status": "pending",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

## Recommendations

### Get Mutual Funds
```
GET /rest/v1/mutual_funds?is_active=eq.true
```

**Response:**
```json
[
  {
    "id": "fund-id",
    "scheme_name": "HDFC Top 100 Fund",
    "fund_house": "HDFC Mutual Fund",
    "category": "equity",
    "risk_level": "high",
    "expected_return": 12.5,
    "aum": 50000000000,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

### Save Fund Allocation
```
POST /rest/v1/fund_allocations
```

**Request Body:**
```json
{
  "user_id": "user-id",
  "goal_id": "goal-id",
  "fund_id": "fund-id",
  "allocation_percentage": 30
}
```

**Response:**
```json
{
  "id": "allocation-id",
  "user_id": "user-id",
  "goal_id": "goal-id",
  "fund_id": "fund-id",
  "allocation_percentage": 30,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get User Fund Allocations
```
GET /rest/v1/fund_allocations?user_id=eq.user-id
```

**Response:**
```json
[
  {
    "id": "allocation-id",
    "user_id": "user-id",
    "goal_id": "goal-id",
    "fund_id": "fund-id",
    "allocation_percentage": 30,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

## Notifications

### Get User Notifications
```
GET /rest/v1/notifications?user_id=eq.user-id&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "notification-id",
    "user_id": "user-id",
    "title": "Welcome to Our Investment Platform!",
    "message": "We're excited to have you on board.",
    "type": "success",
    "category": "onboarding",
    "read": false,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

### Mark Notification as Read
```
PATCH /rest/v1/notifications?id=eq.notification-id
```

**Request Body:**
```json
{
  "read": true,
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token"
}
```

**403 Forbidden**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found**
```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

Exceeding these limits will result in a 429 Too Many Requests response.

## Webhooks

### Onboarding Completion
Triggered when a user completes onboarding:
```
POST /webhooks/onboarding-complete
```

**Payload:**
```json
{
  "user_id": "user-id",
  "email": "user@example.com",
  "completed_at": "2023-01-01T00:00:00Z"
}
```

### Document Verification
Triggered when a document is verified:
```
POST /webhooks/document-verified
```

**Payload:**
```json
{
  "user_id": "user-id",
  "document_id": "document-id",
  "document_type": "pan",
  "status": "verified",
  "verified_at": "2023-01-01T00:00:00Z"
}
```