/**
 * Safe Initialization Handler
 * Asegura que todos los scripts se carguen sin errores
 */

(function() {
    'use strict';
    
    // Flag para tracking de errores
    window.domusIAErrors = [];
    
    // Capturar errores globales
    window.addEventListener('error', function(event) {
        const error = {
            message: event.message,
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            timestamp: new Date().toISOString()
        };
        
        window.domusIAErrors.push(error);
        
        console.error('🚨 Error capturado:', error);
        
        // No prevenir la propagación para que el error se muestre en console
        return false;
    });
    
    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', function(event) {
        const error = {
            type: 'unhandledrejection',
            reason: event.reason,
            timestamp: new Date().toISOString()
        };
        
        window.domusIAErrors.push(error);
        
        console.error('🚨 Promise rechazada:', error);
    });
    
    // Verificar que las clases globales se hayan cargado correctamente
    function checkGlobalClasses() {
        const required = {
            'AuthSystem': typeof window.AuthSystem !== 'undefined',
            'authSystem': typeof window.authSystem !== 'undefined',
            'PaymentSystem': typeof window.PaymentSystem !== 'undefined',
            'paymentSystem': typeof window.paymentSystem !== 'undefined',
            'CookieConsent': typeof window.CookieConsent !== 'undefined',
            'cookieConsent': typeof window.cookieConsent !== 'undefined',
            'showRegisterModal': typeof window.showRegisterModal === 'function',
            'showLoginModal': typeof window.showLoginModal === 'function',
            'handleRegister': typeof window.handleRegister === 'function',
            'handleLogin': typeof window.handleLogin === 'function'
        };
        
        const missing = [];
        for (const [name, exists] of Object.entries(required)) {
            if (!exists) {
                missing.push(name);
            }
        }
        
        if (missing.length > 0) {
            console.warn('⚠️ Clases/funciones no cargadas:', missing);
            return false;
        }
        
        console.log('✅ Todas las clases globales cargadas correctamente');
        return true;
    }
    
    // Ejecutar verificación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkGlobalClasses, 100);
        });
    } else {
        setTimeout(checkGlobalClasses, 100);
    }
    
    // Función de diagnóstico para el usuario
    window.domusIADiagnostic = function() {
        console.log('📊 DIAGNÓSTICO DE DOMUS-IA');
        console.log('==========================');
        console.log('Errores encontrados:', window.domusIAErrors.length);
        
        if (window.domusIAErrors.length > 0) {
            console.log('\n🚨 Errores:');
            window.domusIAErrors.forEach((error, index) => {
                console.log(`${index + 1}.`, error);
            });
        }
        
        console.log('\n📦 Estado de clases globales:');
        console.log('AuthSystem:', typeof window.AuthSystem);
        console.log('authSystem:', typeof window.authSystem);
        console.log('PaymentSystem:', typeof window.PaymentSystem);
        console.log('paymentSystem:', typeof window.paymentSystem);
        console.log('CookieConsent:', typeof window.CookieConsent);
        console.log('cookieConsent:', typeof window.cookieConsent);
        console.log('DomusIA:', typeof window.DomusIA);
        console.log('SofiaAI:', typeof window.SofiaAI);
        
        console.log('\n🔧 Funciones globales:');
        console.log('showRegisterModal:', typeof window.showRegisterModal);
        console.log('showLoginModal:', typeof window.showLoginModal);
        console.log('handleRegister:', typeof window.handleRegister);
        console.log('handleLogin:', typeof window.handleLogin);
        console.log('closeAuthModals:', typeof window.closeAuthModals);
        
        console.log('\n✅ Para reportar errores, copia esta información');
        
        return {
            errors: window.domusIAErrors,
            hasErrors: window.domusIAErrors.length > 0,
            globalClasses: {
                AuthSystem: typeof window.AuthSystem,
                authSystem: typeof window.authSystem,
                PaymentSystem: typeof window.PaymentSystem,
                paymentSystem: typeof window.paymentSystem
            }
        };
    };
    
    // Mensaje de bienvenida
    console.log('%c🏠 Domus-IA España', 'font-size: 20px; font-weight: bold; color: #d4af37;');
    console.log('%cSistema de inicialización segura activado', 'color: #6b7280;');
    console.log('%cEjecuta domusIADiagnostic() para ver el estado', 'color: #6b7280;');
    
})();
