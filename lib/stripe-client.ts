/**
 * Stripe Client Configuration
 * Houston Mobile Notary Pros Championship Booking System
 */
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18',
  typescript: true,
});

export const getStripeClient = () => stripeClient;

export default stripeClient;