# Houston Mobile Notary Pros - Web Application

🚀 **Next.js 15 + Prisma + Supabase - Complete Notary Management System**

This is the complete web application for Houston Mobile Notary Pros, featuring a modern booking system, admin portal, notary portal, and comprehensive business automation.

## 🎯 **Features**

### **🔥 Core Business Systems**
- **Advanced Booking System** - Multi-step wizard with real-time availability
- **Admin Portal** - Complete business management dashboard
- **Notary Portal** - Mobile-friendly assignment management
- **Customer Portal** - PWA for booking tracking and communication
- **Payment Processing** - Stripe integration with deposit system

### **⚡ Technical Features**
- **Next.js 15** - Latest React framework with App Router
- **Prisma ORM** - Type-safe database operations
- **Supabase** - PostgreSQL database with real-time features
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - Modern, responsive design
- **PWA Support** - Offline-capable mobile experience

### **🛡️ Security Features**
- **NextAuth.js** - Secure authentication system
- **Role-based access control** - Admin, notary, and customer roles
- **Webhook signature verification** - HMAC-SHA256 for all integrations
- **Rate limiting** - Protection against abuse
- **Environment variable protection** - Secure configuration management

## 📋 **Quick Start**

### **Prerequisites**
- Node.js >= 18.0.0
- pnpm package manager
- Supabase account and project
- GoHighLevel account with API access
- Stripe account for payment processing

### **Installation**

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd hmnp-site
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="https://..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   
   # Authentication
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="http://localhost:3000"
   
   # GoHighLevel Integration
   GHL_API_KEY="..."
   GHL_LOCATION_ID="..."
   GHL_WEBHOOK_SECRET="..."
   
   # Stripe
   STRIPE_SECRET_KEY="..."
   STRIPE_WEBHOOK_SECRET="..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
   ```

3. **Set up database:**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma db push
   
   # Seed initial data (optional)
   pnpm prisma db seed
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Verify installation:**
   - Visit `http://localhost:3000`
   - Check admin portal at `http://localhost:3000/admin`
   - Test booking flow at `http://localhost:3000/booking`

## 📚 **Documentation**

### **Setup Guides**
- **[GHL Integration](docs/GHL_SETUP_GUIDE_2025.md)** - Complete GoHighLevel setup guide
- **[RON Setup](docs/PROOF_RON_SETUP_GUIDE.md)** - Remote online notarization setup
- **[Security Guide](docs/SECURITY_GUIDE.md)** - Security implementation and best practices
- **[AI Integration](docs/GEMINI_AI_INTEGRATION.md)** - Gemini AI integration guide

### **Reference Documentation**
- **[GHL API Capabilities](docs/GHL_API_CAPABILITIES.md)** - GoHighLevel API reference
- **[Database Maintenance](docs/DATABASE_MAINTENANCE_GUIDE.md)** - Database maintenance procedures
- **[Data Retention Policy](docs/DATA_RETENTION_POLICY.md)** - Data retention and privacy
- **[Job Queue System](docs/job-queue.md)** - Background job processing

### **Business Documentation**
- **[Production Setup](PRODUCTION_SETUP_GUIDE.md)** - Production deployment guide
- **[Booking System](BOOKING_SYSTEM_README.md)** - Booking system documentation
- **[Fee Schedule](fee-schedule.md)** - Service pricing and fees
- **[Standard Operating Procedures](sop.md)** - Business procedures

### **Templates**
- **[Email Templates](templates/HMNP_PROFESSIONAL_EMAIL_TEMPLATES.md)** - Professional email templates
- **[Reminder Template](templates/24_HOUR_REMINDER_TEMPLATE.md)** - Appointment reminder template
- **[Review Request Template](templates/REVIEW_REQUEST_TEMPLATE.md)** - Customer review requests

## 🏗️ **Project Structure**

