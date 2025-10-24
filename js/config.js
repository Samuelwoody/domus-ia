/**
 * Domus-IA España - Frontend Configuration
 * 
 * Este archivo centraliza la configuración del frontend para
 * facilitar el cambio entre desarrollo y producción.
 */

const CONFIG = {
    // Backend API Configuration
    API: {
        // Backend desplegado en Vercel (mismo dominio)
        BASE_URL: '',  // Empty string = same domain (Vercel serverless functions)
        
        ENDPOINTS: {
            CHAT: '/api/chat',
            CAPABILITIES: '/api/capabilities',
            DALLE: '/api/dalle',
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            SUBSCRIPTION_STATUS: '/api/subscription/status',
            SUBSCRIPTION_CREATE: '/api/subscription/create'
        },
        
        TIMEOUT: 30000 // 30 segundos
    },
    
    // Application Settings
    APP: {
        NAME: 'Domus-IA España',
        TAGLINE: 'SuperAgente Inmobiliario de España',
        VERSION: '1.0.0',
        COMPANY: 'MontCastell-AI',
        
        // Features
        FEATURES: {
            USE_BACKEND: true,  // ✅ Backend activo en Vercel
            USE_MOCK_RESPONSES: false,  // ✅ No usar respuestas simuladas
            ENABLE_PAYMENT: false,  // Habilitar cuando integres Stripe
            ENABLE_ADVANCED_FEATURES: true,  // ✅ Imágenes, Vision, búsqueda web, documentos
            WEB_SEARCH: true,  // ✅ Búsqueda web con Tavily
            VISION_API: true,  // ✅ Análisis de imágenes
            DALLE_API: true,  // ✅ Generación de imágenes
            DOCUMENT_UPLOAD: true  // ✅ Subida de documentos
        }
    },
    
    // Subscription Plans
    // ============================================================================
    // 💰 PLANES DE SUSCRIPCIÓN CON LÍMITES AVANZADOS
    // ============================================================================
    PLANS: {
        PARTICULAR: {
            id: 'particular',
            name: 'PARTICULAR - Propietarios Espabilados',
            price: 99,
            period: 'mes',
            limits: {
                messages: 500,            // Mensajes de chat por mes
                dalleImages: 10,          // Generaciones DALL-E por mes
                visionAnalysis: 100,      // Análisis de imágenes por mes
                documentUploads: 50,      // Documentos PDF/Word/Excel por mes
                documentPages: 20,        // Máximo páginas por documento
                webSearches: 999999       // Búsquedas web (ilimitadas)
            },
            features: {
                basicChat: true,
                webSearch: true,
                visionAPI: true,
                imageGeneration: true,
                documentAnalysis: true,
                prioritySupport: false
            }
        },
        PROFESIONAL: {
            id: 'profesional',
            name: 'PROFESIONAL - Agentes Saturados',
            price: 199,
            period: 'mes',
            limits: {
                messages: 1000,           // Mensajes de chat por mes
                dalleImages: 30,          // Generaciones DALL-E por mes
                visionAnalysis: 300,      // Análisis de imágenes por mes
                documentUploads: 150,     // Documentos PDF/Word/Excel por mes
                documentPages: 20,        // Máximo páginas por documento
                webSearches: 999999       // Búsquedas web (ilimitadas)
            },
            features: {
                basicChat: true,
                webSearch: true,
                visionAPI: true,
                imageGeneration: true,
                documentAnalysis: true,
                prioritySupport: true,
                apiAccess: false
            }
        },
        PREMIUM: {
            id: 'premium',
            name: 'PREMIUM - Escalado Total',
            price: 399,
            period: 'mes',
            limits: {
                messages: 3000,           // Mensajes de chat por mes
                dalleImages: 100,         // Generaciones DALL-E por mes
                visionAnalysis: 999999,   // Análisis de imágenes (ilimitadas)
                documentUploads: 500,     // Documentos PDF/Word/Excel por mes
                documentPages: 50,        // Máximo páginas por documento
                webSearches: 999999       // Búsquedas web (ilimitadas)
            },
            features: {
                basicChat: true,
                webSearch: true,
                visionAPI: true,
                imageGeneration: true,
                documentAnalysis: true,
                prioritySupport: true,
                apiAccess: true,
                whiteLabel: true
            }
        }
    },
    
    // Sofia AI Settings
    SOFIA: {
        AVATAR: 'images/sofia-avatar.jpg',
        DISPLAY_NAME: 'Sofía',
        ROLE: 'SuperAgente Inmobiliario',
        DESCRIPTION: 'Tu asistente inmobiliaria con IA especializada en el mercado español',
        
        PERSONALITY: {
            tone: 'profesional, cálida, empática',
            expertise: 'sector inmobiliario español',
            focus: 'resolver problemas específicos del usuario'
        }
    },
    
    // UI Settings
    UI: {
        THEME: {
            colors: {
                navy: '#2c0a0e',
                gold: '#d4af37',
                accent: '#8b1a1a',
                cream: '#fafafa',
                sage: '#6b7280'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #d4af37 0%, #8b1a1a 100%)'
            }
        },
        
        ANIMATIONS: {
            typingSpeed: 50,  // ms por carácter
            messageDelay: 1000  // delay antes de mostrar respuesta
        }
    },
    
    // Development Settings
    DEV: {
        DEBUG_MODE: false,  // Mostrar logs en consola
        MOCK_DELAY: 1500,    // Delay artificial para simular latencia de API
        SHOW_API_STATUS: true  // Mostrar indicador de modo demo/producción
    }
};

// Detectar entorno
CONFIG.IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';

// Ajustar configuración según entorno
if (!CONFIG.IS_PRODUCTION) {
    CONFIG.DEV.DEBUG_MODE = true;
    console.log('🔧 Domus-IA España - Modo Desarrollo');
    console.log('📍 Backend:', CONFIG.API.BASE_URL);
    console.log('🤖 Backend conectado:', CONFIG.APP.FEATURES.USE_BACKEND);
    console.log('🎭 Modo simulación:', CONFIG.APP.FEATURES.USE_MOCK_RESPONSES);
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
