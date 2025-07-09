# Business Rules Phase 1 Testing Guide
## Houston Mobile Notary Pros - Verification & Testing

**Date:** January 24, 2025  
**Phase:** 1 - Critical Integration Complete  
**Status:** ✅ Ready for Testing

---

## 🎯 **What We've Implemented**

### ✅ **Phase 1 - Complete Integration**
1. **BookingForm Business Rules** - Real-time validation during booking
2. **Booking API Integration** - Business rules enforcement before database save
3. **Pricing API Enhancement** - Document limits and extra fee calculation
4. **GHL Automation** - Business rules trigger appropriate tags and workflows

---

## 🧪 **Testing Checklist**

### **Test 1: BookingForm Business Rules Validation**
**Objective**: Verify real-time business rules validation in booking form

**Steps**:
1. Navigate to `/booking` page
2. Select "Standard Notary" service
3. Enter customer information
4. **Location Step**: Enter address "1234 Test St, Conroe, TX 77384" (65+ miles from Houston)
5. **Expected Result**: 
   - ⚠️ Business policy warning appears
   - "Distance exceeds maximum service area of 60 miles"
   - Continue button should be blocked

**Pass Criteria**: ✅ Business rules validation blocks invalid service areas

---

### **Test 2: Service Area Boundary Testing**
**Objective**: Test the 60-mile service area limit

**Test Cases**:
| Address | Distance | Expected Result |
|---------|----------|-----------------|
| "Downtown Houston, TX" | ~0 miles | ✅ Allow (Houston Metro zone) |
| "Katy, TX" | ~35 miles | ✅ Allow (Extended Range zone) |
| "Huntsville, TX" | ~55 miles | ✅ Allow (Maximum Range zone) |
| "Austin, TX" | ~165 miles | ❌ Block (Beyond service area) |

**Pass Criteria**: ✅ All distances calculated correctly, 60+ mile addresses blocked

---

### **Test 3: Document Limits & Extra Fees**
**Objective**: Verify document limits enforcement and extra fee calculation

**Steps**:
1. Use pricing API: `POST /api/booking/calculate-price`
2. **Test Data**:
   ```json
   {
     "serviceType": "STANDARD_NOTARY",
     "address": "Houston, TX",
     "documentCount": 4,
     "documentTypes": ["Affidavit", "Power of Attorney", "Contract", "Deed"]
   }
   ```
3. **Expected Result**:
   ```json
   {
     "basePrice": 75,
     "travelFee": 0,
     "extraDocumentFees": 14,
     "totalPrice": 89,
     "businessRules": {
       "recommendations": ["2 additional documents will incur extra fees of $14.00"]
     }
   }
   ```

**Pass Criteria**: ✅ Extra fees calculated correctly ($7 × 2 extra docs = $14)

---

### **Test 4: HELOC Document Restriction**
**Objective**: Verify HELOC documents are properly blocked

**Steps**:
1. Use pricing API with HELOC document type:
   ```json
   {
     "serviceType": "STANDARD_NOTARY", 
     "documentTypes": ["HELOC"]
   }
   ```
2. **Expected Result**:
   ```json
   {
     "businessRules": {
       "warnings": ["HELOC documents require office space and cannot be processed"]
     }
   }
   ```

**Pass Criteria**: ✅ HELOC restriction warning appears

---

### **Test 5: Booking API Business Rules Integration**
**Objective**: Verify booking creation includes business rules validation

**Steps**:
1. Create booking via API: `POST /api/booking/create`
2. **Test Data** (valid booking):
   ```json
   {
     "serviceType": "STANDARD_NOTARY",
     "customerName": "Test Customer",
     "customerEmail": "test@example.com",
     "scheduledDateTime": "2025-01-30T14:00:00Z",
     "addressStreet": "1234 Main St",
     "addressCity": "Houston", 
     "addressState": "TX",
     "numberOfDocuments": 2,
     "pricing": {
       "basePrice": 75,
       "travelFee": 0,
       "totalPrice": 75
     }
   }
   ```
3. **Expected Result**: ✅ Booking created successfully
4. **Check Logs**: Look for business rules validation messages

**Pass Criteria**: ✅ Booking succeeds with business rules validation logged

---

### **Test 6: Business Rules Violation Blocking**
**Objective**: Verify booking API blocks invalid requests

**Steps**:
1. Create booking with invalid service area:
   ```json
   {
     "serviceType": "STANDARD_NOTARY",
     "addressStreet": "1234 Test St",
     "addressCity": "Austin",
     "addressState": "TX"
   }
   ```
2. **Expected Result**: 
   ```json
   {
     "error": "Booking violates business policies",
     "violations": ["Distance exceeds maximum service area"],
     "code": "BUSINESS_RULE_VIOLATION"
   }
   ```

**Pass Criteria**: ✅ API returns 400 error with business rule violations

---

### **Test 7: GHL Integration Logging**
**Objective**: Verify GHL automation is triggered

**Steps**:
1. Create valid booking through API
2. **Check Server Logs** for:
   - "🔍 Validating business rules for booking..."
   - "✅ Business rules validation passed"
   - "🏷️ Business rules tags: [tag names]"
   - "🤖 Applying business rules to GHL contact..."
   - "✅ Business rules applied to GHL contact"

**Pass Criteria**: ✅ All business rules and GHL integration logs appear

---

## 🔧 **Manual Testing Commands**

### **Quick Pricing Test**
```bash
curl -X POST http://localhost:3000/api/booking/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "address": "Katy, TX",
    "documentCount": 3,
    "documentTypes": ["Affidavit", "Contract", "Deed"]
  }'
```

### **Service Area Boundary Test**  
```bash
curl -X POST http://localhost:3000/api/booking/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "address": "Austin, TX"
  }'
```

### **HELOC Restriction Test**
```bash
curl -X POST http://localhost:3000/api/booking/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "STANDARD_NOTARY",
    "documentTypes": ["HELOC"]
  }'
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

**Issue**: "Cannot find module 'business-rules/engine'"
**Solution**: Check import paths in components and API files

**Issue**: Business rules validation not showing in UI  
**Solution**: Check browser console for JavaScript errors

**Issue**: Distance calculation fails
**Solution**: Verify Google Maps API key and UnifiedDistanceService

**Issue**: GHL integration not logging
**Solution**: Check GHL environment variables and API credentials

---

## 📊 **Expected Results Summary**

### **Working Features After Phase 1**
✅ **Real-time service area validation** in booking form  
✅ **Document limits enforcement** with extra fee calculation  
✅ **HELOC restriction warnings** when applicable  
✅ **Business rules API validation** before booking creation  
✅ **GHL automation tagging** based on business rules  
✅ **Enhanced pricing API** with business rule context  

### **Not Yet Implemented (Future Phases)**
❌ **Admin interface** for business rule management  
❌ **Cancellation policy automation** (Phase 4)  
❌ **Advanced GHL workflows** (Phase 3)  
❌ **Business intelligence reporting** (Phase 3)  

---

## 🎯 **Success Criteria for Phase 1**

**✅ PASS**: All 7 tests pass without errors  
**✅ PASS**: Business rules prevent invalid bookings  
**✅ PASS**: Extra fees calculated correctly  
**✅ PASS**: GHL integration logs appear  
**✅ PASS**: No breaking changes to existing functionality  

**Phase 1 Complete** = Ready for Phase 2 (Admin Interface & Advanced Features)

---

**Ready to test? Start with Test 1 and work through the checklist! 🚀** 