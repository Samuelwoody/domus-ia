// api/stripe-webhook.js
// Webhook para recibir eventos de Stripe

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Descomentar cuando tengas Stripe configurado
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verificar que el webhook viene de Stripe
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Payment successful:', session.id);
        
        // Activar suscripción del usuario
        await activateSubscription({
          userId: session.client_reference_id,
          planId: session.metadata.planId,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription
        });
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('🔄 Subscription updated:', subscription.id);
        
        // Actualizar estado de suscripción
        await updateSubscriptionStatus({
          stripeSubscriptionId: subscription.id,
          status: subscription.status
        });
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        console.log('❌ Subscription canceled:', deletedSub.id);
        
        // Cancelar suscripción del usuario
        await cancelSubscription({
          stripeSubscriptionId: deletedSub.id
        });
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('💰 Payment succeeded:', invoice.id);
        
        // Renovar período de suscripción
        await renewSubscription({
          stripeSubscriptionId: invoice.subscription
        });
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('⚠️ Payment failed:', failedInvoice.id);
        
        // Notificar al usuario sobre el fallo
        await notifyPaymentFailed({
          stripeCustomerId: failedInvoice.customer
        });
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });
    */

    // MODO DEMO - Solo log
    console.log('🔔 Stripe Webhook recibido (demo mode)');
    console.log('Body:', req.body);
    
    return res.status(200).json({
      received: true,
      demo: true,
      message: 'Stripe no configurado todavía'
    });

  } catch (error) {
    console.error('Error en stripe-webhook:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ============================================================================
// FUNCIONES AUXILIARES (para cuando conectes con base de datos)
// ============================================================================

// TODO: Implementar con tu base de datos real (Supabase, Firebase, etc.)

async function activateSubscription({ userId, planId, stripeCustomerId, stripeSubscriptionId }) {
  console.log('✅ Activando suscripción:', { userId, planId });
  
  // TODO: Guardar en base de datos
  /*
  await db.users.update({
    where: { id: userId },
    data: {
      subscriptionPlan: planId,
      stripeCustomerId: stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId,
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      monthlyMessageCount: 0,
      monthlyDalleCount: 0,
      monthlyVisionCount: 0,
      monthlyDocumentCount: 0
    }
  });
  */
}

async function updateSubscriptionStatus({ stripeSubscriptionId, status }) {
  console.log('🔄 Actualizando estado de suscripción:', { stripeSubscriptionId, status });
  
  // TODO: Actualizar en base de datos
  /*
  await db.subscriptions.update({
    where: { stripeSubscriptionId: stripeSubscriptionId },
    data: { status: status }
  });
  */
}

async function cancelSubscription({ stripeSubscriptionId }) {
  console.log('❌ Cancelando suscripción:', { stripeSubscriptionId });
  
  // TODO: Actualizar en base de datos
  /*
  await db.subscriptions.update({
    where: { stripeSubscriptionId: stripeSubscriptionId },
    data: {
      status: 'canceled',
      canceledAt: new Date()
    }
  });
  */
}

async function renewSubscription({ stripeSubscriptionId }) {
  console.log('🔄 Renovando suscripción:', { stripeSubscriptionId });
  
  // TODO: Resetear contadores mensuales
  /*
  await db.users.update({
    where: { stripeSubscriptionId: stripeSubscriptionId },
    data: {
      monthlyMessageCount: 0,
      monthlyDalleCount: 0,
      monthlyVisionCount: 0,
      monthlyDocumentCount: 0,
      lastRenewalDate: new Date()
    }
  });
  */
}

async function notifyPaymentFailed({ stripeCustomerId }) {
  console.log('⚠️ Notificando fallo de pago:', { stripeCustomerId });
  
  // TODO: Enviar email al usuario
  /*
  await sendEmail({
    to: user.email,
    subject: 'Problema con tu suscripción a Domus-IA',
    template: 'payment-failed',
    data: { userName: user.name }
  });
  */
}
