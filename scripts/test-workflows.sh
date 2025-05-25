#!/bin/bash

# Script to test automation workflows
# This tests your local development server or production endpoints

echo "🧪 Testing Houston Mobile Notary Pros Automation Workflows"
echo "=========================================================="

# Set your domain (change this to your actual domain)
DOMAIN="http://localhost:3000"  # For development
# DOMAIN="https://your-actual-domain.com"  # For production

echo "🌐 Testing against: $DOMAIN"
echo ""

# Test 1: Payment Automation Cron
echo "1️⃣  Testing Payment Automation..."
curl -X GET "${DOMAIN}/api/cron/payment-automation" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "---"

# Test 2: Lead Nurturing Cron
echo "2️⃣  Testing Lead Nurturing..."
curl -X POST "${DOMAIN}/api/cron/lead-nurturing" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "---"

# Test 3: Booking Automation (general test)
echo "3️⃣  Testing Booking Automation..."
curl -X GET "${DOMAIN}/api/cron/booking-automation" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "---"

# Test 4: Lead Nurturing Enrollment (test endpoint)
echo "4️⃣  Testing Lead Nurturing Enrollment..."
curl -X POST "${DOMAIN}/api/nurture/enroll" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","sequenceId":"educational-sequence","metadata":{"source":"test"}}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo ""
echo "---"

echo "✅ Workflow tests completed!"
echo ""
echo "💡 Tips:"
echo "   • 200/201 status codes mean success"
echo "   • 404 means the endpoint doesn't exist yet"
echo "   • 500 means there's an error in the code"
echo "   • Check your terminal/logs for detailed error messages"
echo ""
echo "🔧 To test specific booking operations, you'll need actual booking IDs from your database" 