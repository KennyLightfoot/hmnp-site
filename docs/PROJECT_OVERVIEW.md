# Houston Mobile Notary Pros - Project Overview

## 🏢 **Business Overview**

**Houston Mobile Notary Pros (HMNP)** is a professional mobile notary and loan signing service operating in Houston, Texas. We provide on-site notary services, remote online notarization (RON), and specialized loan signing services to individuals and businesses.

### **Core Services**
- **Quick-Stamp Local**: $50 - Fast & simple local signings (≤1 doc, ≤2 stamps, 10-mile radius)
- **Standard Mobile Notary**: $75 - Professional service (≤4 docs, ≤2 signers, 20-mile radius)
- **Extended Hours Mobile**: $100 - Flexible scheduling (≤4 docs, ≤2 signers, 30-mile radius, 7am-9pm daily)
- **Loan Signing Specialist**: $150 - Expert real estate closings (single package, ≤4 signers, 2 hours)
- **Remote Online Notarization (RON)**: $25/session + $5/seal - 24/7 remote service
- **Business Subscriptions**: $125/month Essentials, $349/month Growth

### **Service Area**
- **Base Location**: ZIP code 77591 (Houston area)
- **Service Radii**: 10-30 miles depending on service type
- **Extended Travel**: $0.50/mile beyond included radius
- **Maximum Range**: 60 miles (with approval)

### **Business Rules**
- **Document Limits**: Service-specific limits with extra fees for overages
- **Restricted Documents**: HELOC (no office space available)
- **Weather Policy**: Manual cancellation and client communication for extreme weather
- **Payment**: Stripe integration with deposit requirements
- **Cancellation**: 24-hour notice required for refunds

---

## 🛠 **Technology Stack**

### **Frontend**
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React Hook Form + Zod validation
- **UI Components**: Custom component library with shadcn/ui patterns

### **Backend**
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Supabase
- **API**: Next.js API routes with RESTful design
- **Validation**: Zod schemas throughout

### **AI & Intelligence**
- **AI Chat**: Google Cloud Vertex AI (gemini-2.5-flash)
- **RAG System**: Custom corpus for accurate responses
- **Function Calling**: Dynamic API integration
- **Location Intelligence**: Google Maps API integration
- **Natural Language Processing**: Context-aware conversations

### **Integrations**
- **CRM**: GoHighLevel (GHL) for contact management and workflows
- **Payments**: Stripe for payment processing
- **Calendar**: GHL calendar integration for availability
- **RON Platform**: Notary Hub for remote notarization (Proof.com integration has been decommissioned)
- **Email**: Resend for transactional emails
- **SMS**: GHL SMS integration
- **Analytics**: Vercel Analytics + custom tracking

### **Infrastructure**
- **Hosting**: Vercel (production)
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis (Upstash)
- **File Storage**: AWS S3
- **Monitoring**: Sentry for error tracking
- **Feature Flags**: LaunchDarkly

### **Development Tools**
- **Package Manager**: pnpm
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Linting**: ESLint + Next.js config
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky for pre-commit checks

---

## 🏗 **System Architecture**

### **Core Components**

#### **1. Booking System**
- **Enhanced Booking Flow**: `/booking/enhanced` with real-time pricing
- **RON Dashboard**: `/ron/dashboard` for remote notarization
- **Service Area Validation**: Automatic distance calculation
- **Pricing Engine**: Dynamic pricing with surcharges and travel fees
- **Payment Processing**: Stripe integration with deposit handling

#### **2. AI Receptionist**
- **Chat Widget**: Location-aware customer service
- **Function Calling**: Real-time data retrieval
- **Context Awareness**: Page-specific responses
- **Booking Detection**: Automatic appointment extraction
- **Streaming Responses**: Real-time conversation flow

#### **3. CRM Integration**
- **GHL Sync**: Automatic contact creation and updates
- **Workflow Automation**: Trigger-based communication
- **Calendar Management**: Real-time availability checking
- **Payment Intelligence**: Automated payment monitoring

#### **4. Pricing Engine**
- **Service Configuration**: Per-service pricing and limits
- **Travel Fee Calculation**: Google Maps integration
- **Surcharge Logic**: Time-based and urgency fees
- **Audit Logging**: Complete pricing transparency

### **Database Schema**
- **Core Models**: Booking, Service, User, Payment
- **Business Logic**: BusinessRulesConfig, ServiceAreaCache
- **Analytics**: PricingAuditLog, SystemLog, daily_metrics
- **Support**: SupportTicket, NotificationLog, Review

---

## 🚨 **Critical Guidelines & Things to Avoid**

