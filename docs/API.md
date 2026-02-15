# API Documentation

This document provides details about the Houston Mobile Notary Pros API endpoints.

## Authentication

Most API endpoints require authentication. Use the following headers:

```
Authorization: Bearer {token}
```

Where `{token}` is a valid JWT token obtained through the authentication process.

## Base URL

All API endpoints are relative to the base URL: `https://houstonmobilenotarypros.com/api`

## Endpoints

### Authentication

#### POST `/auth/signin`

Sign in with credentials or OAuth provider.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

#### POST `/auth/signout`

Sign out and invalidate the current session.

**Response:**
```json
{
  "success": true
}
```

### Booking

#### GET `/booking/availability`

Get available time slots for a specific date.

**Query Parameters:**
- `date` (required): ISO date string (YYYY-MM-DD)
- `serviceType` (optional): Type of service

**Response:**
```json
{
  "availableSlots": [
    {
      "start": "2026-02-15T09:00:00.000Z",
      "end": "2026-02-15T10:00:00.000Z"
    },
    {
      "start": "2026-02-15T10:30:00.000Z",
      "end": "2026-02-15T11:30:00.000Z"
    }
  ]
}
```

#### POST `/booking/create`

Create a new booking.

**Request:**
```json
{
  "serviceType": "STANDARD_NOTARY",
  "address": {
    "street": "123 Main St",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77008"
  },
  "scheduledDateTime": "2026-02-15T09:00:00.000Z",
  "documentCount": 3,
  "signerCount": 1,
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "5551234567"
  }
}
```

**Response:**
```json
{
  "bookingId": "booking_123",
  "status": "PENDING_PAYMENT",
  "price": {
    "basePrice": 75,
    "travelFee": 0,
    "additionalFees": 0,
    "discount": 0,
    "totalPrice": 75
  },
  "paymentUrl": "https://checkout.stripe.com/..."
}
```

#### GET `/booking/:id`

Get booking details by ID.

**Response:**
```json
{
  "id": "booking_123",
  "status": "CONFIRMED",
  "serviceType": "STANDARD_NOTARY",
  "scheduledDateTime": "2026-02-15T09:00:00.000Z",
  "address": {
    "street": "123 Main St",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77008"
  },
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "5551234567"
  },
  "notary": {
    "name": "Jane Smith",
    "phone": "5557654321"
  },
  "documentCount": 3,
  "signerCount": 1,
  "price": {
    "basePrice": 75,
    "travelFee": 0,
    "additionalFees": 0,
    "discount": 0,
    "totalPrice": 75
  },
  "payment": {
    "status": "PAID",
    "method": "CARD",
    "paidAt": "2026-02-14T18:30:00.000Z"
  },
  "createdAt": "2026-02-14T18:00:00.000Z",
  "updatedAt": "2026-02-14T18:30:00.000Z"
}
```

#### PATCH `/booking/:id`

Update a booking.

**Request:**
```json
{
  "status": "CANCELLED",
  "cancelReason": "Customer requested cancellation"
}
```

**Response:**
```json
{
  "id": "booking_123",
  "status": "CANCELLED",
  "updatedAt": "2026-02-14T19:00:00.000Z"
}
```

### Pricing

#### POST `/pricing/calculate`

Calculate price for a service.

**Request:**
```json
{
  "serviceType": "STANDARD_NOTARY",
  "address": {
    "zipCode": "77008"
  },
  "documentCount": 3,
  "signerCount": 1,
  "scheduledDateTime": "2026-02-15T09:00:00.000Z"
}
```

**Response:**
```json
{
  "basePrice": 75,
  "travelFee": 0,
  "additionalFees": 0,
  "discount": 0,
  "totalPrice": 75,
  "breakdown": [
    { "description": "Base fee for standard notary service", "amount": 75 }
  ],
  "transparencyInfo": {
    "factors": [
      { "name": "Base pricing", "impact": "Standard notary service base fee" }
    ],
    "alternatives": [
      { "name": "Remote Online Notarization", "price": 60, "benefits": ["No travel needed", "Available 24/7"] }
    ]
  }
}
```

### Remote Online Notarization (RON)

#### POST `/ron/initiate`

Initiate a new RON session.

**Request:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "5551234567",
  "documentTypes": ["GENERAL"],
  "scheduledDateTime": "2026-02-15T14:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "ron_1234567890",
    "status": "PENDING",
    "sessionUrl": "https://app.bluenotary.us/session/1234567890",
    "expiresAt": "2026-02-22T14:00:00.000Z"
  }
}
```

#### GET `/ron/status/:sessionId`

Get RON session status.

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "ron_1234567890",
    "status": "SCHEDULED",
    "sessionUrl": "https://app.bluenotary.us/session/1234567890",
    "notaryName": "Jane Smith",
    "createdAt": "2026-02-15T09:30:00.000Z",
    "expiresAt": "2026-02-22T14:00:00.000Z",
    "documentIds": ["doc_123", "doc_456"]
  }
}
```

### Webhooks

#### POST `/webhooks/stripe`

Stripe webhook endpoint.

**Headers:**
```
Stripe-Signature: t=1676474359,v1=...
```

**Request:** Stripe event object

**Response:**
```json
{
  "received": true
}
```

#### POST `/webhooks/ghl`

GoHighLevel webhook endpoint.

**Request:** GoHighLevel event object

**Response:**
```json
{
  "received": true
}
```

### Error Responses

All API endpoints follow a standard error response format:

```json
{
  "error": "Error message",
  "details": ["Additional error details"],
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (resource already exists or state conflict)
- `422`: Unprocessable Entity (validation failed)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error (server-side issue)

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:

- Authentication endpoints: 5 requests per minute
- Public endpoints: 60 requests per minute
- Protected endpoints: 300 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1676474359
```

## Versioning

The current API version is v1. The version is not included in the URL path, but future versions will use the format `/api/v2/...` when breaking changes are introduced.