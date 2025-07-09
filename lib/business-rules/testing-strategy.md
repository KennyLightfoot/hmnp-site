# Business Rules Testing Strategy
## Houston Mobile Notary Pros - Validation & Testing Plan

**Date:** January 24, 2025  
**Purpose:** Define testing approach for business rules implementation

---

## 🎯 **Testing Objectives**

1. **Validate Business Logic**: Ensure all business rules are correctly implemented
2. **Verify GHL Integration**: Confirm automation works as expected
3. **Test Edge Cases**: Handle unusual scenarios gracefully
4. **Performance Validation**: Ensure rules don't impact system performance
5. **User Experience**: Confirm transparent and clear customer communication

---

## 📋 **Test Categories**

### **1. Service Area Validation Tests**

#### **Test Cases:**
```typescript
describe('Service Area Business Rules', () => {
  test('Should allow service within 60-mile maximum', () => {
    const result = validateServiceArea({
      distance: 45,
      serviceType: 'STANDARD_NOTARY'
    });
    expect(result.isValid).toBe(true);
    expect(result.ghlActions.tags).toContain('service_area:extended_range');
  });

  test('Should reject service beyond 60-mile maximum', () => {
    const result = validateServiceArea({
      distance: 65,
      serviceType: 'STANDARD_NOTARY'
    });
    expect(result.isValid).toBe(false);
    expect(result.violations).toContain('Distance exceeds maximum service area');
  });

  test('Should classify zones correctly for GHL tagging', () => {
    const tests = [
      { distance: 15, expectedZone: 'service_area:houston_metro' },
      { distance: 35, expectedZone: 'service_area:extended_range' },
      { distance: 55, expectedZone: 'service_area:maximum_range' }
    ];
    
    tests.forEach(({ distance, expectedZone }) => {
      const result = validateServiceArea({ distance, serviceType: 'STANDARD_NOTARY' });
      expect(result.ghlActions.tags).toContain(expectedZone);
    });
  });
});
```

### **2. Document Limits Tests**

#### **Test Cases:**
```typescript
describe('Document Limits Business Rules', () => {
  test('Should calculate extra document fees correctly', () => {
    const result = validateDocumentLimits({
      serviceType: 'STANDARD_NOTARY',
      documentCount: 5 // limit is 2, so 3 extra docs
    });
    expect(result.extraFees).toBe(21); // 3 * $7 = $21
    expect(result.ghlActions.tags).toContain('docs:over_limit');
  });

  test('Should detect HELOC restrictions', () => {
    const result = validateDocumentLimits({
      serviceType: 'STANDARD_NOTARY',
      documentCount: 1,
      documentTypes: ['HELOC']
    });
    expect(result.isValid).toBe(false);
    expect(result.violations).toContain('HELOC documents require office space');
    expect(result.ghlActions.workflows).toContain('GHL_DOCUMENT_RESTRICTION_WORKFLOW_ID');
  });

  test('Should allow unlimited documents for loan signing', () => {
    const result = validateDocumentLimits({
      serviceType: 'LOAN_SIGNING',
      documentCount: 100
    });
    expect(result.extraFees).toBe(0);
    expect(result.ghlActions.tags).toContain('docs:under_limit');
  });
});
```

### **3. Pricing Transparency Tests**

#### **Test Cases:**
```typescript
describe('Pricing Transparency Business Rules', () => {
  test('Should provide detailed fee breakdown', () => {
    const result = validatePricing({
      serviceType: 'STANDARD_NOTARY',
      basePrice: 75,
      travelFee: 10,
      extraDocumentFees: 14,
      discounts: 15
    });
    
    expect(result.breakdown).toEqual({
      baseService: 75,
      travelFee: 10,
      extraDocumentFees: 14,
      discounts: -15,
      totalPrice: 84
    });
    expect(result.ghlActions.customFields.cf_fee_breakdown).toBeDefined();
  });

  test('Should apply first-time customer discount', () => {
    const result = validatePricing({
      serviceType: 'STANDARD_NOTARY',
      customerType: 'first_time',
      basePrice: 75
    });
    
    expect(result.appliedDiscounts).toContain('first_time');
    expect(result.ghlActions.tags).toContain('pricing:discount_applied');
  });
});
```

### **4. Cancellation Policy Tests**

#### **Test Cases:**
```typescript
describe('Cancellation Policy Business Rules', () => {
  test('Should allow full refund with 2+ hour notice', () => {
    const scheduledTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours from now
    const result = validateCancellation({
      reason: 'schedule_conflict',
      scheduledDateTime: scheduledTime,
      requestedAt: new Date()
    });
    
    expect(result.refundEligibility.amount).toBe('full_deposit');
    expect(result.ghlActions.tags).toContain('cancellation:full_refund');
  });

  test('Should handle weather cancellations specially', () => {
    const scheduledTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    const result = validateCancellation({
      reason: 'severe_weather',
      isWeatherRelated: true,
      scheduledDateTime: scheduledTime,
      requestedAt: new Date()
    });
    
    expect(result.refundEligibility.amount).toBe('full_deposit');
    expect(result.ghlActions.tags).toContain('cancellation:weather_exception');
  });

  test('Should handle no-show policy', () => {
    const pastTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const result = validateCancellation({
      reason: 'no_show',
      scheduledDateTime: pastTime,
      requestedAt: new Date()
    });
    
    expect(result.refundEligibility.amount).toBe(0);
    expect(result.ghlActions.tags).toContain('cancellation:no_show');
  });
});
```

