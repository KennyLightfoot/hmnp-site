import { type NextRequest, NextResponse } from "next/server";
import { withRateLimit } from '@/lib/security/rate-limiting';
import { withPaymentSecurity } from '@/lib/security/comprehensive-security';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ amount: z.number().positive().optional(), currency: z.string().optional() }).optional();

export const POST = withPaymentSecurity(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    schema.safeParse(body); // non-strict: accept optional fields

    // In a real application, you would integrate with a payment provider like Stripe.
    // Here we just simulate a successful payment.
    const paymentId = `pi_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({ success: true, paymentId }, { status: 200 });
  } catch (error) {
    console.error("Failed to process payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});