import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { buffer } from 'micro'; // Required to read the raw request body for Stripe signature verification

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// });

// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// GHL Custom Fields to update on successful payment:
// - cf_payment_amount_paid (Number)
// - cf_payment_date (Date)
// - cf_payment_status (Dropdown/Text - "Paid" or "Failed")
// - cf_payment_transaction_id (Text - Stripe PaymentIntent ID, should already be there)

// GHL Tags to update:
// On successful payment: Remove "Payment Intent Created", "Invoice - [...] - Pending Payment". 
//                      Add "Payment Received", "Invoice - [...] - Paid".
// On failed payment: Remove "Payment Intent Created", "Invoice - [...] - Pending Payment". 
//                   Add "Payment Failed", "Invoice - [...] - Failed".

export async function POST(request: Request) {
  try {
    // const rawBody = await buffer(request.body as any); // Read the raw body
    // const signature = request.headers.get('stripe-signature');

    // let event: Stripe.Event;

    // try {
    //   event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
    // } catch (err: any) {
    //   console.error(`Webhook signature verification failed: ${err.message}`);
    //   return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
    // }

    // --- For placeholder, we'll simulate receiving an event object ---
    // In a real scenario, 'event' comes from stripe.webhooks.constructEvent
    const event = await request.json(); // SIMULATING: Client sends mock Stripe event directly
    console.log('Received Stripe webhook event (simulated):', event.type, event.data?.object?.id);
    // --- End Simulation ---

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as any; // as Stripe.PaymentIntent;
        console.log('STRIPE EVENT: PaymentIntent succeeded:', paymentIntentSucceeded.id);

        // --- Placeholder GHL Integration Logic for successful payment ---
        const customerEmailSucceeded = paymentIntentSucceeded.metadata?.customerEmail || paymentIntentSucceeded.receipt_email;
        const invoiceNumberSucceeded = paymentIntentSucceeded.metadata?.invoiceNumber;
        console.log(`GHL ACTION (Placeholder): Payment Succeeded for ${customerEmailSucceeded}, Invoice: ${invoiceNumberSucceeded || 'N/A'}`);
        console.log(`GHL ACTION (Placeholder): Update custom fields: AmountPaid=${paymentIntentSucceeded.amount_received}, Status=Paid, PaymentDate=${new Date().toISOString()}, TxnID=${paymentIntentSucceeded.id}`);
        console.log(`GHL ACTION (Placeholder): Update tags: Remove Pending tags, Add "Payment Received", "Invoice - ${invoiceNumberSucceeded || 'N/A'} - Paid"`);
        console.log('GHL ACTION (Placeholder): Trigger GHL workflow (e.g., send receipt, notify team, grant access).');
        // --- End Placeholder GHL Logic ---
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as any; // as Stripe.PaymentIntent;
        console.log('STRIPE EVENT: PaymentIntent failed:', paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
        
        // --- Placeholder GHL Integration Logic for failed payment ---
        const customerEmailFailed = paymentIntentFailed.metadata?.customerEmail;
        const invoiceNumberFailed = paymentIntentFailed.metadata?.invoiceNumber;
        console.log(`GHL ACTION (Placeholder): Payment Failed for ${customerEmailFailed}, Invoice: ${invoiceNumberFailed || 'N/A'}`);
        console.log(`GHL ACTION (Placeholder): Update custom fields: Status=Failed, FailureReason=${paymentIntentFailed.last_payment_error?.message}`);
        console.log(`GHL ACTION (Placeholder): Update tags: Remove Pending tags, Add "Payment Failed", "Invoice - ${invoiceNumberFailed || 'N/A'} - Failed"`);
        console.log('GHL ACTION (Placeholder): Trigger GHL workflow (e.g., notify client of failure, internal alert).');
        // --- End Placeholder GHL Logic ---
        break;

      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error processing webhook.', error: errorMessage }, { status: 500 });
  }
}
