# Simple Booking System Architecture
**Houston Mobile Notary Pros - Back to Basics**

## 🎯 Core Purpose
A simple, functional booking system that gets customers from inquiry to confirmed appointment in under 2 minutes.

### What We Need:
1. ✅ Simple form to collect booking details
2. ✅ Basic price calculation (service + distance)
3. ✅ Payment processing
4. ✅ Email confirmation

### What We DON'T Need:
- ❌ Multi-step wizards with progress bars
- ❌ Real-time pricing with debouncing
- ❌ Upsell suggestions and conversion optimization
- ❌ Slot reservations with countdown timers
- ❌ Complex state management

## 🏗️ Simple Architecture

### Single Page Form
/booking - One page with all fields
├── Service Selection (radio buttons)
├── Customer Information (name, email, phone)
├── Location (address for mobile services)
├── Date & Time Selection
├── Price Display (auto-calculated)
└── Payment Button (Stripe)

### 3 API Endpoints Only
/api/booking/calculate-price - Calculate total price
/api/booking/create - Create booking + payment
/api/booking/confirm - Email confirmation

### Database Schema
-- Simple bookings table
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  service_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  location_address TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  travel_fee DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW()
);

## 💰 Simple Pricing Logic

### Service Base Prices
const SERVICE_PRICES = {
  'STANDARD_NOTARY': 75,
  'EXTENDED_HOURS': 100,
  'LOAN_SIGNING': 150,
  'RON_SERVICES': 35
};

### Travel Fee Calculation
function calculateTravelFee(distance: number): number {
  if (distance <= 15) return 0;  // Free within 15 miles
  return (distance - 15) * 0.50; // $0.50 per mile beyond 15
}

### Total Price Formula
const totalPrice = basePrice + travelFee;
// NO surcharges, discounts, or complex calculations

## 📱 Simple Form Component (200 lines max)

Create ONE component that replaces the entire BookingWizard:

```typescript
function SimpleBookingForm() {
  const [formData, setFormData] = useState({
    serviceType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    bookingTime: '',
    locationAddress: ''
  });
  
  const [price, setPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate price when service or location changes
  useEffect(() => {
    if (formData.serviceType && (formData.serviceType === 'RON_SERVICES' || formData.locationAddress)) {
      calculatePrice();
    }
  }, [formData.serviceType, formData.locationAddress]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <ServiceSelector />
      <CustomerFields />
      {formData.serviceType !== 'RON_SERVICES' && <AddressField />}
      <DateTimeFields />
      <PriceDisplay price={price} />
      <StripePaymentButton amount={price} />
    </form>
  );
}
```

## 🔌 Simple API Implementation

### Price Calculation API (/api/booking/calculate-price)
```typescript
export async function POST(request: Request) {
  const { serviceType, address } = await request.json();
  
  const basePrice = SERVICE_PRICES[serviceType];
  let travelFee = 0;
  
  if (address && serviceType !== 'RON_SERVICES') {
    const distance = await calculateDistance(address); // Simple Google Maps call
    travelFee = calculateTravelFee(distance);
  }
  
  return NextResponse.json({
    basePrice,
    travelFee,
    totalPrice: basePrice + travelFee
  });
}
```

### Booking Creation API (/api/booking/create)
```typescript
export async function POST(request: Request) {
  const bookingData = await request.json();
  
  // 1. Validate form data
  // 2. Calculate final price
  // 3. Create Stripe payment intent
  // 4. Save booking to database
  // 5. Send confirmation email
  
  return NextResponse.json({ success: true, booking });
}
```

## ⚠️ What NOT to Add Back
- Multi-step wizards
- Real-time pricing updates
- Upsell suggestions
- Conversion optimization
- Advanced analytics
- Complex state management
- Slot reservations
- Progress indicators

Keep it simple. Keep it functional.

## 🎯 Implementation Guidelines

### Decision Making:
- When in doubt, delete it
- Simple > Feature-rich
- Replace, don't patch
- Function > Form

### Code Quality:
- Maximum 200 lines per component
- Clear, readable functions
- No over-engineering
- Basic error handling only

### Success Criteria:
- Customer can complete booking in under 2 minutes
- Price calculation works correctly
- Stripe payment processing functional
- Email confirmation sent
- Booking saved to database

*The goal is a booking form that works reliably for a small notary business, not a showcase of advanced development techniques.*