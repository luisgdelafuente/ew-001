import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// Mock API for demo purposes since we don't have a real backend
export const createCheckoutSession = async (videos, companyName) => {
  try {
    // In a real application, this would be a call to your backend API
    // For demo purposes, we'll simulate a successful response
    console.log('Creating checkout session for:', videos, companyName);
    
    // Simulate API response
    return {
      id: 'demo_session_' + Date.now(),
      videos,
      companyName
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (sessionId) => {
  try {
    // In a real application, this would redirect to Stripe
    // For demo purposes, we'll simulate the checkout process
    console.log('Redirecting to checkout with session ID:', sessionId);
    
    // Simulate successful checkout
    // In a real app, we would use stripe.redirectToCheckout({ sessionId })
    
    // For demo, we'll redirect to success page directly
    window.location.href = `/success?session_id=${sessionId}`;
    
    return { success: true };
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

export default { createCheckoutSession, redirectToCheckout };