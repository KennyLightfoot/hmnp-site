"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Make sure to set your Stripe publishable key in .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  clientSecret: string;
  bookingId: string;
  paymentIntentId: string;
  amount: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, bookingId, paymentIntentId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setErrorMessage("Stripe is not ready. Please wait a moment and try again.");
      setIsLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/booking-confirmation?bookingId=${bookingId}&payment_intent=${paymentIntentId}&status=succeeded`,
      },
      // Uncomment if you want to redirect immediately
      // redirect: 'if_required',
    });

    // Handle the result from Stripe's confirmPayment
    if (result.error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment details incomplete)
      setErrorMessage(result.error.message || "An unexpected error occurred.");
      toast({
        title: "Payment Failed",
        description: result.error.message || "An unexpected error occurred during payment.",
        variant: "destructive",
      });
    } else {
      // No immediate error - this doesn't guarantee success, the payment could still require action
      // We should check the PaymentIntent status separately
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed. Redirecting...",
        variant: "default",
      });
      
      // Redirect to booking confirmation where we'll check the actual payment status
      router.push(`/booking-confirmation?bookingId=${bookingId}&payment_intent=${paymentIntentId}&status=processing`);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          Securely pay ${amount} for your booking (ID: {bookingId}).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentElement id="payment-element" />
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={isLoading || !stripe || !elements} className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            `Pay $${amount}`
          )}
        </Button>
      </CardFooter>
    </form>
  );
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    
    const cs = searchParams?.get('clientSecret');
    const bid = searchParams?.get('bookingId');
    const pid = searchParams?.get('paymentIntentId');
    const amt = searchParams?.get('amount');

    if (cs && bid && pid && amt) {
      setClientSecret(cs);
      setBookingId(bid);
      setPaymentIntentId(pid);
      setAmount(amt);
    } else {
      setError("Missing payment details. Unable to proceed with checkout. Please try booking again or contact support.");
      toast({
        title: "Checkout Error",
        description: "Essential payment information is missing from the link.",
        variant: "destructive",
      });
      // Optional: redirect back or to an error page
      // router.push('/booking'); 
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checkout Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/')} className="w-full">Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!clientSecret || !bookingId || !paymentIntentId || !amount) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[#002147]" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#002147', // HMNP Dark Blue
        colorBackground: '#ffffff',
        colorText: '#333333',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
        // See all possible variables below
      }
    },
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-start min-h-screen">
      <Card className="w-full max-w-lg mt-8">
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            clientSecret={clientSecret} 
            bookingId={bookingId} 
            paymentIntentId={paymentIntentId} 
            amount={amount} 
          />
        </Elements>
      </Card>
    </div>
  );
}
