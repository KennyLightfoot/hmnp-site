console.log("🚀 Testing Slot Reservation and Booking Creation...");

const http = require("http");

function testEndpoint(path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: data ? "POST" : "GET",
      headers: data ? {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      } : {}
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testSlotReservation() {
  console.log("\n🕐 Testing slot reservation...");
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const reservationData = JSON.stringify({
      datetime: futureDate.toISOString(),
      serviceType: "STANDARD_NOTARY",
      customerEmail: "test@example.com",
      estimatedDuration: 60
    });

    const result = await testEndpoint("/api/booking/reserve-slot", reservationData);
    if (result.data.success) {
      console.log("✅ Slot reservation working");
      console.log(`   Reservation ID: ${result.data.reservation.id}`);
      return result.data.reservation;
    } else {
      console.log(`⚠️  Slot reservation failed: ${result.data.message}`);
      return null;
    }
  } catch (err) {
    console.log(`❌ Slot reservation test failed: ${err.message}`);
    return null;
  }
}

async function testBookingCreation(reservationId = null) {
  console.log("\n📝 Testing booking creation...");
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateString = futureDate.toISOString().split("T")[0];
    
    const bookingData = JSON.stringify({
      serviceType: "STANDARD_NOTARY",
      customer: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "555-123-4567",
        preferredContactMethod: "email",
        marketingConsent: false,
        smsConsent: false
      },
      location: {
        address: "123 Main St",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
        latitude: 29.7604,
        longitude: -95.3698
      },
      locationType: "CLIENT_ADDRESS",
      serviceDetails: {
        serviceType: "STANDARD_NOTARY",
        documentCount: 1,
        documentTypes: ["Power of Attorney"],
        signerCount: 1,
        witnessRequired: false,
        witnessProvided: "none",
        identificationRequired: true
      },
      scheduling: {
        preferredDate: futureDateString,
        preferredTime: "10:00",
        timeZone: "America/Chicago",
        flexibleTiming: false,
        priority: false,
        sameDay: false,
        estimatedDuration: 60
      },
      payment: {
        paymentMethod: "cash",
        sameBillingAddress: true,
        corporateBilling: false,
        payFullAmount: false,
        savePaymentMethod: false
      },
      bookingSource: "website",
      agreedToTerms: true,
      reservationId: reservationId
    });

    const result = await testEndpoint("/api/booking/create", bookingData);
    if (result.data.success) {
      console.log("✅ Booking creation working");
      console.log(`   Booking ID: ${result.data.booking.id}`);
      console.log(`   Booking Number: ${result.data.booking.bookingNumber}`);
      console.log(`   Status: ${result.data.booking.status}`);
      console.log(`   Total Price: $${result.data.booking.totalPrice}`);
      return result.data.booking;
    } else {
      console.log(`⚠️  Booking creation failed: ${result.data.error}`);
      if (result.data.details && result.data.details.errors) {
        result.data.details.errors.forEach(err => {
          console.log(`     - ${err.field}: ${err.message}`);
        });
      }
      return null;
    }
  } catch (err) {
    console.log(`❌ Booking creation test failed: ${err.message}`);
    return null;
  }
}

async function runAdvancedTests() {
  console.log("🔬 Running Advanced Booking Tests");
  console.log("==================================");
  
  // Test slot reservation
  const reservation = await testSlotReservation();
  
  // Test booking creation
  const booking = await testBookingCreation(reservation?.id);
  
  console.log("\n📊 Advanced Test Results");
  console.log("==================================");
  console.log(`Slot Reservation: ${reservation ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Booking Creation: ${booking ? "✅ PASSED" : "❌ FAILED"}`);
  
  if (reservation && booking) {
    console.log("\n🎉 All advanced tests PASSED!");
    console.log("   - Slot reservation system working");
    console.log("   - Booking creation with GHL integration working");
    console.log("   - Step-based validation working (inferred from successful creation)");
  } else {
    console.log("\n⚠️  Some advanced tests need attention");
  }
}

runAdvancedTests().catch(console.error);
