# GHL Calendar Integration Architecture
## Houston Mobile Notary Pros - Phase 2 Implementation Plan

### 🎯 **INTEGRATION OVERVIEW**

**Current State**: 90% of GHL infrastructure already exists!
**Remaining Work**: Connect existing booking system to existing GHL calendar system
**Timeline**: 3-5 days (much faster than originally planned)

---

## 📋 **EXISTING INFRASTRUCTURE ANALYSIS**

### ✅ **Already Built & Working**

**1. GHL API Layer** (`lib/ghl/management.ts`):
```typescript
✅ createAppointment(appointmentData: AppointmentData)
✅ getCalendarSlots(calendarId, startDate, endDate)  
✅ updateAppointment(appointmentId, appointmentData)
✅ addContactToWorkflow(contactId, workflowId)
```

**2. REST API Endpoints**:
```typescript
✅ GET /api/ghl/availability?calendarId&startDate&endDate
```

**3. Calendar Configuration** (7 service-specific calendars):
```typescript
✅ GHL_STANDARD_NOTARY_CALENDAR_ID
✅ GHL_EXTENDED_HOURS_CALENDAR_ID  
✅ GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID
✅ GHL_REVERSE_MORTGAGE_CALENDAR_ID
✅ GHL_SPECIALTY_CALENDAR_ID
✅ GHL_CALLS_CALENDAR_ID
✅ GHL_BOOKING_CALENDAR_ID
```

**4. Authentication & Environment**:
```typescript
✅ GHL_PRIVATE_INTEGRATION_TOKEN (working)
✅ GHL_LOCATION_ID (configured)
✅ GHL_API_BASE_URL (services.leadconnectorhq.com)
```

---

## 🔄 **INTEGRATION POINTS NEEDED**

### **1. Service-to-Calendar Mapping**

Map our 4 services to appropriate GHL calendars:

```typescript
const SERVICE_CALENDAR_MAPPING = {
  'STANDARD_NOTARY': process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
  'EXTENDED_HOURS': process.env.GHL_EXTENDED_HOURS_CALENDAR_ID,
  'LOAN_SIGNING': process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID,
  'RON_SERVICES': process.env.GHL_BOOKING_CALENDAR_ID // or dedicated RON calendar
};
```

### **2. Booking API Enhancement**

Update `/api/booking/create/route.ts` to:
```typescript
// AFTER creating booking in our database:
1. Create contact in GHL (if not exists)
2. Create appointment in appropriate GHL calendar  
3. Add contact to booking confirmation workflow
4. Return appointment ID along with booking confirmation
```

### **3. Frontend Availability Integration**

Update `SimpleBookingForm.tsx` to:
```typescript
// BEFORE showing time picker:
1. Fetch available slots from /api/ghl/availability
2. Show only available time slots to customer
3. Block unavailable times in real-time
```

---

## 🛠️ **IMPLEMENTATION TASKS**

### **Task 1: Service-Calendar Mapping** (1 day)

**File**: `lib/ghl/calendar-mapping.ts`
```typescript
export function getCalendarIdForService(serviceType: string): string {
  const mapping = {
    'STANDARD_NOTARY': process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
    'EXTENDED_HOURS': process.env.GHL_EXTENDED_HOURS_CALENDAR_ID,
    'LOAN_SIGNING': process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID,
    'RON_SERVICES': process.env.GHL_BOOKING_CALENDAR_ID
  };
  
  const calendarId = mapping[serviceType as keyof typeof mapping];
  if (!calendarId) {
    throw new Error(`No calendar configured for service: ${serviceType}`);
  }
  
  return calendarId;
}
```

### **Task 2: Enhanced Booking API** (1-2 days)

**File**: `/app/api/booking/create/route.ts` 
```typescript
// Add after database booking creation:

// 1. Create/update GHL contact
const contact = await upsertContact({
  firstName: validatedData.customerName.split(' ')[0],
  lastName: validatedData.customerName.split(' ').slice(1).join(' '),
  email: validatedData.customerEmail,
  phone: validatedData.customerPhone,
  customField: {
    // Map booking data to GHL custom fields
    booking_service_type: validatedData.serviceType,
    booking_total_amount: validatedData.pricing.totalPrice,
    booking_address: validatedData.addressStreet
  }
});

// 2. Create GHL appointment
const calendarId = getCalendarIdForService(validatedData.serviceType);
const appointment = await createAppointment({
  calendarId,
  contactId: contact.id,
  startTime: validatedData.scheduledDateTime,
  endTime: new Date(new Date(validatedData.scheduledDateTime).getTime() + (service.duration * 60000)).toISOString(),
  title: `${service.name} - ${validatedData.customerName}`,
  address: validatedData.addressStreet,
  appointmentStatus: 'confirmed'
});

// 3. Add to workflow
await addContactToWorkflow(contact.id, process.env.GHL_NEW_BOOKING_WORKFLOW_ID);

// 4. Update our booking record with GHL IDs
await prisma.booking.update({
  where: { id: booking.id },
  data: {
    ghlContactId: contact.id,
    ghlAppointmentId: appointment.id
  }
});
```

