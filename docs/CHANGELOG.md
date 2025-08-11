# Changelog

All notable changes to Houston Mobile Notary Pros will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **AI Receptionist System** - Complete intelligent customer service automation
  - Real-time distance calculation and travel fee computation
  - Live calendar availability checking via GoHighLevel integration
  - Function calling system for dynamic data retrieval
  - Location context capture via geolocation and ZIP code detection
  - Intelligent response processing with style guide formatting
  - Comprehensive error handling and fallback responses

### Technical Improvements
#### 2025-02-XX
- Add Node runtime hints to server APIs to prevent accidental Edge bundling
  - `app/api/booking/create/route.ts`: `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`
  - `app/api/ai/chat/route.ts`: `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`
- Reduce build-time warnings from BullMQ by lazy-loading Node-only worker
  - `lib/bullmq/booking-processor.ts`: dynamic import of `Worker` behind `WORKER_MODE` guard
- Hardened scheduling UI against strict TS (`noUncheckedIndexedAccess`)
  - `components/booking/steps/EnhancedSchedulingStep.tsx`: guard `days[0]?.date`
- **Function Calling Infrastructure**
  - `/api/_ai/get-distance` - Distance calculation API using Google Maps
  - `/api/_ai/get-availability` - Real-time calendar availability checking
  - Enhanced Vertex AI integration with function tool definitions
  - Automatic function execution loop with result feedback
  - Location context detection and processing

- **Chat Widget Enhancements**
  - Automatic location detection via browser geolocation
  - ZIP code reverse geocoding for accurate distance calculations
  - Scheduling intent detection for proactive location capture
  - Enhanced context passing to AI for personalized responses
  - Improved error handling and user experience

- **Testing Suite**
  - Comprehensive unit tests for distance and availability APIs
  - Integration tests for function calling flow
  - Mock services for reliable testing
  - Error scenario coverage and edge case handling

## [2025-01-14] - AI Foundation Release

### Added
- **Vertex AI Integration**
  - Google Cloud Vertex AI chat system
  - RAG (Retrieval-Augmented Generation) corpus integration
  - Streaming response processing
  - Context-aware response generation
  - Style guide enforcement for consistent responses

- **Chat Widget System**
  - Floating chat interface with mobile optimization
  - Proactive engagement based on page context
  - Voice input support with speech recognition
  - Quick action buttons for common requests
  - Conversation history and session management

### Enhanced
- **Response Quality**
  - Universal style guide for consistent AI responses
  - Temperature and token limits optimized for accuracy
  - Automatic call-to-action generation
  - Professional tone and branding alignment

## [2024-12-XX] - Previous Major Updates

### Added
- **Database Standardization**
  - Complete migration to Supabase PostgreSQL
  - Unified database configuration across environments
  - Improved connection pooling and performance

- **Booking System Enhancements**
  - Fixed critical Prisma relationship field naming issues
  - Improved booking success rate to 100%
  - Enhanced error handling and validation

- **RON (Remote Online Notarization)**
  - Complete RON system implementation
  - Proof.com integration for secure sessions
  - 24/7 availability with automated workflows
  - Texas-compliant pricing and documentation

### Technical Improvements
- **Winston Logging Removal**
  - Replaced Winston with Vercel-compatible console logging
  - Improved deployment reliability
  - Reduced bundle size and complexity

- **CI/CD Pipeline**
  - Green build status achieved
  - Automated testing and deployment
  - Health endpoint monitoring

### Security
- **Enhanced Authentication**
  - NextAuth.js integration
  - Secure session management
  - CSRF protection and rate limiting

## Architecture Notes

### AI Receptionist System Architecture

```
User Message → Chat Widget → Location Detection → AI Chat API
                                                       ↓
Enhanced Context → Vertex AI → Function Calls → Internal APIs
                                                       ↓
Distance API ← Function Results ← Availability API
     ↓                                  ↓
Google Maps API                    GHL Calendar API
     ↓                                  ↓
Travel Fee Calculation         Real-time Availability
     ↓                                  ↓
     → Combined Response → Vertex AI → Final Answer → User
```

### Key Components

1. **Chat Widget** (`components/ai/AIChatWidget.tsx`)
   - Location detection and context capture
   - Intent recognition for scheduling/location queries
   - Automatic geolocation and ZIP code detection

2. **AI Chat API** (`app/api/ai/chat/route.ts`)
   - Context processing and enhancement
   - Location context integration
   - Function calling coordination

3. **Vertex AI Service** (`lib/vertex.ts`)
   - Function tool definitions and execution
   - Streaming response processing
   - Style guide enforcement

4. **Helper APIs**
   - `/api/_ai/get-distance` - Distance and travel fee calculation
   - `/api/_ai/get-availability` - Calendar availability checking

### Environment Variables

New environment variables for AI functionality:
- `VERTEX_CHAT_PROMPT_ID` - Vertex AI prompt template ID
- `VERTEX_RAG_CORPUS` - RAG corpus for document retrieval
- `VERTEX_MODEL_ID` - AI model configuration
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Service account for API access

### Testing

- **Unit Tests**: Individual API endpoint testing
- **Integration Tests**: End-to-end function calling flow
- **Mock Services**: Reliable testing without external dependencies
- **Error Scenarios**: Comprehensive error handling validation

---

## Support

For technical questions or issues:
- **Email**: support@houstonmobilenotarypros.com
- **Phone**: (832) 617-4285
- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues

## Contributors

- Development Team: Houston Mobile Notary Pros
- AI Integration: Claude Sonnet 4 (Cursor AI Assistant)
- Testing: Automated Test Suite 