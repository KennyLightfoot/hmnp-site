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