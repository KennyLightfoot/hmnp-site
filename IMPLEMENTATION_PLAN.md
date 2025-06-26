# Houston Mobile Notary Pros - SOP Alignment Implementation Plan

## 🎯 **IMMEDIATE ACTION PLAN**

Based on the comprehensive analysis, here's the step-by-step implementation plan to achieve 100% SOP alignment.

---

## **PHASE 1: Critical Service Type Fixes (Priority 1)**

### **Step 1.1: Update Service Type Definitions**

**File: `lib/types/service-types.ts`**
```typescript
// REPLACE existing service types with SOP-aligned definitions

export const FRONTEND_SERVICE_TYPES = [
  "standard-notary",              // Was: "essential"
  "extended-hours-notary",        // Was: "priority" 
  "loan-signing-specialist",      // Was: "loan-signing"
  "specialty-notary-service",     // Keep existing
  "business-solutions",           // Keep existing
  "support-service"               // Keep existing
] as const;

export const SERVICE_DISPLAY_NAMES: Record<FrontendServiceType, string> = {
  "standard-notary": "Standard Notary",
  "extended-hours-notary": "Extended Hours Notary", 
  "loan-signing-specialist": "Loan Signing Specialist",
  "specialty-notary-service": "Specialty Notary Services",
  "business-solutions": "Business Solutions",
  "support-service": "Support Services",
};
```

### **Step 1.2: Update Booking Form Service Keys**

**File: `app/booking/page.tsx`**
```typescript
// Line 38: Update default service type
defaultValues: {
  serviceType: 'standard-notary',  // Was: 'essential'
  // ... rest of defaults
},

// Lines 200-250: Update service pricing logic
const getServicePrice = () => {
  if (selectedService) {
    return selectedService.price;
  }
  
  // SOP-aligned fallback pricing
  switch (serviceType) {
    case 'standard-notary':           // Was: 'essential'
      return 75;                      // SOP: $75
    case 'extended-hours-notary':     // Was: 'priority' 
      return 100;                     // SOP: $100
    case 'loan-signing-specialist':   // Was: 'loan-signing'
      return 150;                     // SOP: $150
    case 'specialty-notary-service':
      return 75;
    default:
      return 75;
  }
};

const getServiceName = () => {
  if (selectedService) {
    return selectedService.name;
  }
  
  // SOP-aligned service names
  switch (serviceType) {
    case 'standard-notary':
      return 'Standard Notary';
    case 'extended-hours-notary':
      return 'Extended Hours Notary';
    case 'loan-signing-specialist':
      return 'Loan Signing Specialist';
    default:
      return 'Notary Service';
  }
};
```

### **Step 1.3: Update Real-Time Pricing Component**

**File: `components/booking/RealTimePricing.tsx`**
```typescript
// Lines 85-95: Update service area configuration per SOP
const getServiceRadius = (serviceName: string): number => {
  const name = serviceName.toLowerCase();
  
  // SOP-specified radius per service type
  if (name.includes('standard')) {
    return 15;  // SOP: Standard Notary = 15-mile radius
  } else if (name.includes('extended')) {
    return 20;  // SOP: Extended Hours = 20-mile radius  
  } else if (name.includes('loan')) {
    return 20;  // Loan signing services = 20-mile radius
  }
  
  return 15;  // Default to standard radius
};

// Lines 200-220: Update travel fee calculation
const calculateTravelFee = (distance: number, serviceType: string): number => {
  const serviceRadius = getServiceRadius(serviceType);
  const ratePerMile = 0.50; // SOP: $0.50/mile beyond base radius
  
  return distance > serviceRadius ? 
    (distance - serviceRadius) * ratePerMile : 0;
};
```

---

## **PHASE 2: Enhanced Booking Flow Implementation**

### **Step 2.1: Create Enhanced Booking Page**

