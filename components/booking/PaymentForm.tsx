"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  serviceName: string;
  customerName: string;
  scheduledDateTime: Date;
  promoCode?: {
    code: string;
    discountAmount: number;
  };
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

interface BookingSummary {
  serviceName: string;
  customerName: string;
  scheduledDateTime: Date;
  amount: number;
  promoCode?: {
    code: string;
    discountAmount: number;
  };
}

function PaymentFormContent({
  bookingId,
  amount,
  serviceName,
  customerName,
  scheduledDateTime,
  promoCode,
  onPaymentSuccess,
  onPaymentError
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  // Create payment intent when component mounts with proper cleanup
  useEffect(() => {
    let isCancelled = false;
    let paymentIntentIdToCancel: string | null = null;
    
    const initializePayment = async () => {
      if (isCancelled) return;
      
      try {
        const result = await createPaymentIntent();
        if (!isCancelled && result) {
          paymentIntentIdToCancel = result.paymentIntentId;
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to initialize payment:', error);
          onPaymentError?.(error instanceof Error ? error.message : 'Payment initialization failed');
        }
      }
    };
    
    initializePayment();
    
    return () => {
      isCancelled = true;
      // Cancel any pending payment intent to prevent memory leaks
      if (paymentIntentIdToCancel) {
        fetch('/api/cancel-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntentIdToCancel })
        }).catch(error => {
          console.warn('Failed to cancel payment intent:', error);
        });
      }
    };
  }, [bookingId]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/v2/payments/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      
      // Return the payment intent info for cleanup purposes
      return {
        paymentIntentId: data.paymentIntentId,
        clientSecret: data.clientSecret
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      onPaymentError(error instanceof Error ? error.message : 'Failed to initialize payment');
      throw error; // Re-throw for proper error handling in useEffect
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful!',
          description: 'Your booking has been confirmed.',
        });
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment failed',
        description: errorMessage,
        variant: 'destructive'
      });
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  const cardElementOptions = {
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
    hidePostalCode: false,
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Service:</span>
            <span>{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Customer:</span>
            <span>{customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date & Time:</span>
            <span className="text-right">{formatDateTime(scheduledDateTime)}</span>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Deposit Amount:</span>
              <span>${(amount + (promoCode?.discountAmount || 0)).toFixed(2)}</span>
            </div>
            
            {promoCode && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({promoCode.code}):</span>
                <span>-${promoCode.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total Due:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Enter your payment details to secure your appointment with a deposit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Element */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Details</label>
              <div className="p-3 border rounded-md bg-white">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Your payment information is secure and encrypted.</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!stripe || loading || !clientSecret}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Pay ${amount.toFixed(2)} Deposit
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
              <p className="text-sm text-blue-700">
                This deposit secures your appointment time. The remaining balance will be collected at the time of service. 
                Your payment is processed securely through Stripe and we never store your card information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
} 