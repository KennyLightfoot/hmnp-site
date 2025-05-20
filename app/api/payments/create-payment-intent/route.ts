import { NextResponse } from 'next/server';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16', // Use the latest API version
// });

interface CreatePaymentIntentRequestBody {
  amount: number; // Amount in smallest currency unit (e.g., cents for USD)
  currency?: string; // e.g., 'usd'
  invoiceNumber?: string;
  serviceDescription?: string;
  customerEmail?: string; // For linking to Stripe customer and GHL contact
  customerName?: string;
}

// GHL Custom Fields to update on PaymentIntent creation (or when webhook confirms):
// - cf_payment_invoice_number (Text)
// - cf_payment_service_description (Text)
// - cf_payment_amount_due (Number - store amount from PaymentIntent)
// - cf_payment_status (Dropdown/Text - e.g., "Pending", "Paid", "Failed")
// - cf_payment_transaction_id (Text - Stripe PaymentIntent ID)
// - cf_payment_date (Date - when payment is successful)

// GHL Tags to apply:
// On PaymentIntent creation: "Payment Intent Created", "Invoice - [InvoiceNumber] - Pending"
// On successful payment (via webhook): "Payment Received", "Invoice - [InvoiceNumber] - Paid"
// On failed payment (via webhook): "Payment Failed", "Invoice - [InvoiceNumber] - Failed"

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreatePaymentIntentRequestBody;
    const { amount, currency = 'usd', invoiceNumber, serviceDescription, customerEmail, customerName } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount.' }, { status: 400 });
    }

    console.log('Received request to create payment intent:', body);

    // --- Placeholder Stripe PaymentIntent Creation Logic ---
    // In a real scenario, you would call Stripe API here:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount, // Amount in cents
    //   currency: currency,
    //   automatic_payment_methods: { enabled: true },
    //   metadata: {
    //     invoiceNumber: invoiceNumber || '',
    //     customerEmail: customerEmail || '',
    //     customerName: customerName || '',
    //     serviceDescription: serviceDescription || '',
    //   },
    // });
    // const clientSecret = paymentIntent.client_secret;
    const mockClientSecret = `pi_${Math.random().toString(36).substr(2, 24)}_secret_${Math.random().toString(36).substr(2, 24)}`;
    const mockPaymentIntentId = mockClientSecret.split('_secret_')[0];
    console.log('STRIPE ACTION (Placeholder): PaymentIntent created. ID:', mockPaymentIntentId);
    // --- End Placeholder Stripe Logic ---

    // --- Placeholder GHL Integration Logic (triggered by PaymentIntent creation) ---
    // 1. Find/Create Contact in GHL using customerEmail or customerName.
    // 2. Update custom fields: cf_payment_invoice_number, cf_payment_service_description, cf_payment_amount_due, cf_payment_status = "Pending Payment".
    // 3. Apply tags: "Payment Intent Created", "Invoice - [invoiceNumber] - Pending Payment".
    console.log(`GHL ACTION (Placeholder): Find/Create contact for ${customerEmail || customerName || 'N/A'}`);
    console.log(`GHL ACTION (Placeholder): Update custom fields: Invoice=${invoiceNumber || 'N/A'}, AmountDue=${amount}, Status=Pending Payment, PI_ID=${mockPaymentIntentId}`);
    console.log(`GHL ACTION (Placeholder): Apply tags: "Payment Intent Created", "Invoice - ${invoiceNumber || 'N/A'} - Pending Payment"`);
    // --- End Placeholder GHL Logic ---

    return NextResponse.json({ clientSecret: mockClientSecret, paymentIntentId: mockPaymentIntentId }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error creating payment intent.', error: errorMessage }, { status: 500 });
  }
}
