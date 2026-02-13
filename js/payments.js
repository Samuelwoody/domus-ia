// js/payments.js
// Sistema de pagos con Stripe - Listo para conectar

class PaymentSystem {
    constructor() {
        this.stripePublicKey = null; // TODO: Añadir STRIPE_PUBLIC_KEY en variables de entorno
        this.stripe = null;
        this.isDemo = true; // Cambiar a false cuando Stripe esté configurado
        
        // Planes disponibles
        this.plans = {
            particular: {
                id: 'particular',
                name: 'Pro 49',
                price: 49,
                currency: 'EUR',
                interval: 'month',
                features: {
                    agentsAllowed: 1,
                    funnelsPerMonth: 1,
                    voiceAgent: true,
                    leadRouter: 'basic'
                },
                stripePriceId: 'domus_pro_49' // Stripe demo mapping
            },
            profesional: {
                id: 'profesional',
                name: 'Pro 49',
                price: 49,
                currency: 'EUR',
                interval: 'month',
                features: {
                    agentsAllowed: 1,
                    funnelsPerMonth: 1,
                    voiceAgent: true,
                    leadRouter: 'basic'
                },
                stripePriceId: 'domus_pro_49' // Stripe demo mapping
            },
            premium: {
                id: 'premium',
                name: 'Premium 999',
                price: 999,
                currency: 'EUR',
                interval: 'month',
                features: {
                    agentsAllowed: 'unlimited',
                    funnelsPerMonth: 'unlimited',
                    voiceAgent: true,
                    leadRouter: 'full'
                },
                stripePriceId: 'domus_premium_999' // Stripe demo mapping
            }
        };
    }

    // Inicializar Stripe
    async initialize() {
        if (this.isDemo) {
            console.log('💳 Payment System en modo DEMO');
            return;
        }

        // TODO: Descomentar cuando tengas Stripe configurado
        /*
        if (typeof Stripe === 'undefined') {
            console.error('Stripe.js no está cargado');
            return;
        }

        this.stripe = Stripe(this.stripePublicKey);
        console.log('✅ Stripe inicializado');
        */
    }

    // Crear sesión de checkout
    async createCheckoutSession(planId, userId, userEmail) {
        try {
            console.log('💳 Creando sesión de checkout:', { planId, userId, userEmail });

            const response = await fetch('/api/stripe-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    planId: planId,
                    userId: userId,
                    userEmail: userEmail
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al crear sesión de pago');
            }

            if (this.isDemo || data.demo) {
                // Modo demo - Simular pago exitoso
                console.log('🎭 MODO DEMO - Simulando pago exitoso');
                alert(`DEMO: Se simularía pago de ${this.plans[planId].price}€ para plan ${planId}`);
                return { demo: true };
            }

            // TODO: Descomentar cuando tengas Stripe configurado
            /*
            // Redirigir a Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: data.sessionId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
            */

            return data;

        } catch (error) {
            console.error('Error en createCheckoutSession:', error);
            throw error;
        }
    }

    // Abrir portal del cliente (para gestionar suscripción)
    async openCustomerPortal(stripeCustomerId) {
        try {
            console.log('🏛️ Abriendo portal del cliente:', stripeCustomerId);

            const response = await fetch('/api/stripe-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stripeCustomerId: stripeCustomerId
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al abrir portal');
            }

            if (this.isDemo || data.demo) {
                console.log('🎭 MODO DEMO - Portal del cliente');
                alert('DEMO: Aquí se abriría el portal de Stripe para gestionar la suscripción');
                return;
            }

            // Redirigir al portal
            window.location.href = data.url;

        } catch (error) {
            console.error('Error en openCustomerPortal:', error);
            throw error;
        }
    }

    // Obtener información del plan
    getPlanInfo(planId) {
        return this.plans[planId] || null;
    }

    // Verificar si el usuario tiene un plan activo
    hasActivePlan(userPlan) {
        return userPlan && userPlan !== 'free';
    }

    // Calcular uso del mes
    calculateUsage(userStats, planId) {
        const plan = this.plans[planId];
        if (!plan) return null;

        return {
            messages: {
                used: userStats.monthlyMessageCount || 0,
                limit: plan.features.messages,
                percentage: ((userStats.monthlyMessageCount || 0) / plan.features.messages) * 100
            },
            dalle: {
                used: userStats.monthlyDalleCount || 0,
                limit: plan.features.dalle,
                percentage: ((userStats.monthlyDalleCount || 0) / plan.features.dalle) * 100
            },
            vision: {
                used: userStats.monthlyVisionCount || 0,
                limit: plan.features.vision === 'unlimited' ? '∞' : plan.features.vision,
                percentage: plan.features.vision === 'unlimited' ? 0 : ((userStats.monthlyVisionCount || 0) / plan.features.vision) * 100
            },
            documents: {
                used: userStats.monthlyDocumentCount || 0,
                limit: plan.features.documents,
                percentage: ((userStats.monthlyDocumentCount || 0) / plan.features.documents) * 100
            }
        };
    }

    // Verificar si se ha alcanzado el límite
    isLimitReached(usage, feature) {
        if (!usage || !usage[feature]) return false;
        if (usage[feature].limit === '∞') return false;
        return usage[feature].used >= usage[feature].limit;
    }

    // Formatear precio
    formatPrice(price, currency = 'EUR') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency
        }).format(price);
    }
}

// Exportar instancia global
window.PaymentSystem = PaymentSystem;
window.paymentSystem = new PaymentSystem();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.paymentSystem.initialize();
});
