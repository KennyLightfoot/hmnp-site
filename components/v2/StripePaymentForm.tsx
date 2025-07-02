/**
 * 💳 HMNP V2 Stripe Payment Form
 * Bulletproof Stripe Elements integration
 * Smooth, secure, conversion-optimized payment experience
 */

'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// 🔌 STRIPE CONFIGURATION
// ============================================================================

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ============================================================================
// 🎯 INTERFACES
// ============================================================================

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  depositAmount?: number;
  isDeposit: boolean;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  scheduledDateTime: string;
  onPaymentSuccess: (paymentResult: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentResult {
  paymentIntentId: string;
  status: string;
  amount: number;
  booking: {
    id: string;
    status: string;
    confirmedAt?: string;
  };
}

interface PaymentIntent {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  status: string;
}

// ============================================================================
// 🎨 PAYMENT FORM COMPONENT
// ============================================================================

const PaymentFormInner: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  depositAmount,
  isDeposit,
  customerName,
  customerEmail,
  serviceName,
  scheduledDateTime,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  // ============================================================================
  // 🚀 EFFECTS & INITIALIZATION
  // ============================================================================

  useEffect(() => {
    createPaymentIntent();
  }, []);

  // ============================================================================
  // 🎯 PAYMENT INTENT CREATION
  // ============================================================================

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v2/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          returnUrl: `${window.location.origin}/booking/confirmation/${bookingId}`,
          metadata: {
            customerName,
            customerEmail,
            serviceName,
            scheduledDateTime,
            isDeposit: isDeposit.toString()
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentIntent(data.data);
      } else {
        setError(data.error.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('Failed to initialize payment. Please try again.');
      console.error('Payment intent creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 🎯 PAYMENT PROCESSING
  // ============================================================================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Payment form not loaded properly');
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerName,
              email: customerEmail,
            },
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (confirmedPaymentIntent?.status === 'succeeded') {
        // Confirm with our backend
        await confirmPaymentWithBackend(confirmedPaymentIntent.id);
      } else {
        throw new Error('Payment was not completed successfully');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
      toast.error(`Payment failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================================
  // 🎯 BACKEND CONFIRMATION
  // ============================================================================

  const confirmPaymentWithBackend = async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/v2/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          bookingId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment successful! Your booking is confirmed.');
        onPaymentSuccess({
          paymentIntentId,
          status: 'succeeded',
          amount: data.data.payment.amount,
          booking: data.data.booking
        });
      } else {
        throw new Error(data.error.message || 'Failed to confirm payment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm payment';
      throw new Error(errorMessage);
    }
  };

  // ============================================================================
  // 🎨 LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-lg font-medium">Preparing your payment...</p>
            <p className="text-sm text-muted-foreground text-center">
              We're setting up a secure payment session for your booking
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // 🎨 ERROR STATE
  // ============================================================================

  if (error && !paymentIntent) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Payment Setup Failed:</strong> {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={createPaymentIntent} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // 🎨 MAIN PAYMENT FORM
  // ============================================================================

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Complete your booking with a secure payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Service</span>
            <span>{serviceName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Date & Time</span>
            <span>{new Date(scheduledDateTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Customer</span>
            <span>{customerName}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>
              {isDeposit ? 'Deposit Amount' : 'Total Amount'}
            </span>
            <span className="text-green-600">
              ${(isDeposit ? depositAmount || amount : amount).toFixed(2)}
            </span>
          </div>
          
          {isDeposit && (
            <div className="text-sm text-muted-foreground text-center">
              💡 Pay ${depositAmount?.toFixed(2)} now to secure your booking.
              Remaining balance due at service time.
            </div>
          )}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Element */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Card Information
            </label>
            <div className="border rounded-lg p-4 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
                onChange={(event) => {
                  setCardComplete(event.complete);
                  if (event.error) {
                    setError(event.error.message);
                  } else {
                    setError(null);
                  }
                }}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Badges */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || !cardComplete || isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pay ${(isDeposit ? depositAmount || amount : amount).toFixed(2)} Securely
              </>
            )}
          </Button>
        </form>

        {/* Trust Indicators */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <img src="/stripe-badge.png" alt="Powered by Stripe" className="h-6" />
            <span>Powered by Stripe</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 🎨 MAIN WRAPPER COMPONENT
// ============================================================================

const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#16a34a',
        colorBackground: '#ffffff',
        colorText: '#262626',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentFormInner {...props} />
    </Elements>
  );
};

export default StripePaymentForm;