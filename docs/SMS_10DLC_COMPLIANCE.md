# SMS 10DLC Compliance – HMNP

This doc captures operational steps and app integration for 10DLC compliance.

## Brand/Campaign Registration

- Register Brand and Campaign in GHL or carrier partner (Twilio/LC) with:
  - Legal entity, EIN, website, address, sample messages, opt-in/opt-out language
  - Use STOP/HELP language per CTIA

## App Integration (Implemented)

- API route `POST /api/consent/sms` stores consent to GHL:
  - Tags: `Consent:SMS_OptIn` or `Consent:SMS_OptOut` (configurable)
  - Custom fields: `cf_consent_sms_communications`, `cf_consent_source`, `cf_consent_timestamp`, `cf_consent_ip`, `cf_consent_user_agent`
- Contact form enriches GHL with `smsConsent` and tags
- SMS sending gated by consent in `/api/sms/send` (via email or phone lookup)

## Required ENV

```
GHL_SMS_CONSENT_TAG=Consent:SMS_OptIn
GHL_SMS_OPTOUT_TAG=Consent:SMS_OptOut
GHL_LOCATION_ID=...
GHL_API_KEY=...
GHL_API_BASE_URL=https://services.leadconnectorhq.com
```

Optional (if using fixed IDs instead of key lookup):

```
GHL_CF_ID_CONSENT_SMS=cf_consent_sms_communications
GHL_CF_ID_CONSENT_SOURCE=cf_consent_source
GHL_CF_ID_CONSENT_TIMESTAMP=cf_consent_timestamp
GHL_CF_ID_CONSENT_IP=cf_consent_ip
GHL_CF_ID_CONSENT_USER_AGENT=cf_consent_user_agent
```

## Opt-Out Handling

- Ensure inbound STOP/HELP handling is enabled in GHL workflows
- Periodically reconcile opt-out list in GHL vs app logs

## Messaging Copy Requirements

- Include “Msg & data rates may apply. Reply STOP to opt out.” in first touch
- Identify brand in every message


