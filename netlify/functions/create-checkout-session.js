import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.URL || event.headers.host}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || event.headers.host}/cancel`,
      metadata: {
        companyName,
      },
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