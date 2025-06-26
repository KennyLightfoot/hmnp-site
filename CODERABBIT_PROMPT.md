# CodeRabbit Analysis Prompt for Houston Mobile Notary Pros

## **PROJECT OVERVIEW**
Analyze this production-ready Next.js 15+ mobile notary and loan signing web application for Houston Mobile Notary Pros. The application is 95% complete and ready for client onboarding, but requires optimization and SOP compliance fixes.

---

## **TECH STACK SPECIFICS**

### **Core Technologies**
- **Framework:** Next.js 15.3.3 with App Router
- **Language:** TypeScript 5.6.2 with strict type checking
- **Styling:** TailwindCSS with custom Auburn (#A52A2A) and Oxford Blue (#002147) branding
- **UI Components:** Radix UI with shadcn/ui component library
- **State Management:** React Hook Form with Zod validation
- **Authentication:** NextAuth.js with JWT and email verification

### **Backend & Database**
- **Database:** PostgreSQL (Neon) with Prisma ORM 6.7.0
- **Caching:** Redis (Upstash) for high-performance API responses
- **Queue System:** BullMQ for background job processing
- **File Storage:** AWS S3 with ClamAV virus scanning

### **Third-Party Integrations**
- **CRM:** GoHighLevel (GHL) complete integration with workflows
- **Payments:** Stripe with webhooks and automated billing
- **Maps/Geocoding:** Google Maps API for distance calculation
- **Email:** Resend for transactional emails
- **SMS:** Integrated via GHL
- **RON Platform:** Proof.com integration (Phase 2)

---

## **APP ARCHITECTURE**

### **Next.js 15+ App Router Implementation**
- **Directory Structure:** `/app` with proper route organization
- **Server Components:** Used where appropriate for SEO and performance
- **Client Components:** Marked with "use client" directive
- **API Routes:** RESTful endpoints in `/app/api/*`
- **Middleware:** Authentication and security middleware implemented
- **Layout System:** Proper layout.tsx files for consistent UI

### **Key Patterns**
- **Server-Side Rendering:** For SEO-critical pages
- **Static Generation:** For service pages and content
- **Dynamic Routes:** For booking confirmations and user portals
- **API Route Protection:** Authentication middleware on sensitive endpoints

---

## **MAIN FEATURES**

### **Core Business Functions**
1. **Multi-Service Booking System**
   - Standard Notary ($75, 15-mile radius)
   - Extended Hours Notary ($100, 20-mile radius)
   - Loan Signing Specialist ($150, flat fee)
   - Real-time pricing with distance calculation

2. **Advanced Scheduling & Calendar**
   - Google Calendar integration
   - Multi-signer booking support
   - Automated availability checking
   - Timezone handling

3. **Payment Processing**
   - Stripe integration with webhooks
   - Deposit handling for high-value services
   - Automated invoicing and receipts
   - Payment status tracking

4. **CRM & Automation**
   - GHL integration with custom workflows
   - Automated appointment reminders (24h, 2h)
   - Lead nurturing and follow-up sequences
   - Contact management and tagging

5. **User Management**
   - Role-based access (CLIENT, NOTARY, ADMIN)
   - User portals for booking management
   - Profile management and preferences
   - Invitation and onboarding system

6. **Document Management**
   - Secure file upload/download
   - Document versioning and tracking
   - RON session management (Phase 2)
   - Compliance and audit trails

---

## **CURRENT PAIN POINTS & ISSUES**

### **Critical SOP Alignment Issues**
1. **Service Type Misalignment**
   - Code uses: 'essential', 'priority', 'loan-signing'
   - SOP requires: 'standard-notary', 'extended-hours-notary', 'loan-signing-specialist'
   - **Impact:** Client confusion, SEO problems, pricing inconsistencies

2. **Enhanced Booking Flow Missing**
   - SOP specifies: `/booking/enhanced` with real-time pricing
   - Current: Directory exists but is EMPTY
   - Main booking at `/booking/page.tsx` instead

3. **Service Area Radius Inconsistencies**
   - Multiple conflicting values: 15-mile, 20-mile, 30-mile
   - SOP specification: Standard = 15-mile, Extended Hours = 20-mile
   - Hardcoded in multiple components

### **Technical Debt & Optimization Opportunities**
1. **Pricing Logic Scattered**
   - Real-time pricing calculations in multiple files
   - Fallback logic instead of database-driven pricing
   - Inconsistent travel fee calculations

2. **Component Duplication**
   - Similar booking forms in multiple locations
   - Redundant pricing components
   - Duplicate service type definitions

3. **Configuration Management**
   - Service areas hardcoded in components
   - Pricing constants scattered across files
   - Missing centralized configuration

---

## **PROJECT SIZE & COMPLEXITY**

### **Codebase Statistics**
- **Total Files:** 171 pages compiled successfully
- **Lines of Code:** ~50,000+ lines
- **Components:** 100+ React components
- **API Routes:** 50+ endpoints
- **Database Models:** 20+ Prisma models
- **Test Coverage:** E2E and unit tests implemented

### **Build Performance**
- **Build Time:** 2.5 minutes (optimized)
- **Bundle Size:** 2.05 MB first load JS
- **Memory Usage:** Optimized with webpackMemoryOptimizations
- **Performance Score:** 95/100 (Lighthouse)

---

## **SPECIFIC ANALYSIS REQUESTS**

### **1. SOP Compliance Analysis**
- Identify all service type mismatches between code and SOP requirements
- Find pricing calculation inconsistencies
- Locate service area radius conflicts
- Map missing enhanced booking flow requirements

### **2. Code Quality & Best Practices**
- Analyze Next.js 15+ App Router implementation
- Check TypeScript usage and type safety
- Review component architecture and reusability
- Assess API route structure and error handling

### **3. Performance & Optimization**
- Identify bundle size optimization opportunities
- Find unused dependencies and dead code
- Analyze component rendering performance
- Check for memory leaks and optimization issues

### **4. Security & Compliance**
- Review authentication and authorization patterns
- Check for security vulnerabilities in API routes
- Analyze data validation and sanitization
- Assess PCI DSS compliance for payment processing

### **5. Duplicate & Redundant Code**
- Find duplicate components and utilities
- Identify redundant API endpoints
- Locate duplicate business logic
- Check for unused or deprecated code

### **6. Database & Data Layer**
- Analyze Prisma schema and migrations
- Check for N+1 query issues
- Review database connection management
- Assess data validation and integrity

---

## **EXPECTED DELIVERABLES**

### **1. Critical Issues Report**
- Prioritized list of SOP compliance issues
- Service type alignment recommendations
- Pricing logic consolidation plan
- Enhanced booking flow implementation guide

### **2. Code Quality Assessment**
- Next.js 15+ best practices compliance
- TypeScript usage and improvement opportunities
- Component architecture recommendations
- Performance optimization suggestions

### **3. Technical Debt Analysis**
- Duplicate code identification and consolidation plan
- Unused dependencies and dead code removal
- Configuration management improvements
- Security vulnerability assessment

### **4. Implementation Roadmap**
- Phase 1: Critical SOP fixes (1-2 days)
- Phase 2: Enhanced booking implementation (2-3 days)
- Phase 3: Code quality improvements (1-2 days)
- Phase 4: Performance optimization (1 day)

---

## **SUCCESS CRITERIA**

### **SOP Compliance (Target: 100%)**
- [ ] All service types match SOP specification
- [ ] Pricing calculations align with SOP requirements
- [ ] Service areas enforce SOP-specified radius limits
- [ ] Enhanced booking flow implemented and functional

### **Code Quality (Target: 95%+)**
- [ ] Next.js 15+ best practices fully implemented
- [ ] TypeScript strict mode compliance
- [ ] Component reusability and maintainability
- [ ] API route security and error handling

### **Performance (Target: 90%+)**
- [ ] Lighthouse performance score >90
- [ ] Bundle size optimization
- [ ] Memory usage optimization
- [ ] Build time optimization

---

## **CONTEXT & PRIORITIES**

### **Business Context**
- **Production Status:** 95% ready for client onboarding
- **Timeline:** Need 100% SOP compliance within 1 week
- **Priority:** Service type alignment and enhanced booking flow
- **Budget:** Optimize for cost-effective fixes

### **Technical Priorities**
1. **Critical:** Fix service type misalignment (blocking issue)
2. **High:** Implement enhanced booking flow
3. **Medium:** Consolidate pricing logic
4. **Low:** Performance optimizations

### **Risk Assessment**
- **High Risk:** Service type mismatches causing client confusion
- **Medium Risk:** Missing enhanced booking flow
- **Low Risk:** Performance optimizations

---

**Please provide a comprehensive analysis focusing on the critical SOP compliance issues while also identifying opportunities for code quality improvements and performance optimization.** 