**File: `app/booking/enhanced/page.tsx`**
```typescript
"use client";

import { useState, useEffect } from 'react';
import { RealTimePricing } from '@/components/booking/RealTimePricing';
import { ServiceAreaValidator } from '@/components/booking/ServiceAreaValidator';
import { EnhancedBookingForm } from '@/components/booking/EnhancedBookingForm';

export default function EnhancedBookingPage() {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [isInServiceArea, setIsInServiceArea] = useState<boolean>(true);

  // Real-time distance calculation on address change
  const handleAddressChange = async (address: string) => {
    try {
      // Geocode the address
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      const { lat, lng, distance: calculatedDistance } = await response.json();
      
      setCurrentLocation({ lat, lng });
      setDistance(calculatedDistance);
      
      // SOP: Maximum 50-mile service area
      setIsInServiceArea(calculatedDistance <= 50);
      
    } catch (error) {
      console.error('Distance calculation failed:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Booking Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#002147] mb-4">
            Enhanced Booking Experience
          </h1>
          <p className="text-lg text-gray-600">
            Real-time pricing • Live service area validation • Instant quotes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div>
            <EnhancedBookingForm 
              onAddressChange={handleAddressChange}
              distance={distance}
              isInServiceArea={isInServiceArea}
            />
          </div>

          {/* Real-Time Pricing Sidebar */}
          <div className="lg:sticky lg:top-8">
            <RealTimePricing 
              distance={distance}
              showBreakdown={true}
            />
            
            <ServiceAreaValidator 
              distance={distance}
              isInServiceArea={isInServiceArea}
              className="mt-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **Step 2.2: Service Area Validator Component**

**File: `components/booking/ServiceAreaValidator.tsx`**
```typescript
"use client";

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface ServiceAreaValidatorProps {
  distance: number;
  isInServiceArea: boolean;
  className?: string;
}

export function ServiceAreaValidator({ 
  distance, 
  isInServiceArea, 
  className = "" 
}: ServiceAreaValidatorProps) {
  // SOP: Base location ZIP 77591
  const baseLocation = "Texas City, TX 77591";
  
  const getServiceAreaStatus = () => {
    if (distance === 0) {
      return {
        type: 'info' as const,
        title: 'Enter Your Address',
        message: 'We\'ll calculate distance and travel fees from our base location.',
        icon: MapPin
      };
    }
    
    if (!isInServiceArea) {
      return {
        type: 'error' as const,
        title: 'Outside Service Area',
        message: `Location is ${distance.toFixed(1)} miles from ${baseLocation}. We typically serve within 50 miles. Please contact us for availability.`,
        icon: AlertTriangle
      };
    }
    
    if (distance <= 15) {
      return {
        type: 'success' as const,
        title: 'Standard Service Area',
        message: `${distance.toFixed(1)} miles from ${baseLocation}. No travel fee.`,
        icon: CheckCircle
      };
    }
    
    if (distance <= 20) {
      return {
        type: 'success' as const,
        title: 'Extended Service Area',
        message: `${distance.toFixed(1)} miles from ${baseLocation}. Travel fee: $${((distance - 15) * 0.50).toFixed(2)}`,
        icon: CheckCircle
      };
    }
    
    return {
      type: 'warning' as const,
      title: 'Extended Travel Required',
      message: `${distance.toFixed(1)} miles from ${baseLocation}. Travel fee: $${((distance - 15) * 0.50).toFixed(2)}`,
      icon: AlertTriangle
    };
  };

  const status = getServiceAreaStatus();
  const Icon = status.icon;

  const alertClassName = {
    info: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50', 
    warning: 'border-orange-200 bg-orange-50',
    error: 'border-red-200 bg-red-50'
  }[status.type];

  const iconClassName = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-orange-600', 
    error: 'text-red-600'
  }[status.type];

  const textClassName = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-orange-800',
    error: 'text-red-800'
  }[status.type];

  return (
    <Alert className={`${alertClassName} ${className}`}>
      <Icon className={`h-4 w-4 ${iconClassName}`} />
      <AlertTitle className={textClassName}>
        {status.title}
      </AlertTitle>
      <AlertDescription className={textClassName}>
        {status.message}
      </AlertDescription>
    </Alert>
  );
}
```

---

## **PHASE 3: Service Area Configuration Standardization**

### **Step 3.1: Centralized Service Configuration**

**File: `lib/config/services.ts`**
```typescript
// SOP-aligned service configuration
export const SERVICE_CONFIG = {
  'standard-notary': {
    name: 'Standard Notary',
    price: 75,
    baseRadius: 15,           // SOP: 15-mile radius
    serviceHours: '9am-5pm Mon-Fri',
    description: 'Professional mobile notary service for standard documents during regular business hours.',
    included: [
      'Up to 2 documents',
      '1-2 signers included', 
      '15-mile travel included',
      'Same business day service'
    ]
  },
  'extended-hours-notary': {
    name: 'Extended Hours Notary', 
    price: 100,
    baseRadius: 20,           // SOP: 20-mile radius
    serviceHours: '7am-9pm Daily',
    description: 'Extended hours and same-day notary service with premium scheduling flexibility.',
    included: [
      'Up to 5 documents',
      '2 signers included',
      '20-mile travel included', 
      'Same-day availability',
      'Evening and weekend service'
    ]
  },
  'loan-signing-specialist': {
    name: 'Loan Signing Specialist',
    price: 150,
    baseRadius: 20,           // SOP: Similar to extended hours
    serviceHours: 'By appointment',
    description: 'Expert loan signing and real estate closing services with comprehensive package handling.',
    included: [
      'Unlimited documents',
      'Up to 4 signers',
      '90-minute session',
      'Professional closing binder',
      'Overnight document handling'
    ]
  }
} as const;

