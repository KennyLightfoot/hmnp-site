# Houston Mobile Notary Pros

A comprehensive platform for professional mobile notary and loan signing services in Houston, TX.

## 📋 Overview

The HMNP platform provides a complete solution for managing a mobile notary business, including:

- Online booking and scheduling
- Automated pricing and travel fee calculation
- Payment processing with Stripe
- Customer relationship management
- Notary network management
- Remote Online Notarization (RON) via BlueNotary
- AI-powered chat assistance

## 🏗️ Tech Stack

- **Frontend:** Next.js 13+ (App Router), React, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Next.js API Routes
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **CRM Integration:** GoHighLevel
- **Calendar:** Google Calendar API
- **Maps/Distance:** Google Maps API
- **Hosting:** Vercel
- **Content Management:** Sanity.io
- **Storage:** Supabase Storage
- **Monitoring:** Sentry, Application Insights

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KennyLightfoot/hmnp-site.git
   cd hmnp-site
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your actual credentials.

4. Initialize the database:
   ```bash
   pnpm prisma db push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## 🏢 Project Structure

```
hmnp-site/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # API endpoints
│   ├── booking/      # Booking flow
│   ├── ron/          # Remote Online Notarization
│   └── ...
├── components/       # React components
│   ├── booking/      # Booking-related components
│   ├── layout/       # Layout components
│   ├── ui/           # UI component library (shadcn)
│   └── ...
├── lib/              # Utility functions and business logic
│   ├── pricing/      # Pricing engine
│   ├── booking/      # Booking system logic
│   ├── auth/         # Authentication utilities
│   ├── ron/          # RON integration
│   └── ...
├── prisma/           # Database schema and migrations
├── public/           # Static assets
└── ...
```

## 🤖 AI Receptionist System

The platform includes an intelligent customer service automation system with:

- Real-time distance calculation and travel fee computation using Google Maps
- Live calendar availability checking via GoHighLevel
- Location intelligence with automatic geolocation and ZIP code detection
- Dynamic data retrieval for personalized responses
- Context-aware responses based on page location and customer intent

## 🌐 Remote Online Notarization (RON)

BlueNotary integration enables remote online notarization with:

- Secure customer identity verification
- Document preparation and signing
- Audio-video session recording
- Digital notarial certificates
- Tamper-evident technology

See the [BlueNotary Integration Guide](./docs/BLUENOTARY_INTEGRATION.md) for details.

## 🧪 Testing

The codebase includes comprehensive test suites:

```bash
# Run unit tests
pnpm test

# Run unit tests with coverage
pnpm test:coverage

# Run end-to-end tests
pnpm test:e2e
```

## 🔐 Security

- All sensitive credentials are stored in environment variables
- Authentication with JWT and secure cookies
- CSRF protection
- Input validation using Zod schemas
- Rate limiting on sensitive endpoints

## 📚 Documentation

Additional documentation can be found in the `docs/` directory:

- [Business Automation Guide](./docs/AUTOMATING_NOTARY_BUSINESS.md)
- [BlueNotary Integration](./docs/BLUENOTARY_INTEGRATION.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)

## 📄 License

Private - All rights reserved © Houston Mobile Notary Pros