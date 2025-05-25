# HMNP Site - Project Roadmap

This document outlines the features implemented, in progress, and planned for the Houston Mobile Notary Pros (HMNP) platform, with a focus on the Remote Online Notarization (RON) capabilities.

## I. Completed Features

- **User Authentication & Roles:**
  - Core NextAuth setup.
  - Prisma schema with user roles: `ADMIN`, `STAFF`, `PARTNER`, `SIGNER`, `NOTARY`.
  - Role integration with NextAuth sessions.
- **User Invitation Flow:**
  - Admin ability to invite new users with specific roles.
  - Generation of unique, expiring invitation tokens (`InvitationToken` model).
  - Email invitations sent via Resend (using `RESEND_API_KEY` and `FROM_EMAIL`).
  - Secure password setting page (`/invite/accept`) for invited users.
  - Token validation (existence, expiry) and secure deletion upon use.
  - `bcrypt` for password hashing.
- **Notary Portal (MVP):**
  - `NOTARY` users can log in.
  - `NOTARY` users can view assignments they are assigned to via `NotarizationSession` records.
    - Implemented by linking `Assignment` -> `AssignmentDocument` -> `NotarizationDocument` (with `sourceAssignmentDocumentId`) -> `NotarizationSession` (with `notaryId`).

## II. Immediate Next Steps / In Progress

- **Thorough Testing of User Invitation Flow Edge Cases:**
  - [ ] Verify `InvitationToken` is deleted from the database after successful password setting.
  - [ ] Test behavior with expired invitation tokens.
  - [ ] Test behavior with invalid/non-existent invitation tokens.
  - [ ] Test client-side password confirmation on the invitation acceptance page.

## III. Planned Features (RON Platform Focus)

### A. Signer Experience & Portal

- **Signer Dashboard:**
  - [ ] Design and implement a dedicated portal/dashboard for `SIGNER` users.
  - [ ] Display relevant information upon login.
- **Notarization Session Management (Signer View):**
  - [ ] View upcoming and past notarization sessions.
  - [ ] See session status and details.
- **Document Management (Signer):**
  - [ ] Functionality for `SIGNER` users to upload documents required for a notarization session.
  - [ ] Associate uploaded documents with a specific session.
- **Participate in Notarization Session (MVP - Mocked Features):**
  - [ ] Interface to simulate Knowledge-Based Authentication (KBA).
  - [ ] Interface to simulate Identity Verification (IDV).
  - [ ] Placeholder for video session interface.

### B. Notary Experience & Portal (Enhancements)

- **Notarization Session Management (Notary View):**
  - [ ] Enhanced interface for managing assigned notarization sessions.
  - [ ] Start/conduct (mocked) sessions.
  - [ ] Update session status (e.g., `DOCUMENTS_UPLOADED`, `READY_FOR_SESSION`, `COMPLETED`).
- **Document Access (Notary):**
  - [ ] Securely access documents uploaded by the `SIGNER` for a specific session.
- **Conduct Session (MVP - Mocked Features):**
  - [ ] Interface to guide through (mocked) KBA/IDV steps for the signer.
  - [ ] Interface for (mocked) document signing ceremony.
- **Notary Journal:**
  - [ ] Functionality to create and manage notary journal entries for completed sessions.

### C. Admin Experience & Portal (Enhancements)

- **RON Session Oversight:**
  - [ ] View all notarization sessions and their statuses.
  - [ ] Potentially assign notaries to sessions if not automatically assigned.
- **User Management:**
  - [ ] (Existing) Continue to manage users, roles, and invitations.
- **System Configuration (RON):**
  - [ ] (Future) Settings related to RON process, e.g., KBA questions, IDV parameters (if applicable to mocked versions).

### D. Core Notarization Session Logic

- **Session Creation:**
  - [ ] Mechanism to create new `NotarizationSession` records.
  - [ ] Link sessions to a `SIGNER` and (eventually) an `Assignment` (if applicable to the workflow).
- **Status Transitions:**
  - [ ] Define and implement logic for `NotarizationStatus` transitions.

## IV. Deployment

- [ ] Verify all environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `FROM_EMAIL`, `NEXT_PUBLIC_BASE_URL`) are correctly configured in Vercel (or other hosting provider).
- [ ] Test the full deployed application, including invitation and core RON flows (as they are developed).

## V. Future / Stretch Goals

- [ ] Real KBA/IDV service integration.
- [ ] Real-time video session integration (e.g., Daily.co, Twilio Video).
- [ ] Digital signing of documents within the platform (e.g., integrating with a signing API or library).
- [ ] Secure storage and retrieval of signed documents and video recordings.
- [ ] Payment processing for notarization services.
- [ ] Audit trails for all notarization activities.
- [ ] Notifications (email, in-app) for session updates, document uploads, etc.

---
*This roadmap is a living document and will be updated as the project progresses.*
