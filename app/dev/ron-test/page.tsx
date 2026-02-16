'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * RON Test Page
 * 
 * This is a development-only page that allows testing the RON integration
 * without going through the full Stripe payment process.
 * 
 * DO NOT DEPLOY TO PRODUCTION
 */
export default function RONTestPage() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<null | {
    success: boolean;
    message: string;
    details?: any;
  }>(null);
  const [showRealFlow, setShowRealFlow] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('test@example.com');
  const [customerName, setCustomerName] = useState('Test User');
  const [customerPhone, setCustomerPhone] = useState('5551234567');

  // Test 1: Create a simulated checkout session
  const testSimulatedCheckout = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/dev/simulate-ron-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          documentType: 'GENERAL',
          notes: 'Test RON session from dev test page'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Successfully simulated RON checkout session and webhook',
          details: data
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to simulate checkout',
          details: data
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'An unexpected error occurred',
        details: { error }
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Create a real checkout session (but using test keys)
  const testRealCheckout = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: 'RON_SERVICES',
          customerName,
          customerEmail,
          customerPhone,
          documentType: 'GENERAL',
          notes: 'Test RON session from dev test page'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to create checkout',
          details: data
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'An unexpected error occurred',
        details: { error }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">RON Integration Test Tool</h1>
      <p className="text-gray-600 mb-8">
        This page allows testing the BlueNotary RON integration without going through
        the full booking process. It simulates the payment and webhook flow.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Customer</CardTitle>
            <CardDescription>
              These details will be used for the simulated session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="customerName" className="text-sm font-medium">Name</label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Test User"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customerEmail" className="text-sm font-medium">Email</label>
              <Input
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customerPhone" className="text-sm font-medium">Phone</label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="5551234567"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Options</CardTitle>
            <CardDescription>
              Choose between simulated flow or real test flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button
                onClick={testSimulatedCheckout}
                disabled={loading}
                className="w-full bg-[#A52A2A] hover:bg-[#8B0000]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Simulate Entire RON Flow
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                Skips Stripe checkout and directly simulates a successful payment webhook.
                No real BlueNotary session is created unless keys are configured.
              </p>
              
              <div className="border-t pt-4">
                <Button
                  onClick={() => setShowRealFlow(true)}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Test Real Flow with Stripe Test Cards
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Creates a real Stripe checkout session using test API keys.
                  Use <span className="font-mono">4242 4242 4242 4242</span> as the card number.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showRealFlow && (
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Real Test Flow</CardTitle>
            <CardDescription className="text-yellow-700">
              This will create a real checkout session using Stripe test mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-yellow-700">
                When redirected to Stripe, use these test card details:
              </p>
              <div className="bg-white p-4 rounded-md border border-yellow-200">
                <p className="font-mono text-sm mb-1">Card: 4242 4242 4242 4242</p>
                <p className="font-mono text-sm mb-1">Expiry: Any future date (MM/YY)</p>
                <p className="font-mono text-sm mb-1">CVC: Any 3 digits</p>
                <p className="font-mono text-sm">ZIP: Any 5 digits</p>
              </div>
              
              <Button
                onClick={testRealCheckout}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Checkout Session...
                  </>
                ) : (
                  <>
                    Proceed to Stripe Test Checkout
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowRealFlow(false)}
                variant="outline"
                className="w-full mt-2"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {testResult && (
        <Alert
          variant={testResult.success ? "default" : "destructive"}
          className={testResult.success ? "bg-green-50 text-green-800 border-green-100" : ""}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            {testResult.message}
            
            {testResult.details && (
              <pre className="mt-4 p-4 bg-black/5 rounded-md overflow-auto text-xs">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}