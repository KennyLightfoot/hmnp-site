# 🚀 Stack Migration Plan for HMNP Site

## Overview
Stack will provide a unified platform for authentication, database, storage, and edge functions, replacing the current fragmented infrastructure.

## Current Infrastructure Issues
- Multiple authentication systems (NextAuth + custom JWT)
- Separate database and storage services
- Complex API route management
- No real-time features
- Manual scaling and monitoring

## Stack Benefits for HMNP

### 1. Unified Authentication
- **Single Auth System**: Replace NextAuth + custom JWT with Stack Auth
- **Social Logins**: Easy integration with Google, Apple, etc.
- **Role-Based Access**: Built-in RBAC for customers, notaries, admins
- **Session Management**: Automatic session handling
- **Multi-Factor Auth**: Enhanced security for admin accounts

### 2. Real-time Features
- **Live Booking Updates**: Real-time notifications for booking status
- **Admin Dashboard**: Live updates for new bookings and changes
- **Chat System**: Built-in chat for customer support
- **Notifications**: Push notifications for mobile users

### 3. Simplified Database
- **Automatic Migrations**: No more manual Prisma migrations
- **Real-time Subscriptions**: Live data updates
- **Row Level Security**: Built-in data protection
- **Backup & Recovery**: Automatic backups and point-in-time recovery

### 4. File Storage
- **Document Upload**: Secure document storage for notary services
- **Image Processing**: Automatic image optimization
- **CDN**: Global content delivery
- **Version Control**: Document versioning

### 5. Edge Functions
- **API Routes**: Replace Next.js API routes with faster edge functions
- **Webhook Handlers**: Process webhooks at the edge
- **Background Jobs**: Handle email sending, notifications
- **Cron Jobs**: Automated tasks and maintenance

## Migration Strategy

### Phase 1: Authentication Migration
```typescript
// lib/stack/auth.ts
import { createClient } from '@stack/client';

export const stack = createClient({
  url: process.env.STACK_URL!,
  token: process.env.STACK_TOKEN!
});

// Replace NextAuth with Stack Auth
export async function signIn(email: string, password: string) {
  return await stack.auth.signInWithPassword({
    email,
    password
  });
}

export async function signUp(email: string, password: string, userData: any) {
  return await stack.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
}
```

### Phase 2: Database Migration
```typescript
// lib/stack/database.ts
import { stack } from './auth';

// Replace Prisma with Stack Database
export async function createBooking(bookingData: any) {
  return await stack.database
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();
}

export async function getBookings(userId: string) {
  return await stack.database
    .from('bookings')
    .select('*')
    .eq('customer_id', userId);
}
```

### Phase 3: Real-time Features
```typescript
// lib/stack/realtime.ts
import { stack } from './auth';

// Real-time booking updates
export function subscribeToBookings(userId: string, callback: Function) {
  return stack.database
    .channel('bookings')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `customer_id=eq.${userId}`
    }, callback)
    .subscribe();
}
```

### Phase 4: File Storage
```typescript
// lib/stack/storage.ts
import { stack } from './auth';

export async function uploadDocument(file: File, bookingId: string) {
  const fileName = `${bookingId}/${file.name}`;
  
  return await stack.storage
    .from('documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
}
```

## Implementation Timeline

### Week 1-2: Setup & Authentication
- [ ] Create Stack project
- [ ] Set up authentication
- [ ] Migrate user accounts
- [ ] Test auth flows

### Week 3-4: Database Migration
- [ ] Migrate database schema
- [ ] Update data access layer
- [ ] Test CRUD operations
- [ ] Set up real-time subscriptions

### Week 5-6: File Storage
- [ ] Migrate from S3 to Stack Storage
- [ ] Update file upload/download
- [ ] Test document management
- [ ] Set up CDN

### Week 7-8: Edge Functions
- [ ] Migrate API routes to edge functions
- [ ] Update webhook handlers
- [ ] Set up background jobs
- [ ] Test all integrations

### Week 9-10: Testing & Deployment
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Deploy to staging
- [ ] Deploy to production

## Environment Variables
```bash
# .env.local
STACK_URL=https://your-project.stack.co
STACK_TOKEN=your-stack-token
STACK_ANON_KEY=your-anon-key
```

## Code Changes Required

### 1. Replace NextAuth
```typescript
// Remove: lib/auth-config.ts
// Remove: app/api/auth/[...nextauth]/route.ts
// Add: lib/stack/auth.ts
```

### 2. Update API Routes
```typescript
// Remove: app/api/bookings/route.ts
// Add: stack/functions/bookings.ts (edge function)
```

### 3. Update Components
```typescript
// Update all components to use Stack client
import { stack } from '@/lib/stack/auth';
```

### 4. Update Middleware
```typescript
// middleware.ts
import { stack } from '@/lib/stack/auth';

export async function middleware(request: NextRequest) {
  // Use Stack middleware instead of NextAuth
  return await stack.middleware(request);
}
```

## Benefits After Migration

### Developer Experience
- **Faster Development**: Less boilerplate code
- **Better DX**: Type-safe database operations
- **Real-time by Default**: Built-in subscriptions
- **Simplified Deployment**: One platform to manage

### Performance
- **Faster Load Times**: Edge-based functions
- **Global CDN**: Faster content delivery
- **Optimized Queries**: Automatic query optimization
- **Caching**: Built-in caching strategies

### Cost Savings
- **Reduced Infrastructure**: One platform vs multiple services
- **Lower Bandwidth**: Edge functions reduce server load
- **Automatic Scaling**: Pay only for what you use
- **Reduced Maintenance**: Less infrastructure to manage

### Security
- **Built-in Security**: Row-level security, auth, etc.
- **Automatic Updates**: Platform handles security updates
- **Compliance**: Built-in compliance features
- **Audit Logs**: Comprehensive logging

## Rollback Plan
If migration fails:
1. Keep current infrastructure running
2. Revert environment variables
3. Rollback code changes
4. Debug issues in development
5. Retry migration with fixes

## Success Metrics
- 50% reduction in development time
- 30% improvement in page load times
- 90% reduction in infrastructure management
- 100% real-time feature coverage
- Zero downtime during migration

## Post-Migration Tasks
- [ ] Remove unused dependencies (NextAuth, Prisma, etc.)
- [ ] Update documentation
- [ ] Train team on Stack
- [ ] Optimize performance
- [ ] Set up monitoring and alerts 