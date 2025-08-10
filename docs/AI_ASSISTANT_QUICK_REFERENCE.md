# AI Assistant Quick Reference Guide
## Houston Mobile Notary Pros

---

## 🚨 **CRITICAL BUSINESS RULES - NEVER BREAK**

### **Service Limits**
- **Quick-Stamp Local**: 1 document, 2 stamps max
- **Standard Mobile**: 4 documents max  
- **Extended Hours**: 4 documents max
- **Loan Signing**: Unlimited documents (single package)
- **RON**: 10 documents max

### **Service Areas**
- **Quick-Stamp**: 10-mile radius from 77591
- **Standard Mobile**: 20-mile radius from 77591
- **Extended Hours**: 30-mile radius from 77591
- **Loan Signing**: 30-mile radius from 77591
- **Maximum**: 60 miles (with approval)

### **Pricing (2025)**
- **Quick-Stamp Local**: $50 base
- **Standard Mobile**: $75 base
- **Extended Hours**: $100 base
- **Loan Signing**: $150 flat fee
- **RON**: $25 session + $5 per seal
- **Travel**: $0.50/mile beyond included radius

### **Restrictions**
- ❌ **NEVER** accept HELOC documents (no office space)
- ❌ **NEVER** explain loan terms (notary role only)
- ❌ **NEVER** book outside 60-mile maximum
- ❌ **NEVER** break document limits without approval

---

## 🛠 **TECHNICAL QUICK REFERENCE**

### **Key Technologies**
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma (PostgreSQL), NextAuth
- **AI**: Google Cloud Vertex AI (gemini-2.5-flash)
- **Integrations**: GHL (CRM), Stripe (payments), Google Maps
- **Infrastructure**: Vercel, Supabase, Redis (Upstash)

### **Important Files**
- **Pricing Engine**: `lib/pricing-engine.ts`
- **Business Rules**: `lib/business-rules/config.ts`
- **Database Schema**: `prisma/schema.prisma`
- **AI Chat**: `app/api/ai/chat/route.ts`
- **Booking Flow**: `app/booking/enhanced/page.tsx`

### **Environment Variables**
```bash
# Required for AI functionality (Vertex AI)
GOOGLE_SERVICE_ACCOUNT_JSON={...}
GOOGLE_PROJECT_ID=your-gcp-project-id
GOOGLE_REGION=us-central1
VERTEX_MODEL_ID=gemini-2.5-flash
# Optional: full resource names
VERTEX_CHAT_PROMPT_ID=projects/your-project/locations/us-central1/promptTemplates/hmnp_constitution_v1
VERTEX_RAG_CORPUS=projects/your-project/locations/us-central1/ragCorpora/hmnp-notary-corpus
GOOGLE_MAPS_API_KEY=your-key

# Required for integrations
GHL_PRIVATE_INTEGRATION_TOKEN=pit_...
GHL_LOCATION_ID=...
STRIPE_SECRET_KEY=your-stripe-key
DATABASE_URL=your-supabase-url
```

---

## 🎯 **COMMON TASKS & SOLUTIONS**

### **Pricing Issues**
- **Problem**: Inconsistent pricing across systems
- **Solution**: Update `lib/pricing-engine.ts` and `lib/business-rules/config.ts`
- **Check**: Verify all pricing engines are aligned

### **Service Area Problems**
- **Problem**: Distance calculation errors
- **Solution**: Check Google Maps API integration in `lib/maps/`
- **Cache**: Use Redis for distance calculations

### **Booking Flow Issues**
- **Problem**: Form validation errors
- **Solution**: Check Zod schemas in `lib/validation/`
- **Test**: Use `pnpm test:unit` for validation tests

### **AI Chat Problems**
- **Problem**: AI responses inaccurate
- **Solution**: Check Vertex AI configuration and function calling
- **Debug**: Review `lib/vertex.ts` and function definitions

### **Database Issues**
- **Problem**: Prisma errors or missing data
- **Solution**: Run `pnpm db:migrate` and `pnpm db:seed`
- **Check**: Verify DATABASE_URL in environment

---

## 🔧 **DEVELOPMENT COMMANDS**

```bash
# Setup
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed

# Development
pnpm dev                    # Start development server
pnpm test:unit             # Run unit tests
pnpm test:e2e              # Run end-to-end tests
pnpm lint                  # Check code quality
pnpm type-check            # TypeScript validation

# Database
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database
pnpm db:maintenance        # Database maintenance

# Deployment
pnpm build                 # Production build
git push origin main       # Deploy to Vercel
```

---

## 📊 **BUSINESS CONTEXT**

### **What We Do**
- **Mobile Notary Services**: Come to client locations
- **Remote Online Notarization**: Secure online sessions
- **Loan Signing Specialist**: Real estate document closings
- **Business Subscriptions**: Monthly plans for regular clients

### **Target Market**
- **Individuals**: Simple document notarization
- **Real Estate**: Loan closings and property documents
- **Businesses**: Regular notary needs
- **Legal**: Document authentication and verification

### **Competitive Advantages**
- **Mobile Service**: Convenience of coming to clients
- **Extended Hours**: 7am-9pm daily availability
- **RON Services**: 24/7 remote notarization
- **Technology**: AI-powered booking and customer service
- **Professional**: Licensed, insured, experienced

---

## 🚨 **EMERGENCY PROCEDURES**

### **System Down**
1. Check Vercel status page
2. Verify environment variables
3. Check Sentry for error logs
4. Rollback to previous deployment if needed

### **Payment Issues**
1. Check Stripe dashboard
2. Verify webhook signatures
3. Check GHL payment sync
4. Review payment audit logs

### **Booking System Issues**
1. Check GHL calendar integration
2. Verify availability API responses
3. Check pricing engine calculations
4. Review booking validation logs

### **AI System Issues**
1. Check Vertex AI quota and status
2. Verify function calling responses
3. Check Google Maps API limits
4. Review AI conversation logs

---

## 📞 **ESCALATION CONTACTS**

### **When to Escalate**
- **Critical System Outages**: Immediate escalation
- **Payment Processing Failures**: High priority
- **Data Loss or Corruption**: Immediate escalation
- **Security Breaches**: Immediate escalation
- **Business Rule Violations**: High priority

### **Documentation Priority**
1. **SOP_ENHANCED.md**: Business procedures
2. **PROJECT_OVERVIEW.md**: Complete project context
3. **AI_RECEPTIONIST.md**: AI system details
4. **BUSINESS_LOGIC_PLANNING.md**: Business rules

---

*Use this guide for quick decision-making. For detailed information, refer to the full PROJECT_OVERVIEW.md* 