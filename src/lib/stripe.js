import Stripe from 'stripe';

let stripe = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return stripe;
}

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}