### **Business Rules - NEVER BREAK**
1. **Document Limits**: Enforce service-specific document limits strictly
2. **Service Area**: Never book outside 60-mile maximum without approval
3. **HELOC Documents**: Never accept HELOC notarizations (no office space)
4. **Loan Explanations**: Never explain loan terms (notary role only)
5. **Weather Cancellations**: Manual process only, no automated weather cancellations
6. **Payment Requirements**: Always require deposit for active services
7. **RON Compliance**: Follow Texas RON regulations strictly

### **Technical Guidelines**
1. **Database**: Always use Prisma for database operations
2. **Environment Variables**: Use `.env.local` for local development
3. **API Routes**: Follow RESTful conventions and proper error handling
4. **TypeScript**: Maintain strict type safety throughout
5. **Testing**: Write tests for all business logic
6. **Security**: Validate all inputs, use proper authentication
7. **Performance**: Cache expensive operations (distance calculations, etc.)

### **Code Quality Standards**
1. **Naming**: Use descriptive, consistent naming conventions
2. **Error Handling**: Graceful degradation for all external services
3. **Logging**: Use structured logging for debugging
4. **Documentation**: Comment complex business logic
5. **Refactoring**: Don't break existing functionality without tests

### **Integration Guidelines**
1. **GHL API**: Handle rate limits and timeouts gracefully
2. **Stripe**: Always verify webhook signatures
3. **Google Maps**: Cache distance calculations to avoid API limits
4. **Vertex AI**: Implement proper error handling for AI responses
5. **Redis**: Use proper key naming and TTL management

### **Security Considerations**
1. **Authentication**: Always verify user permissions
2. **Data Validation**: Sanitize all user inputs
3. **API Security**: Rate limiting and CORS protection
4. **Sensitive Data**: Never log payment information or personal data
5. **Environment Variables**: Keep secrets secure and rotate regularly

---

## 📊 **Key Performance Indicators**

### **Business Metrics**
- **Booking Conversion Rate**: Website to booking completion
- **Service Area Coverage**: Percentage of requests within service area
- **Customer Satisfaction**: Review scores and feedback
- **Revenue per Booking**: Average transaction value
- **RON Adoption**: Percentage of remote vs. mobile bookings

### **Technical Metrics**
- **System Uptime**: 99.9% target
- **API Response Time**: <500ms for critical endpoints
- **Booking Flow Completion**: >80% success rate
- **AI Response Accuracy**: >90% customer satisfaction
- **Payment Success Rate**: >95% successful transactions

---

## 🔄 **Development Workflow**

### **Local Development**
```bash
# Setup
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed

# Development
pnpm dev
pnpm test:unit:watch
pnpm studio  # Sanity CMS
```

### **Deployment Process**
1. **Feature Development**: Create feature branch
2. **Testing**: Run unit and e2e tests
3. **Code Review**: Submit PR with comprehensive description
4. **Deployment**: Vercel automatic deployment on merge
5. **Monitoring**: Check Sentry and logs for issues

### **Database Management**
```bash
# Migrations
pnpm db:migrate

# Seeding
pnpm db:seed

# Maintenance
pnpm db:maintenance
```

---

## 🎯 **Current Priorities**

### **Active Development**
1. **Pricing Alignment**: Ensure all systems use consistent pricing
2. **Service Area Optimization**: Improve distance calculation accuracy
3. **AI Enhancement**: Expand function calling capabilities
4. **Performance Optimization**: Reduce API response times
5. **Testing Coverage**: Increase unit test coverage

### **Business Goals**
1. **Market Expansion**: Increase service area coverage
2. **RON Growth**: Expand remote notarization services
3. **Customer Experience**: Streamline booking process
4. **Operational Efficiency**: Automate routine tasks
5. **Revenue Growth**: Optimize pricing and conversion

---

## 📞 **Support & Communication**

### **When to Escalate**
- **Critical Bugs**: System outages or data loss
- **Security Issues**: Potential vulnerabilities or breaches
- **Business Rule Changes**: Pricing or service modifications
- **Integration Failures**: GHL, Stripe, or Google Maps issues
- **Performance Problems**: Slow response times or timeouts

### **Documentation Resources**
- **SOP**: `SOP_ENHANCED.md` - Business procedures
- **API Docs**: `docs/` directory - Technical documentation
- **Business Logic**: `docs/BUSINESS_LOGIC_PLANNING.md` - Business rules
- **AI System**: `docs/AI_RECEPTIONIST.md` - AI functionality

---

*This document should be updated as the project evolves. Last updated: January 2025* 