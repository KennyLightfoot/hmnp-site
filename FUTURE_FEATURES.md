# Future Features & Enhancements

This document outlines potential future improvements and features for the HMNP portal.

## Sign-up & User Authentication

- **Success Indication on Login Page:** 
  - Display a "Registered successfully! Please sign in." message on the `/login` page when redirected from a successful registration (e.g., by checking for a `?registered=true` query parameter).

- **Implement Full Email Verification Flow:**
  - For self-registration, instead of immediately marking `emailVerified` as true:
    - Send a verification email with a unique, time-sensitive link/token upon account creation.
    - Set `emailVerified` to `null` (or a dedicated `pending_verification` status) initially.
    - Create an API endpoint and page for users to click the verification link, which then updates `emailVerified`.
    - Consider restricting access to certain application features until the user's email is verified.

- **Improved Sign-up Error Handling & Feedback:**
  - Provide more granular and user-friendly error messages on the `/register` page based on API responses.
  - Offer clearer visual feedback during form submission and for success/error states.

- **Robust Password Strength Requirements:**
  - Implement stricter client-side and server-side password strength validation during sign-up and password changes (e.g., minimum length, requiring uppercase, lowercase, numbers, and special characters).
  - Provide visual feedback to the user on password strength as they type.

## Admin & User Management

- **Complete Admin-Initiated Invite Feature:**
  - Finish the functionality in `app/api/admin/users/invite/route.ts`.
  - Generate a unique, secure, and potentially time-limited token for password setting when an admin invites a new user.
  - Integrate with an email service (e.g., Resend, as configured in NextAuth) to send an invitation email to the new user. This email should contain a link to a page where they can set their initial password.
  - Create the frontend page and corresponding API endpoint for the user to set their password using the invitation token.

- **User Profile Management:**
  - Allow users to view and update their own profile information (e.g., name, possibly email if verification flow is in place, password changes).

- **Enhanced Admin User Management Dashboard:**
  - Admins should be able to resend verification emails.
  - Admins should be able to manually verify users if needed.
  - Admins should be able to deactivate/activate user accounts.
  - Add search and filtering capabilities to the user list.

## Remote Online Notarization (RON) Portal (Texas Compliant)

- **Goal:** Allow the notary (platform owner) to conduct fully compliant Remote Online Notarizations directly through the HMNP-Site for clients in Texas.

- **Core Components & Features:**
  - **Identity Verification (ID Proofing & Credential Analysis):**
    - Integration with a third-party service for:
      - Remote presentation and analysis of government-issued IDs.
      - Knowledge-Based Authentication (KBA) or equivalent identity proofing.
    - Must comply with Texas SOS requirements.
    - **Potential Provider Research:** Authenticate.com (Medallion™ API) appears promising with per-transaction pricing (e.g., ~$1/KBA, ~$1/Gov ID check) and an accessible API; further investigation into their API specifics and direct confirmation of Texas RON compliance nuances is needed.
  - **Secure Two-Way Audio-Visual Conferencing:**
    - Live, real-time A/V communication between notary and signer.
    - Secure recording of the entire RON session.
    - Solution to be determined (WebRTC custom build vs. third-party API).
  - **Electronic Document Handling & Signing:**
    - Client ability to upload/select documents.
    - Viewer for shared document review during session.
    - Electronic signature capability for the signer.
    - Application of Notary's electronic signature (via X.509 digital certificate) and electronic seal.
    - Ensure notarized documents are tamper-evident as per Texas law.
  - **Electronic Notary Journal:**
    - Securely record all required details for each RON session (date/time, principals, ID verification method, A/V recording reference, fee, etc.).
    - Comply with Texas record-keeping requirements (e.g., 5-year retention for recordings).
    - Prohibit recording of sensitive ID numbers (e.g., DL#, passport #).
  - **Notary's Digital Certificate & E-Seal Management:**
    - Mechanism for the notary to utilize their own X.509 digital certificate.
    - Application of the notary's Texas-compliant electronic seal image.
  - **Compliance & Audit Trails:**
    - Adherence to all Texas Government Code and Administrative Code provisions for RON.
    - Detailed audit trails for all stages of the RON process.
  - **User Experience:**
    - Intuitive interface for both the notary and the signing client.
    - Clear instructions and guidance throughout the RON process.

- **Considerations:**
  - Balance between custom development and third-party API integrations to manage cost and complexity.
  - Ongoing costs of third-party services (IDV, A/V, digital certificates).
  - Security and data privacy for all sensitive information and recordings. 

- **Detailed RON User Experience & Workflow Features:**
  - **User Roles & Permissions:**
    - Notary: Access to scheduling, conducting sessions, e-journal, recordings, digital certificate/seal settings.
    - Signer (Client): Access to scheduled sessions, document upload/review, e-signing.
    - Witness (Optional): Workflow for witness participation, including IDV and e-signing if applicable.
    - Administrator: Platform management, user/notary management, audit trails, system configuration.
  - **Document Preparation & Tagging:**
    - Interface for notary/client to place e-signature, initial, date, and notary seal tags on documents pre-session.
  - **RON Session Scheduling & Management:**
    - Built-in scheduling system or calendar integration for appointments.
    - Automated email/SMS notifications and reminders for sessions.
    - Ability to manage (reschedule/cancel) appointments.
  - **Client-Side Pre-Session Checks:**
    - Utility for signers to test their camera, microphone, and internet connection quality before sessions.
  - **Notary Dashboard for RON:**
    - Dedicated dashboard for notaries: upcoming appointments, recent notarizations, quick e-journal access, RON settings.
  - **Witness Support Workflow (Optional):**
    - Clearly defined process for inviting, verifying (IDV), and managing witnesses during a RON session, including their e-signing actions if required.

- **Advanced RON Platform Capabilities & Compliance:**
  - **Payment Processing Integration:**
    - Integration with a payment gateway (e.g., Stripe) to charge for RON services.
    - System to track payments against RON sessions.
  - **RON Recording & E-Journal Enhancements:**
    - Secure notary access for retrieving specific A/V recordings and e-journal entries (e.g., search by date, signer, document ID).
    - Mechanism to provide certified copies of e-journal entries/recordings.
    - Storage lifecycle management (archival, deletion post-retention period).
  - **Accessibility (WCAG):**
    - Design and development considerations to meet Web Content Accessibility Guidelines.
  - **Advanced Audit Trails & Reporting:**
    - Granular reporting for administrative oversight and compliance. 