### **Task 3: Availability API** (1 day)

**File**: `/app/api/booking/availability/route.ts`
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const serviceType = searchParams.get('serviceType');
  const date = searchParams.get('date'); // YYYY-MM-DD
  
  // Get calendar for service
  const calendarId = getCalendarIdForService(serviceType);
  
  // Get available slots for the day
  const startDate = `${date}T00:00:00.000Z`;
  const endDate = `${date}T23:59:59.999Z`;
  
  const slots = await getCalendarSlots(calendarId, startDate, endDate);
  
  return NextResponse.json({
    success: true,
    availableSlots: slots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: true
    }))
  });
}
```

### **Task 4: Frontend Integration** (1-2 days)

**File**: `components/booking/SimpleBookingForm.tsx`
```typescript
// Add availability fetching:
const [availableSlots, setAvailableSlots] = useState([]);

useEffect(() => {
  if (formData.serviceType && formData.bookingDate) {
    fetchAvailableSlots();
  }
}, [formData.serviceType, formData.bookingDate]);

const fetchAvailableSlots = async () => {
  const response = await fetch(`/api/booking/availability?serviceType=${formData.serviceType}&date=${formData.bookingDate}`);
  const data = await response.json();
  setAvailableSlots(data.availableSlots);
};

// Update time picker to show only available slots
<select 
  value={formData.bookingTime} 
  onChange={(e) => handleChange('bookingTime', e.target.value)}
>
  {availableSlots.map(slot => (
    <option key={slot.startTime} value={slot.startTime}>
      {formatTime(slot.startTime)}
    </option>
  ))}
</select>
```

---

## 🧪 **TESTING STRATEGY**

### **1. GHL API Connection Test**
```bash
# Test calendar availability
curl "/api/ghl/availability?calendarId=YOUR_CALENDAR_ID&startDate=2024-01-15T00:00:00Z&endDate=2024-01-15T23:59:59Z"

# Expected: List of available time slots
```

### **2. End-to-End Booking Test**
```typescript
1. ✅ Select service type → Should load correct calendar
2. ✅ Select date → Should show available time slots  
3. ✅ Complete booking → Should create appointment in GHL
4. ✅ Check GHL dashboard → Appointment should appear
5. ✅ Check workflows → Contact should enter booking workflow
```

### **3. Integration Health Check**
```typescript
// New endpoint: /api/health/ghl
- Test GHL API connection
- Verify all calendar IDs are accessible  
- Check workflow IDs are valid
- Validate contact creation works
```

---

## 📊 **SUCCESS METRICS**

### **Phase 2 Complete When**:
- ✅ Customer can see real GHL availability
- ✅ Booking creates appointment in correct GHL calendar
- ✅ Contact is created/updated in GHL CRM
- ✅ Workflows trigger automatically 
- ✅ No double-booking conflicts
- ✅ Admin can view bookings in GHL dashboard

### **Performance Targets**:
- ✅ Availability lookup: < 2 seconds
- ✅ Booking creation: < 5 seconds (including GHL)
- ✅ Real-time calendar sync: < 30 seconds
- ✅ Webhook processing: < 1 second

---

## 🎯 **IMMEDIATE NEXT STEPS**

**Once database migration completes**:

1. **Day 1**: Create service-calendar mapping utility
2. **Day 2**: Enhance booking API with GHL appointment creation  
3. **Day 3**: Build availability API endpoint
4. **Day 4**: Update frontend to show GHL availability
5. **Day 5**: End-to-end testing and refinement

**Estimated Timeline**: 1 week instead of 2-3 weeks originally planned!

---

## 💡 **KEY ADVANTAGES OF THIS APPROACH**

1. **Single Source of Truth**: GHL calendars manage all availability
2. **No Conflicts**: Real-time availability prevents double-booking
3. **Workflow Automation**: Automatic follow-ups via GHL
4. **Admin Simplicity**: Notaries manage everything in GHL
5. **Customer Experience**: Always see accurate availability
6. **Integration Benefits**: CRM + Calendar + Notifications in one system

**Bottom Line**: We're connecting two working systems (our booking app + GHL calendar) rather than building from scratch!