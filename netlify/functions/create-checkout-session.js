import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { videos, companyName } = JSON.parse(event.body);
    
    if (!videos?.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No videos selected' })
      };
    }

    // Calculate discount based on number of videos
    const getDiscount = (count) => {
      if (count <= 1) return 0;
      if (count === 2) return 10;
      if (count === 3) return 20;
      if (count === 4) return 30;
      return 40;
    };

    const basePrice = 9900; // 99 EUR in cents
    const discount = getDiscount(videos.length);
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
      success_url: `${process.env.URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/cancel`,
      metadata: {
        companyName,
        videoCount: videos.length.toString()
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};