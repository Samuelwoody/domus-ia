// api/stripe-checkout.js
// Crear sesión de checkout de Stripe

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userId, userEmail } = req.body;

    // TODO: Descomentar cuando tengas Stripe configurado
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Definir precios según plan
    const prices = {
      particular: process.env.STRIPE_PRICE_PARTICULAR, // €99/mes
      profesional: process.env.STRIPE_PRICE_PROFESIONAL, // €199/mes
      premium: process.env.STRIPE_PRICE_PREMIUM // €399/mes
    };

    const priceId = prices[planId];

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Crear sesión de Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        planId: planId
      }
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
    */

    // MODO DEMO - Respuesta simulada
    console.log('🔔 Stripe Checkout solicitado:', { planId, userId, userEmail });
    
    return res.status(200).json({
      success: true,
      demo: true,
      message: 'Stripe no configurado todavía',
      sessionId: 'demo_session_' + Date.now(),
      url: '/demo-payment'
    });

  } catch (error) {
    console.error('Error en stripe-checkout:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