---

## 🚀 **Integration Tests**

### **End-to-End Business Rules Flow**

```typescript
describe('Complete Business Rules Integration', () => {
  test('Should process full booking with all business rules', async () => {
    const booking = {
      serviceType: 'STANDARD_NOTARY',
      customerLocation: 'Houston, TX 77002',
      documentCount: 3, // Over limit
      documentTypes: ['contract', 'affidavit'],
      customerType: 'first_time',
      scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const result = await processBookingWithBusinessRules(booking);

    // Service area validation
    expect(result.serviceArea.isValid).toBe(true);
    expect(result.serviceArea.zone).toBe('houston_metro');

    // Document limits with extra fees
    expect(result.documentLimits.extraFees).toBe(7); // 1 extra doc * $7
    expect(result.documentLimits.ghlActions.tags).toContain('docs:over_limit');

    // Pricing transparency
    expect(result.pricing.breakdown.extraDocumentFees).toBe(7);
    expect(result.pricing.breakdown.discounts).toBe(-15); // First-time discount

    // GHL integration
    expect(result.ghlActions.customFields.cf_service_distance).toBeDefined();
    expect(result.ghlActions.customFields.cf_extra_doc_fees).toBe(7);
    expect(result.ghlActions.tags).toContain('pricing:discount_applied');
  });
});
```

---

## 🧪 **GHL Integration Tests**

### **Custom Fields Creation**

```typescript
describe('GHL Custom Fields Integration', () => {
  test('Should create all required business rule custom fields', async () => {
    const requiredFields = [
      'cf_service_distance',
      'cf_travel_fee', 
      'cf_service_zone',
      'cf_document_count',
      'cf_extra_doc_fees',
      'cf_fee_breakdown',
      'cf_cancellation_reason'
    ];

    for (const fieldKey of requiredFields) {
      const field = await ghl.getCustomField(fieldKey);
      expect(field).toBeDefined();
      expect(field.isActive).toBe(true);
    }
  });
});
```

### **Workflow Automation Tests**

```typescript
describe('GHL Workflow Integration', () => {
  test('Should trigger appropriate workflows for business rule violations', async () => {
    const mockContact = { id: 'test_contact_123' };
    
    // Test HELOC restriction workflow
    await triggerBusinessRuleWorkflow(mockContact.id, {
      ruleType: 'documentLimits',
      violation: 'restricted_document',
      documentType: 'HELOC'
    });

    const workflowHistory = await ghl.getWorkflowHistory(mockContact.id);
    expect(workflowHistory).toContainWorkflow('GHL_DOCUMENT_RESTRICTION_WORKFLOW_ID');
  });
});
```

---

## 📊 **Performance Tests**

### **Response Time Validation**

```typescript
describe('Business Rules Performance', () => {
  test('Should validate business rules within 500ms', async () => {
    const startTime = Date.now();
    
    const result = await BusinessRulesEngine.validateAll({
      serviceType: 'STANDARD_NOTARY',
      location: 'Houston, TX 77001',
      documentCount: 5,
      scheduledDateTime: new Date()
    });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(500);
    expect(result.isValid).toBeDefined();
  });

  test('Should handle concurrent validations efficiently', async () => {
    const requests = Array(10).fill(null).map((_, i) => ({
      serviceType: 'STANDARD_NOTARY',
      location: `Houston, TX 7700${i}`,
      documentCount: i + 1
    }));

    const startTime = Date.now();
    const results = await Promise.all(
      requests.map(req => BusinessRulesEngine.validateAll(req))
    );
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(2000); // All 10 requests in under 2 seconds
    expect(results).toHaveLength(10);
    results.forEach(result => expect(result.isValid).toBeDefined());
  });
});
```

---

## 🎯 **Manual Testing Scenarios**

### **User Acceptance Tests**

1. **Service Area Testing:**
   - Book service at 25 miles → Should work, no extra fees
   - Book service at 45 miles → Should work, travel fees applied
   - Book service at 65 miles → Should be rejected with clear message

2. **Document Limits Testing:**
   - Standard service with 2 docs → Normal pricing
   - Standard service with 4 docs → Extra document fees shown
   - Any service with HELOC → Restriction message shown

3. **Pricing Transparency Testing:**
   - All fees shown upfront in booking flow
   - Fee breakdown clearly explained
   - First-time customer sees discount applied

4. **Cancellation Policy Testing:**
   - Cancel 4 hours before → Full refund available
   - Cancel 1 hour before → No refund policy explained
   - Weather cancellation → Special exception handling

---

## ✅ **Success Criteria**

### **Functional Requirements:**
- [ ] All business rules enforced correctly
- [ ] GHL automation triggers properly
- [ ] Clear customer communication
- [ ] Policy compliance maintained

### **Performance Requirements:**
- [ ] Rule validation < 500ms
- [ ] No impact on booking flow speed
- [ ] GHL API calls optimized

### **Integration Requirements:**
- [ ] Seamless pricing engine integration
- [ ] Real-time GHL updates
- [ ] Proper error handling
- [ ] Audit trail maintained

**Ready to start building and testing!** 🚀 