import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (selectedVideos, companyName) => {
  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videos: selectedVideos,
        companyName: companyName
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { id: sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (sessionId) => {
  try {
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message || 'Error redirecting to checkout');
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};