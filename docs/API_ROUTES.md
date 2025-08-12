# NMC AI Domain Name Tool - API Routes

## Overview

This document lists all available API routes in the NMC AI Domain Name Tool backend. The API is built with Express.js and provides endpoints for domain generation, subscription management, authentication, and webhook handling.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints support authentication via:

- **User Object**: `req.user` (set by authentication middleware)
- **Email Header**: `x-user-email` (fallback for unauthenticated flows)

## Health Check

### GET /health

Returns the health status of all services.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-08-12T17:16:03.853Z",
  "services": {
    "database": "healthy",
    "ai": "configured",
    "domain_api": "configured",
    "stripe": "not_configured"
  }
}
```

---

## Domain Generation

### POST /api/domains/generate

Generates domain name suggestions based on business niche and brand tone.

**Request Body:**

```json
{
  "businessNiche": "tech startup",
  "brandTone": "professional",
  "preferences": {
    "includeNumbers": false,
    "maxLength": 15,
    "style": "modern"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "suggestions": [
      {
        "domain": "techflow.com",
        "reasoning": "Combines 'tech' with 'flow' suggesting smooth technology solutions",
        "availability": "unknown"
      }
    ],
    "usage": {
      "current": 1,
      "limit": 2,
      "tier": "free"
    }
  }
}
```

### POST /api/domains/check-availability

Checks the availability of specific domain names.

**Request Body:**

```json
{
  "domains": ["example.com", "test.org", "startup.io"]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "domain": "example.com",
        "available": false,
        "price": null
      },
      {
        "domain": "test.org",
        "available": true,
        "price": 12.99
      }
    ]
  }
}
```

---

## Authentication

### GET /auth/user

Returns the current authenticated user information.

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2025-08-12T10:00:00Z"
  }
}
```

---

## Subscription Management

### POST /api/subscriptions/checkout

Creates a Stripe checkout session for subscription purchase.

**Request Body:**

```json
{
  "tier": "mid",
  "success_url": "http://localhost:3000/success",
  "cancel_url": "http://localhost:3000/cancel"
}
```

**Response (Success):**

```json
{
  "status": "success",
  "data": {
    "url": "https://checkout.stripe.com/pay/cs_test_...",
    "sessionId": "cs_test_..."
  }
}
```

**Response (Stripe Not Configured):**

```json
{
  "status": "error",
  "error": "Stripe not configured"
}
```

### GET /api/subscriptions/current

Returns the current subscription status for the user.

**Response:**

```json
{
  "status": "success",
  "data": {
    "tier": "free",
    "status": "none",
    "currentPeriodEnd": null,
    "stripeCustomerId": null
  }
}
```

### GET /api/subscriptions/details

Returns detailed subscription information including upcoming invoices and payment methods.

**Response:**

```json
{
  "status": "success",
  "data": {
    "subscription": {
      "id": "sub_...",
      "status": "active",
      "currentPeriodEnd": "2025-09-12T10:00:00Z"
    },
    "upcomingInvoice": {
      "amountDue": 500,
      "nextPaymentAttempt": "2025-09-12T10:00:00Z"
    },
    "paymentMethod": {
      "type": "card",
      "last4": "4242"
    }
  }
}
```

### POST /api/subscriptions/cancel

Cancels the current subscription at the end of the billing period.

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Subscription will be canceled at the end of the current period"
  }
}
```

### POST /api/subscriptions/upgrade

Upgrades the subscription to a higher tier.

**Request Body:**

```json
{
  "newTier": "premium"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Subscription upgraded successfully"
  }
}
```

### POST /api/subscriptions/reactivate

Reactivates a canceled subscription.

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Subscription reactivated successfully"
  }
}
```

---

## Webhooks

### POST /webhooks/stripe

Handles Stripe webhook events for subscription lifecycle management.

**Headers Required:**

```
stripe-signature: t=timestamp,v1=signature
```

**Supported Events:**

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Response:**

```json
{
  "status": "success"
}
```

---

## Usage Limits

### Tier-based Limits

The API enforces usage limits based on subscription tier:

| Tier    | Monthly Generations | AI Model               | Cost      |
| ------- | ------------------- | ---------------------- | --------- |
| Free    | 2                   | LLaMA-3 or GPT-4o-mini | $0        |
| Mid     | 100                 | GPT-4o-mini            | $5/month  |
| Premium | Unlimited           | GPT-4o                 | $10/month |

### Rate Limiting

- **Free Tier**: 2 generations per month
- **Mid Tier**: 100 generations per month
- **Premium Tier**: Unlimited generations
- **Rate Limit Response**: 429 Too Many Requests

**Rate Limit Error Response:**

```json
{
  "status": "error",
  "error": "Monthly usage limit reached for your free tier. Please upgrade or wait until next month.",
  "details": {
    "currentTier": "free",
    "usageCount": 2,
    "limit": 2
  }
}
```

---

## Error Responses

### Standard Error Format

All endpoints return errors in a consistent format:

```json
{
  "status": "error",
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **429**: Too Many Requests (usage limit exceeded)
- **500**: Internal Server Error
- **501**: Not Implemented (Stripe not configured)

### Validation Errors

When request validation fails:

```json
{
  "status": "error",
  "error": "Required; Required"
}
```

---

## Testing

### Test Commands

```bash
# Run all tests
npm run test:subscriptions:integration
npm run test:database

# Test specific endpoints
curl -X GET http://localhost:3000/health
curl -X GET http://localhost:3000/api/subscriptions/current -H "x-user-email: test@example.com"
```

### Test Environment

- **Database**: Uses test database with automatic cleanup
- **Stripe**: Mocked responses when not configured
- **AI Services**: Uses test API keys
- **Domain APIs**: Uses test endpoints

---

## Environment Variables

### Required for Full Functionality

```bash
# Database
DATABASE_URL="postgresql://..."

# AI Services
OPENAI_API_KEY="sk-..."
GROQ_API_KEY="gsk_..."

# Domain APIs
DOMAINR_API_KEY="..."

# Stripe (Optional - for subscription features)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_MID="price_..."
STRIPE_PRICE_PREMIUM="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Development Notes

### Current Status

- ✅ **Core API**: All endpoints implemented and tested
- ✅ **Database**: Prisma integration with migrations
- ✅ **AI Services**: OpenAI and Groq integration
- ✅ **Domain APIs**: Multi-registrar availability checking
- ⚠️ **Stripe**: Implemented but not configured (graceful degradation)

### Graceful Degradation

The system is designed to work without Stripe configuration:

- Returns appropriate error messages
- Maintains core functionality
- No system crashes
- Easy to enable with API keys

### Security Features

- JWT-based authentication
- Rate limiting by tier
- Input validation with Zod
- Webhook signature verification
- Database access control with RLS

---

## API Versioning

Current version: **v1**

All endpoints are prefixed with `/api/` for future versioning support.

---

_Last updated: August 12, 2025_
