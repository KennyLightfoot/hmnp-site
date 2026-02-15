console.log("Testing basic functionality...");

// Test health endpoint with simple curl equivalent
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

async function runTests() {
  console.log("🔍 Testing health endpoint...");
  try {
    const health = await testEndpoint("/api/health");
    if (health.data.status === "healthy") {
      console.log("✅ Health endpoint working");
      console.log(`   Database: ${health.data.services.database.status}`);
      console.log(`   Redis: ${health.data.services.redis.status}`);
    }
  } catch (err) {
    console.log(`❌ Health test failed: ${err.message}`);
  }

  console.log("\n💰 Testing pricing calculation...");
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const pricingData = JSON.stringify({
      serviceType: "STANDARD_NOTARY",
      location: {
        address: "123 Main St",
        city: "Houston",
        state: "TX",
        zipCode: "77001"
      },
      scheduledDateTime: futureDate.toISOString(),
      documentCount: 1,
      signerCount: 1,
      options: {
        priority: false,
        sameDay: false,
        weatherAlert: false
      }
    });

    const pricing = await testEndpoint("/api/booking/calculate-price", pricingData);
    if (pricing.data.success) {
      console.log("✅ Pricing calculation working");
      console.log(`   Total Price: $${pricing.data.data.total}`);
    } else {
      console.log(`⚠️  Pricing failed: ${pricing.data.error}`);
    }
  } catch (err) {
    console.log(`❌ Pricing test failed: ${err.message}`);
  }

  console.log("\n🎯 Basic tests completed!");
}

runTests().catch(console.error);