```
hmnp-site/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin portal
│   ├── booking/           # Booking system
│   ├── notary/            # Notary portal
│   ├── portal/            # Customer portal
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── booking/          # Booking components
│   └── portal/           # Portal components
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication utilities
│   ├── ghl/              # GoHighLevel integration
│   ├── stripe/           # Stripe integration
│   └── utils/            # General utilities
├── prisma/               # Database schema and migrations
├── docs/                 # Documentation
├── templates/            # Email and content templates
├── archive/              # Historical documentation
└── public/               # Static assets
```

## 🔧 **Development**

### **Available Scripts**

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript checks

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma db push   # Push schema changes
pnpm prisma db seed   # Seed database
pnpm prisma studio    # Open Prisma Studio

# Testing
pnpm test             # Run tests
pnpm test:e2e         # Run end-to-end tests
```

### **Environment Setup**

**Development:**
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🚀 **Deployment**

### **Vercel Deployment (Recommended)**

1. **Connect to Vercel:**
   ```bash
   npx vercel --prod
   ```

2. **Set environment variables in Vercel dashboard**

3. **Deploy:**
   ```bash
   git push origin main
   ```

### **Database Deployment**

The application uses Supabase for the database:

1. **Create Supabase project**
2. **Run migrations:**
   ```bash
   pnpm prisma db push
   ```
3. **Seed initial data:**
   ```bash
   pnpm prisma db seed
   ```

## 📊 **Monitoring & Analytics**

### **Built-in Analytics**
- **Booking Analytics** - Real-time booking metrics
- **Revenue Tracking** - Payment and revenue analytics
- **Performance Monitoring** - System health and performance
- **Error Tracking** - Comprehensive error logging

### **Integration Analytics**
- **GoHighLevel Integration** - Workflow and automation metrics
- **Stripe Analytics** - Payment processing analytics
- **Customer Analytics** - Customer behavior and conversion tracking

## 🛡️ **Security**

### **Authentication & Authorization**
- **NextAuth.js** - Secure session management
- **Role-based access** - Admin, notary, customer roles
- **Protected routes** - Automatic route protection
- **Session security** - Secure session handling

### **Data Protection**
- **Environment variables** - Secure configuration
- **Database security** - Supabase security features
- **API security** - Rate limiting and validation
- **Webhook security** - HMAC signature verification

### **Compliance**
- **Data retention** - Automated data cleanup
- **Privacy protection** - Customer data protection
- **Audit logging** - Comprehensive activity logging

## 📈 **Business Features**

### **Booking System**
- **Multi-step wizard** - Guided booking process
- **Real-time availability** - Live calendar integration
- **Service customization** - Add-on services
- **Payment processing** - Secure deposit system
- **Confirmation system** - Automated confirmations

### **Admin Portal**
- **Dashboard** - Business overview and metrics
- **Booking management** - Complete booking control
- **Service area management** - Geographic service areas
- **Pricing engine** - Dynamic pricing system
- **User management** - Staff and notary management
- **Analytics** - Business intelligence

### **Notary Portal**
- **Assignment management** - View and manage assignments
- **Mobile optimization** - Mobile-friendly interface
- **RON sessions** - Remote online notarization
- **Journal entries** - Digital notary journal
- **Analytics** - Personal performance metrics

### **Customer Portal**
- **Booking tracking** - Real-time booking status
- **Document management** - Secure document storage
- **Communication** - Direct messaging system
- **Payment management** - Payment history and processing
- **PWA support** - Offline-capable mobile app

## 📞 **Support**

For technical support or questions:

- **Documentation:** Check the `docs/` directory for detailed guides
- **Issues:** Check application logs and error tracking
- **Database:** Use Prisma Studio for database management
- **Deployment:** Refer to `PRODUCTION_SETUP_GUIDE.md`

## 📈 **Expected Results**

With this comprehensive system:

- **Booking Conversion:** 80-95% form completion rate
- **Payment Collection:** 90-95% payment completion
- **Operational Efficiency:** 95% automation of routine tasks
- **Customer Satisfaction:** Improved through better communication
- **Revenue Growth:** 30-50% increase through automation

---

**🎉 Your Houston Mobile Notary business now has a world-class digital platform!**