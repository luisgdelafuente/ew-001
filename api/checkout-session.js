import Stripe from 'stripe';

// Replace with your Stripe secret key
const stripe = new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'customer_details'],
    });

    res.status(200).json(session);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ error: 'Failed to retrieve checkout session' });
  }
}