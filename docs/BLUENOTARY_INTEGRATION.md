# BlueNotary Integration Guide

## Overview

This guide explains how to set up and use the BlueNotary integration for Remote Online Notarization (RON) services in the Houston Mobile Notary Pros application.

## Prerequisites

1. **BlueNotary Account**: Sign up at [https://bluenotary.us](https://bluenotary.us) and create a notary account.
2. **BlueNotary API Key**: Generate an API key in the BlueNotary dashboard.
3. **Texas Notary Commission**: Ensure your notary has a valid Texas commission and is properly set up in BlueNotary.

## Configuration

1. Add the following environment variables to your `.env.local` file:

```
BLUENOTARY_API_KEY=your_bluenotary_api_key
BLUENOTARY_BASE_URL=https://api.bluenotary.us
BLUENOTARY_NOTARY_EMAIL=your_notary_email@example.com
BLUENOTARY_WEBHOOK_SECRET=your_webhook_secret
```

For testing/sandbox environment, use:

```
BLUENOTARY_BASE_URL=https://api-sandbox.bluenotary.us
```

2. Restart your application to apply the changes.

## Features

### 1. RON Session Creation

The BlueNotary integration allows customers to create RON sessions directly from the application. When a customer requests a RON session:

1. A secure session is created in BlueNotary
2. The customer receives an email with instructions to join
3. The session is tracked in the application database
4. Webhooks update the session status in real-time

### 2. RON Dashboard

The RON Dashboard (`/ron/dashboard`) provides:

- Session creation form
- List of active sessions
- Session status tracking
- Direct links to join sessions

### 3. Document Management

Customers can:

- Upload documents for notarization
- View notarized documents
- Download completed documents with digital notary seals

### 4. Webhook Integration

BlueNotary webhooks update the application when:

- Sessions are completed
- Documents are signed
- Sessions expire or are cancelled

Configure the webhook URL in BlueNotary to point to:

```
https://your-domain.com/api/ron/webhook
```

## Testing

To test the integration:

1. Set up with sandbox credentials
2. Create a test session
3. Open the session link
4. Go through the verification process
5. Complete the test session
6. Verify the webhook updates the session status

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Verify the API key is correct and not expired
2. **Webhook Errors**: Ensure the webhook URL is accessible from BlueNotary
3. **Session Creation Fails**: Check notary email is correct and associated with a valid account

### Logs

Check the application logs for errors:

```bash
grep -r "BlueNotary" logs/
```

## RON Compliance

BlueNotary ensures compliance with:

- Texas RON laws (Government Code Chapter 406)
- MISMO RON standards
- Credential analysis requirements
- Knowledge-based authentication (KBA)
- Audio-visual recording storage
- Tamper-evident technology

## Pricing

BlueNotary costs are:

- Per-session fee: $8-12 (depending on volume)
- Additional signers: $5 each
- Additional documents: No extra charge

These costs should be factored into your RON service pricing.

## Support

If you encounter issues:

1. BlueNotary Support: support@bluenotary.us
2. API Documentation: [https://docs.bluenotary.us](https://docs.bluenotary.us)