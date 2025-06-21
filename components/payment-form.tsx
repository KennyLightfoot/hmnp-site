import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea'; // For Billing Address
import { AlertTriangle, CreditCard, Lock } from 'lucide-react'; // Icons

// --- IMPORTANT: Payment Processor Integration Placeholder ---
// This form is a TEMPLATE. Real payment processing requires integrating
// a third-party payment provider's SDK (e.g., Stripe.js, PayPal SDK).
// DO NOT handle raw credit card details on your server unless PCI DSS compliant.

// Example: Stripe.js would typically be loaded here
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// const stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace with your actual key

const privacyPolicyLink = "/privacy-policy";
const termsOfServiceLink = "/terms"; // You might also want a specific refund policy link
const refundPolicyLink = "/refund-policy";

const paymentFormSchema = z.object({
  invoiceNumber: z.string().optional(),
  serviceDescription: z.string().optional(),
  paymentAmount: z.coerce.number({
    required_error: 'Payment amount is required.',
    invalid_type_error: 'Payment amount must be a valid number.',
  }).positive({ message: 'Payment amount must be positive.' }).optional(),
  cardholderName: z.string().min(1, { message: 'Cardholder name is required.' }),
  email: z.string().email({ message: 'A valid email is required for your receipt.' }),
  // Billing address fields (optional but recommended for AVS checks)
  billingAddressStreet: z.string().optional(),
  billingAddressCity: z.string().optional(),
  billingAddressState: z.string().optional(),
  billingAddressZip: z.string().optional(),
  billingAddressCountry: z.string().optional(),
  consentToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and refund policy.',
  }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  defaultInvoiceNumber?: string;
  defaultPaymentAmount?: number;
  defaultServiceDescription?: string;
}

