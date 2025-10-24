// api/stripe-portal.js
// Crear sesión del portal del cliente de Stripe (para gestionar suscripción)

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
    const { stripeCustomerId } = req.body;

    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }

    // TODO: Descomentar cuando tengas Stripe configurado
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Crear sesión del portal del cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.DOMAIN}/dashboard`,
    });

    return res.status(200).json({
      success: true,
      url: portalSession.url
    });
    */

    // MODO DEMO - Respuesta simulada
    console.log('🔔 Portal de Stripe solicitado:', { stripeCustomerId });
    
    return res.status(200).json({
      success: true,
      demo: true,
      message: 'Stripe no configurado todavía',
      url: '/demo-portal'
    });

  } catch (error) {
    console.error('Error en stripe-portal:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
