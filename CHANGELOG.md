# Changelog

## [Unreleased] - Notary Network & Hiring System

### Added
- **Notary Application System**
  - Public hiring page at `/work-with-us` for notaries to apply
  - Comprehensive application form with commission details, E&O insurance, service areas, etc.
  - Admin review interface at `/admin/notary-applications` to review and manage applications
  - Application status workflow: PENDING → UNDER_REVIEW → APPROVED/REJECTED → CONVERTED
  - Ability to convert approved applications directly to user accounts

- **Enhanced Notary Profiles**
  - Extended `notary_profiles` model with onboarding status, E&O insurance details, background check status
  - Availability status tracking (AVAILABLE, BUSY, UNAVAILABLE, ON_LEAVE)
  - Service area and coverage tracking (states licensed, counties served, service radius)
  - Languages spoken and special certifications support

- **Job Offer System (First-Come-First-Serve)**
  - `JobOffer` model for managing job offers to network notaries
  - Automatic eligibility matching based on:
    - Active commission and E&O insurance
    - Geographic coverage (states, counties, service radius)
    - Availability status
  - First-come-first-serve acceptance with atomic transactions to prevent double-assignment
  - Automatic cancellation of other offers when one is accepted
  - Notary dashboard at `/notary/job-offers` to view and accept/decline offers
  - API endpoints for:
    - Sending bookings to network (`POST /api/bookings/[id]/send-to-network`)
    - Fetching offers (`GET /api/notary/job-offers`)
    - Accepting offers (`POST /api/notary/job-offers/[id]/accept`)
    - Declining offers (`POST /api/notary/job-offers/[id]/decline`)

- **Database Schema Updates**
  - New `NotaryApplication` model for storing applications
  - New `JobOffer` model for managing job offers
  - Enhanced `notary_profiles` with onboarding and compliance fields
  - Added `sendToNetwork` and `networkOfferExpiresAt` fields to `Booking` model
  - New enums: `NotaryApplicationStatus`, `NotaryOnboardingStatus`, `BackgroundCheckStatus`, `NotaryAvailabilityStatus`, `JobOfferStatus`

- **Admin Enhancements**
  - Added "Notary Applications" link to admin navigation
  - Application review page with detailed view and action buttons
  - Ability to approve, reject, or mark applications under review
  - Convert approved applications to user accounts with automatic profile creation

### Changed
- Updated admin navigation to include notary applications management
- Updated notary portal navigation to include job offers section

### Technical Details
- Created `lib/services/job-offer-service.ts` for job offer business logic
- Created `lib/utils/date-utils.ts` for consistent date formatting
- All new endpoints include proper authentication and authorization checks
- Transaction-based acceptance to ensure data consistency
- Comprehensive error handling and logging

### Next Steps (Pending)
- Email notifications for new applications and job offers
- Notary onboarding flow and checklist UI
- Rate limiting on job offer endpoints
- Enhanced geographic matching with actual distance calculations
- Guest-facing updates to show assigned notary information
- SOP documentation updates for network operations