// This is the inner form component that would use Stripe's useStripe and useElements hooks
const CheckoutForm: React.FC<PaymentFormProps & { onSuccessfulPayment: () => void }> = ({ 
    defaultInvoiceNumber, 
    defaultPaymentAmount, 
    defaultServiceDescription, 
    onSuccessfulPayment 
}) => {
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // const stripe = useStripe(); // Uncomment when Stripe.js is integrated
  // const elements = useElements(); // Uncomment when Stripe.js is integrated

  const {
    register,
    handleSubmit,
    control, // For potential future Select components for country, etc.
    formState: { errors },
    watch
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceNumber: defaultInvoiceNumber || '',
      serviceDescription: defaultServiceDescription || '',
      paymentAmount: defaultPaymentAmount,
      cardholderName: '',
      email: '',
      billingAddressStreet: '',
      billingAddressCity: '',
      billingAddressState: '',
      billingAddressZip: '',
      billingAddressCountry: 'US',
      consentToTerms: false,
    },
  });

  const paymentAmount = watch('paymentAmount');

  const handleFormSubmit = async (data: PaymentFormValues) => {
    setSubmissionStatus('processing');
    setPaymentError(null);

    // if (!stripe || !elements) {
    //   setPaymentError('Payment system is not ready. Please try again in a moment.');
    //   setSubmissionStatus('error');
    //   return;
    // }

    // const cardElement = elements.getElement(CardElement);
    // if (!cardElement) {
    //   setPaymentError('Payment card element not found. Please refresh.');
    //   setSubmissionStatus('error');
    //   return;
    // }

    console.log('Payment Form Data (Pre-Stripe):', data);

    try {
      // 1. Create a PaymentIntent on your backend
      //    Your backend securely communicates with Stripe to create this.
      //    It returns a `clientSecret` for the PaymentIntent.
      // const response = await fetch('/api/payments/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: Math.round(data.paymentAmount * 100), // Amount in cents
      //     currency: 'usd',
      //     description: data.serviceDescription || `Invoice: ${data.invoiceNumber}`,
      //     receipt_email: data.email,
      //     metadata: { // Any other relevant info
      //         invoiceNumber: data.invoiceNumber,
      //         cardholderName: data.cardholderName,
      //     }
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to create payment intent.');
      // }
      // const { clientSecret } = await response.json();

      // 2. Confirm the card payment with Stripe.js on the client-side
      // const paymentResult = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: cardElement,
      //     billing_details: {
      //       name: data.cardholderName,
      //       email: data.email,
      //       address: {
      //         line1: data.billingAddressStreet,
      //         city: data.billingAddressCity,
      //         state: data.billingAddressState,
      //         postal_code: data.billingAddressZip,
      //         country: data.billingAddressCountry,
      //       },
      //     },
      //   },
      // });

      // if (paymentResult.error) {
      //   throw new Error(paymentResult.error.message || 'Payment failed.');
      // }

      // if (paymentResult.paymentIntent?.status === 'succeeded') {
      //   console.log('Payment Succeeded:', paymentResult.paymentIntent);
      //   // Call parent callback for success
      //   onSuccessfulPayment(); 
      // } else {
      //   throw new Error(paymentResult.paymentIntent?.status || 'Payment not succeeded.');
      // }

      // --- Mocking successful payment --- 
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Mock Payment Succeeded for amount:', data.paymentAmount);
      onSuccessfulPayment();
      // --- End Mock --- 

    } catch (error: any) {
      setPaymentError(error.message || 'An unexpected error occurred during payment.');
      setSubmissionStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
          <Input id="invoiceNumber" {...register('invoiceNumber')} placeholder="e.g., INV-2024-001" />
        </div>
        <div>
          <Label htmlFor="paymentAmount">Payment Amount (USD)</Label>
          <Input 
            id="paymentAmount" 
            type="number" 
            step="0.01" 
            {...register('paymentAmount')} 
            placeholder="e.g., 50.00" 
            className={errors.paymentAmount ? 'border-red-500' : ''}
          />
          {errors.paymentAmount && <p className="mt-1 text-xs text-red-600">{errors.paymentAmount.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="serviceDescription">Service Description or Reference (Optional)</Label>
        <Input id="serviceDescription" {...register('serviceDescription')} placeholder="e.g., Notary Service for Loan Documents" />
      </div>

      <fieldset className="border border-gray-300 p-4 rounded-md">
        <legend className="text-lg font-medium text-[#002147] px-2 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" /> Payment Details
        </legend>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input id="cardholderName" {...register('cardholderName')} placeholder="Name as it appears on card" className={errors.cardholderName ? 'border-red-500' : ''} />
            {errors.cardholderName && <p className="mt-1 text-xs text-red-600">{errors.cardholderName.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email for Receipt</Label>
            <Input id="email" type="email" {...register('email')} placeholder="your.email@example.com" className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* --- Placeholder for Stripe CardElement --- */}
          <div className="p-3 border border-dashed border-blue-400 rounded-md bg-blue-50">
            <Label className="block text-sm font-medium text-blue-700 mb-1">Card Information</Label>
            <div id="card-element-placeholder" className="p-3 bg-white border border-gray-300 rounded-md">
              {/* <CardElement options={{ style: { base: { fontSize: '16px' } } }} /> */}
              <p className="text-sm text-gray-500 italic">
                (Secure card input field from payment processor will appear here. E.g., Stripe CardElement)
              </p>
            </div>
             {/* {stripeError && <p className="mt-1 text-xs text-red-600">{stripeError}</p>} */}
             <p className="mt-2 text-xs text-blue-600">Your card details are tokenized and processed securely by our payment partner.</p>
          </div>
          {/* --- End Placeholder --- */}
        </div>
      </fieldset>

      <fieldset className="border border-gray-300 p-4 rounded-md">
        <legend className="text-lg font-medium text-[#002147] px-2">Billing Address (Optional, Recommended)</legend>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="billingAddressStreet">Street Address</Label>
            <Input id="billingAddressStreet" {...register('billingAddressStreet')} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="billingAddressCity">City</Label>
              <Input id="billingAddressCity" {...register('billingAddressCity')} placeholder="Anytown" />
            </div>
            <div>
              <Label htmlFor="billingAddressState">State / Province</Label>
              <Input id="billingAddressState" {...register('billingAddressState')} placeholder="TX" />
            </div>
            <div>
              <Label htmlFor="billingAddressZip">ZIP / Postal Code</Label>
              <Input id="billingAddressZip" {...register('billingAddressZip')} placeholder="77001" />
            </div>
          </div>
           {/* Could add a Select for Country if needed */}
        </div>
      </fieldset>

      <div className="flex items-start space-x-3 pt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
        <Checkbox id="consentToTerms" {...register('consentToTerms')} className={`mt-1 ${errors.consentToTerms ? 'border-red-500' : ''}`} />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="consentToTerms" className="text-sm font-medium text-gray-700">
            I have read and agree to the <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#A52A2A]">Terms of Service</a> and <a href={refundPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#A52A2A]">Refund Policy</a>.
          </Label>
          {errors.consentToTerms && <p className="mt-1 text-xs text-red-600">{errors.consentToTerms.message}</p>}
        </div>
      </div>

      {paymentError && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md text-sm text-red-700 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" /> {paymentError}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={submissionStatus === 'processing' /* || !stripe || !elements */}
        className="w-full bg-[#A52A2A] hover:bg-[#8B0000] text-white py-2.5 px-4 rounded-md font-semibold transition-colors duration-150 ease-in-out flex items-center justify-center"
      >
        {submissionStatus === 'processing' ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </>
        ) : (
          <><Lock className="h-5 w-5 mr-2" /> Pay {paymentAmount ? `$${paymentAmount.toFixed(2)}` : 'Now'}</>
        )}
      </Button>
    </form>
  );
}

// Main component wrapper that would include Stripe's Elements provider
export default function PaymentForm(props: PaymentFormProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSuccessfulPayment = () => {
    setShowSuccessMessage(true);
  };

  if (showSuccessMessage) {
    return (
      <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white text-center">
        <Lock className="h-16 w-16 text-green-500 mx-auto mb-4" /> {/* Or CheckCircleIcon */}
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Payment Successful!</h2>
        <p className="text-gray-700 mb-2">
          Thank you for your payment. Your transaction has been processed securely.
        </p>
        <p className="text-gray-600 text-sm">
          A receipt has been sent to your email address. Please check your inbox (and spam folder).
        </p>
        <Button onClick={() => setShowSuccessMessage(false)} className="mt-6 bg-[#002147] hover:bg-[#001730] text-white">
          Make Another Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white">
      <div className="mb-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start mb-2">
          <Lock className="h-8 w-8 text-[#002147] mr-2" />
          <h2 className="text-2xl font-semibold text-[#002147]">Secure Online Payment</h2>
        </div>
        <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - Easy & Secure Payments</p>
        <p className="text-muted-foreground mt-2">
          Please fill in the details below to complete your payment. All transactions are processed securely.
        </p>
      </div>

      <div className="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800 flex items-start">
        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <strong>PCI Compliance & Security:</strong> We use a trusted third-party payment processor (e.g., Stripe, PayPal) to handle your card information. Your full card details are never stored on our servers. Look for the secure connection (HTTPS) in your browser.
        </div>
      </div>

      {/* <Elements stripe={stripePromise}> */}
        <CheckoutForm {...props} onSuccessfulPayment={handleSuccessfulPayment} />
      {/* </Elements> */}
      {/* ^^^ Uncomment the Elements wrapper when Stripe.js is integrated */}
      <p className="text-center text-xs text-gray-500 mt-4">
        If you have any issues or questions about your payment, please contact us.
      </p>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          All payments are subject to our <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a> and <a href={refundPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Refund Policy</a>. For privacy details, see our <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
