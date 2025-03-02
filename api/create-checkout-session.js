import Stripe from 'stripe';

// Replace with your Stripe secret key
const stripe = new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videos, companyName } = req.body;
    
    if (!videos || !videos.length) {
      return res.status(400).json({ error: 'No videos selected' });
    }

    // Create line items for Stripe
    const lineItems = videos.map(video => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: video.title,
          description: `${video.duration}s video - ${video.type === 'direct' ? 'Direct focus' : 'Indirect focus'}`,
          metadata: {
            videoId: video.id,
            duration: video.duration,
            type: video.type
          },
        },
        unit_amount: 9900, // 99 EUR in cents
      },
      quantity: 1,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: {
        companyName,
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}