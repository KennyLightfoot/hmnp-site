# CodeRabbit Analysis Prompt - Houston Mobile Notary Pros

## 🎯 **Primary Objective**
Analyze the Houston Mobile Notary Pros web application for production readiness, ensuring 100% compliance with the Enhanced Standard Operating Procedures (SOP_ENHANCED.md) and identifying any blockers for client onboarding and advertising campaigns.

## 🔍 **Key Analysis Areas**

### 1. **Production Readiness Assessment**
- **Security Vulnerabilities**: Review all authentication, payment processing, and data handling for security gaps
- **Performance Bottlenecks**: Identify slow queries, unoptimized API endpoints, and frontend performance issues
- **Error Handling**: Ensure comprehensive error boundaries and graceful failure handling
- **Environment Configuration**: Validate all required environment variables are properly documented and implemented
- **SSL/HTTPS**: Confirm secure connection handling throughout the application

### 2. **Business Logic Validation (SOP Compliance)**
Please cross-reference all code against SOP_ENHANCED.md requirements:

#### **Booking System Compliance**
- ✅ Multi-signer booking functionality (up to 4 signers for Loan Signing)
- ✅ Real-time pricing with distance calculation from ZIP 77591
- ✅ Service area geofencing enforcement (15-mile Standard, 20-mile Extended)
- ✅ Travel fee automation ($0.50/mile beyond included radius)
- ✅ Service tier pricing: Standard ($75), Extended Hours ($100), Loan Signing ($150)
- ✅ Weekend surcharge (+$40) and after-hours surcharge (+$30) implementation

#### **Payment Processing Compliance**
- ✅ Stripe integration with 50% deposit requirement for bookings >$100
- ✅ Corporate Net-15 billing capability
- ✅ Refund and cancellation policy enforcement
- ✅ Texas fee compliance (notarial acts max $10 each)

#### **Communication Automation**
- ✅ 24-hour and 2-hour reminder automation via GHL
- ✅ Email/SMS confirmation system
- ✅ Online rescheduling functionality
- ✅ Post-service follow-up workflow (same day, 24 hours, 1 week)

### 3. **Code Quality & Architecture Review**

#### **Duplicate Code Detection**
- Identify redundant components, utilities, or API endpoints
- Flag similar business logic scattered across different files
- Recommend consolidation opportunities

#### **TypeScript Implementation**
- Ensure 100% TypeScript coverage with proper typing
- Validate Zod schemas match database models
- Check for `any` types that should be properly typed

#### **Database Optimization**
- Review Prisma schema for proper indexing
- Identify N+1 query problems
- Validate data retention policies (7-year requirement)

#### **API Design Consistency**
- Ensure RESTful API patterns are followed
- Validate error response standardization
- Check for proper HTTP status code usage

### 4. **Integration Health Check**

#### **GoHighLevel (GHL) Integration**
- Verify webhook handlers are robust and include proper error handling
- Confirm contact creation and workflow triggers work reliably
- Validate custom field mapping and data synchronization

#### **Third-Party Services**
- **Stripe**: Payment webhook reliability and failure handling
- **Google Maps API**: Distance calculation accuracy and rate limiting
- **Proof.com RON**: Future integration readiness (Phase 2)
- **Email/SMS**: Delivery tracking and bounce handling

### 5. **Frontend/UX Critical Review**

#### **Mobile Responsiveness**
- PWA functionality and offline capability
- Touch-friendly booking interface
- Performance on mobile networks

#### **Conversion Optimization**
- Booking flow friction points
- Payment process abandonment risks
- Trust signals and credibility elements

#### **Accessibility Compliance**
- WCAG 2.1 AA compliance for broader market reach
- Screen reader compatibility
- Keyboard navigation support

### 6. **Marketing & SEO Readiness**

#### **Ad Campaign Compliance**
- Landing page optimization for Facebook/Google Ads
- Conversion tracking implementation
- Legal compliance for advertising claims

#### **SEO Implementation**
- Meta tags and structured data
- Service area pages optimization
- Local SEO for Houston market

### 7. **Monitoring & Observability**

#### **Error Tracking**
- Sentry integration completeness
- Business-critical error alerting
- Performance monitoring setup

#### **Analytics Implementation**
- Business KPI tracking (booking completion rate >85%, payment success >95%)
- Customer acquisition cost tracking
- Revenue attribution and reporting

### 8. **Legal & Compliance**

#### **Data Protection**
- GDPR compliance implementation
- Client data retention and purging automation
- Privacy policy and terms of service integration

#### **Texas Notary Law Compliance**
- Fee structure legal compliance
- E&O insurance requirement enforcement
- Record keeping requirements implementation

## 🚨 **Critical Production Blockers to Flag**

1. **Security vulnerabilities** that could expose client data
2. **Payment processing failures** that could lose revenue
3. **Booking system bugs** that could prevent client acquisition
4. **Performance issues** that could impact user experience
5. **Integration failures** that could break automated workflows
6. **Legal compliance gaps** that could create liability

## 📊 **Expected Deliverables**

1. **Production Readiness Score** (0-100%) with specific improvement areas
2. **Security Audit Report** with vulnerability prioritization
3. **Performance Optimization Recommendations** with impact estimates
4. **Code Consolidation Plan** for duplicate/redundant code
5. **SOP Compliance Gap Analysis** with implementation roadmap
6. **Go-Live Checklist** with remaining tasks for client onboarding

## 💼 **Business Context**
This is a first-time entrepreneur's notary services business targeting the Houston market. The application needs to handle real money transactions, legal document notarizations, and client communications with zero margin for error. Success metrics include booking conversion rates, client satisfaction, and operational efficiency.

## 🔧 **Technical Stack Context**
- **Frontend**: Next.js 15+ with TypeScript, TailwindCSS, Radix UI
- **Backend**: Next.js API routes, PostgreSQL (Neon), Redis (Upstash)
- **Payments**: Stripe with webhook handling
- **CRM**: GoHighLevel integration
- **Deployment**: Vercel with edge functions
- **Monitoring**: Sentry error tracking

**Goal**: Identify the final 5% of work needed to reach 100% production readiness for immediate client onboarding and advertising launch. 