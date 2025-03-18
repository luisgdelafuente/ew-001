import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 2
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { videos, companyName } = JSON.parse(event.body);
    
    if (!videos?.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No videos selected' })
      };
    }

    // Calculate total with discount
    const basePrice = 9900; // 99 EUR in cents
    const discount = 10 + ((videos.length - 1) * (40 - 10) / (10 - 1));
    const subtotal = basePrice * videos.length;
    const discountAmount = Math.round((subtotal * discount) / 100);
    const total = subtotal - discountAmount;

    // Create a single line item with all videos included
    const lineItems = [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Video Package - ${videos.length} Videos`,
          description: `Complete video package for ${companyName}\n\nIncludes:\n${videos.map(v => `- ${v.title}`).join('\n')}`,
          metadata: {
            videoCount: videos.length.toString(),
            videos: JSON.stringify(videos.map(v => v.id))
          }
        },
        unit_amount: total / videos.length, // Distribute total amount across videos
      },
      quantity: videos.length,
    }];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment', 
      payment_intent_data: {
        setup_future_usage: null
      },
      success_url: `${process.env.URL || event.headers.host}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || event.headers.host}/cancel`,
      metadata: {
        companyName,
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};