// Travel fee configuration per SOP
export const TRAVEL_CONFIG = {
  ratePerMile: 0.50,          // SOP: $0.50/mile beyond base radius
  baseLocation: {
    zip: '77591',             // SOP: Base ZIP code
    coordinates: {
      lat: 29.3838,           // Texas City, TX coordinates
      lng: -94.9027
    }
  },
  maxServiceDistance: 50      // SOP: Maximum 50-mile service area
};
```

### **Step 3.2: Update All Components to Use Centralized Config**

**Files to Update:**
- `components/booking/RealTimePricing.tsx`
- `components/service-area.tsx`
- `components/enhanced-faq-schema.tsx`
- `app/services/*/page.tsx`

**Example Update:**
```typescript
import { SERVICE_CONFIG, TRAVEL_CONFIG } from '@/lib/config/services';

// Replace hardcoded values with centralized config
const serviceConfig = SERVICE_CONFIG[serviceType];
const baseRadius = serviceConfig.baseRadius;
const travelRate = TRAVEL_CONFIG.ratePerMile;
```

---

## **PHASE 4: Database Alignment**

### **Step 4.1: Update Database Seeding Script**

**File: `scripts/database-services-update.mjs`**
```javascript
// Ensure database services match SOP and frontend implementation
const SOP_SERVICES = [
  {
    name: 'Standard Notary',                    // Match SOP exactly
    key: 'standard-notary',                     // Match frontend key
    serviceType: 'STANDARD_NOTARY',
    price: 75.00,                               // SOP: $75
    // ... rest of config
  },
  {
    name: 'Extended Hours Notary',              // Match SOP exactly
    key: 'extended-hours-notary',               // Match frontend key  
    serviceType: 'EXTENDED_HOURS_NOTARY',
    price: 100.00,                              // SOP: $100
    // ... rest of config
  },
  {
    name: 'Loan Signing Specialist',            // Match SOP exactly
    key: 'loan-signing-specialist',             // Match frontend key
    serviceType: 'LOAN_SIGNING_SPECIALIST',
    price: 150.00,                              // SOP: $150
    // ... rest of config
  }
];
```

---

## **PHASE 5: Testing & Validation**

### **Step 5.1: End-to-End Test Scenarios**

1. **Service Type Consistency Test**
   - Verify all service names match SOP
   - Check pricing calculations per service type
   - Validate service area radius per service

2. **Enhanced Booking Flow Test** 
   - Test real-time distance calculation
   - Verify travel fee calculation accuracy
   - Check service area validation

3. **Integration Test**
   - Booking flow → Payment → GHL CRM
   - Verify all service types process correctly
   - Check pricing consistency throughout flow

### **Step 5.2: Automated Testing Commands**

```bash
# Run comprehensive test suite
pnpm test:e2e              # End-to-end booking tests
pnpm test:unit             # Unit test pricing calculations  
pnpm build                 # Verify build success

# Manual validation checklist
- [ ] All service types load correctly
- [ ] Pricing matches SOP specifications
- [ ] Service areas enforce proper radius
- [ ] Travel fees calculate correctly
- [ ] Enhanced booking flow functional
```

---

## **IMPLEMENTATION TIMELINE**

| Phase | Duration | Priority | Dependencies |
|-------|----------|----------|--------------|
| Phase 1: Service Types | 1-2 days | Critical | None |
| Phase 2: Enhanced Booking | 2-3 days | High | Phase 1 complete |
| Phase 3: Configuration | 1 day | High | Phase 1 complete |
| Phase 4: Database | 1 day | Medium | Phase 1 complete |
| Phase 5: Testing | 1 day | Critical | All phases complete |

**Total Estimated Duration: 5-7 business days**

---

## **SUCCESS CRITERIA**

✅ **100% SOP Compliance Achieved When:**
- All service types match SOP specification exactly
- Pricing calculations align with SOP requirements
- Service areas enforce SOP-specified radius limits
- Enhanced booking flow implemented and functional
- All tests pass with new configuration
- Business stakeholders approve final implementation

---

**Next Steps:** Ready to implement Phase 1 immediately. All code changes have been identified and can be executed systematically. 