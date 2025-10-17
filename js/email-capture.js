// js/email-capture.js
// Sistema de captación de email al mensaje 3
// Compatible con auth.js y main.js existentes
// Versión: 1.0.0

class EmailCaptureSystem {
    constructor() {
        this.messageCount = 0;
        this.emailCaptured = false;
        this.loadState();
        
        console.log('📧 EmailCaptureSystem inicializado');
    }
    
    // =============================================
    // GESTIÓN DE ESTADO
    // =============================================
    
    loadState() {
        const state = localStorage.getItem('emailCaptureState');
        if (state) {
            try {
                const data = JSON.parse(state);
                this.messageCount = data.messageCount || 0;
                this.emailCaptured = data.emailCaptured || false;
            } catch (error) {
                console.error('Error cargando estado de email capture:', error);
            }
        }
        
        // Si ya hay sesión de auth.js, marcar como capturado
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            this.emailCaptured = true;
            console.log('✅ Usuario ya autenticado, email capture desactivado');
        }
    }
    
    saveState() {
        const state = {
            messageCount: this.messageCount,
            emailCaptured: this.emailCaptured
        };
        localStorage.setItem('emailCaptureState', JSON.stringify(state));
    }
    
    // =============================================
    // CONTADOR DE MENSAJES
    // =============================================
    
    incrementMessageCount() {
        // No capturar si ya está autenticado
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            console.log('👤 Usuario autenticado, skip email capture');
            this.emailCaptured = true;
            this.saveState();
            return;
        }
        
        // No capturar si ya se capturó
        if (this.emailCaptured) {
            return;
        }
        
        this.messageCount++;
        this.saveState();
        
        console.log(`📊 Mensaje ${this.messageCount}/3`);
        
        // Mostrar modal al mensaje 3
        if (this.messageCount === 3) {
            console.log('🎯 Mensaje 3 alcanzado - Mostrando modal de registro');
            setTimeout(() => {
                this.showEmailCaptureModal();
            }, 1000); // Pequeño delay para mejor UX
        }
    }
    
    // =============================================
    // MOSTRAR MODAL DE CAPTACIÓN
    // =============================================
    
    showEmailCaptureModal() {
        // Detectar tipo de usuario basado en conversación
        const userType = this.detectUserType();
        
        console.log('📋 Tipo de usuario detectado:', userType);
        
        // Reutilizar modal de registro existente de auth.js
        // Pero personalizarlo con mensaje especial
        this.personalizeRegisterModal(userType);
        
        // Mostrar modal usando función global de auth.js
        if (typeof showRegisterModal === 'function') {
            showRegisterModal();
        } else {
            console.error('❌ showRegisterModal() no disponible');
        }
        
        // Marcar como mostrado
        this.emailCaptured = true;
        this.saveState();
    }
    
    // =============================================
    // DETECCIÓN INTELIGENTE DE TIPO DE USUARIO
    // =============================================
    
    detectUserType() {
        // Analizar últimos mensajes en el chat para detectar palabras clave
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return 'particular';
        
        const allMessages = chatMessages.innerText.toLowerCase();
        
        // Keywords de profesional
        const professionalKeywords = [
            'agente', 'inmobiliaria', 'agencia', 'cliente', 'clientes',
            'cartera', 'captación', 'gestión', 'vendo casas', 'vendo pisos',
            'intermediario', 'comisión', 'honorarios', 'profesional',
            'equipo', 'oficina', 'despacho', 'asesor', 'broker'
        ];
        
        // Keywords de particular
        const particularKeywords = [
            'mi piso', 'mi casa', 'mi vivienda', 'mi propiedad',
            'quiero vender', 'vender mi', 'comprar una', 'busco casa',
            'propietario', 'soy dueño', 'heredé', 'he heredado'
        ];
        
        // Contar coincidencias
        let professionalScore = 0;
        let particularScore = 0;
        
        professionalKeywords.forEach(keyword => {
            if (allMessages.includes(keyword)) {
                professionalScore++;
            }
        });
        
        particularKeywords.forEach(keyword => {
            if (allMessages.includes(keyword)) {
                particularScore++;
            }
        });
        
        console.log('🔍 Scores:', { professionalScore, particularScore });
        
        // Decidir tipo basado en score
        if (professionalScore > particularScore) {
            return 'profesional';
        } else {
            return 'particular';
        }
    }
    
    // =============================================
    // PERSONALIZAR MODAL SEGÚN TIPO DE USUARIO
    // =============================================
    
    personalizeRegisterModal(userType) {
        // Esperar a que el modal exista en el DOM
        setTimeout(() => {
            const registerModal = document.getElementById('registerModal');
            if (!registerModal) return;
            
            const title = registerModal.querySelector('h2');
            const subtitle = registerModal.querySelector('p');
            
            if (userType === 'profesional') {
                // Copy para profesionales
                if (title) {
                    title.innerHTML = '🏢 Crea tu CRM Profesional';
                }
                
                // Añadir subtítulo si no existe
                if (!subtitle && title) {
                    const newSubtitle = document.createElement('p');
                    newSubtitle.className = 'text-sm text-gray-600 mt-2 mb-4';
                    newSubtitle.innerHTML = 'Gestiona tus propiedades, contactos y tareas desde un solo lugar';
                    title.after(newSubtitle);
                }
                
                // Pre-seleccionar "profesional" en el select
                const userTypeSelect = registerModal.querySelector('select[name="userType"]');
                if (userTypeSelect) {
                    userTypeSelect.value = 'profesional';
                    // Trigger change para mostrar campo CIF/NIF
                    if (typeof toggleBusinessDocument === 'function') {
                        toggleBusinessDocument(userTypeSelect);
                    }
                }
                
            } else {
                // Copy para particulares
                if (title) {
                    title.innerHTML = '💎 Crea tu Área Privada Gratuita';
                }
                
                // Añadir subtítulo si no existe
                if (!subtitle && title) {
                    const newSubtitle = document.createElement('p');
                    newSubtitle.className = 'text-sm text-gray-600 mt-2 mb-4';
                    newSubtitle.innerHTML = 'Guarda tus conversaciones y propiedades para no perder nada';
                    title.after(newSubtitle);
                }
                
                // Pre-seleccionar "particular" en el select
                const userTypeSelect = registerModal.querySelector('select[name="userType"]');
                if (userTypeSelect) {
                    userTypeSelect.value = 'particular';
                }
            }
            
            // Añadir badge "Gratis" si no existe
            const form = registerModal.querySelector('form');
            if (form) {
                const existingBadge = form.querySelector('.free-badge');
                if (!existingBadge) {
                    const freeBadge = document.createElement('div');
                    freeBadge.className = 'free-badge bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4';
                    freeBadge.innerHTML = '✨ 100% Gratis - Sin tarjeta';
                    form.insertBefore(freeBadge, form.firstChild);
                }
            }
            
        }, 100);
    }
    
    // =============================================
    // RESET (para testing)
    // =============================================
    
    reset() {
        this.messageCount = 0;
        this.emailCaptured = false;
        this.saveState();
        console.log('🔄 Email capture reseteado');
    }
    
    // =============================================
    // UTILIDADES
    // =============================================
    
    getStatus() {
        return {
            messageCount: this.messageCount,
            emailCaptured: this.emailCaptured,
            isAuthenticated: window.authSystem ? window.authSystem.isAuthenticated() : false
        };
    }
}

// =============================================
// INSTANCIA GLOBAL
// =============================================

window.EmailCaptureSystem = EmailCaptureSystem;
window.emailCapture = new EmailCaptureSystem();

// =============================================
// DEBUG: Comandos de consola para testing
// =============================================

// Exponer funciones útiles para testing
window.emailCaptureDebug = {
    reset: () => window.emailCapture.reset(),
    status: () => console.table(window.emailCapture.getStatus()),
    trigger: () => window.emailCapture.showEmailCaptureModal(),
    simulate: (count) => {
        window.emailCapture.reset();
        for (let i = 0; i < count; i++) {
            window.emailCapture.incrementMessageCount();
        }
    }
};

console.log('💡 Debug commands disponibles:');
console.log('  emailCaptureDebug.status() - Ver estado actual');
console.log('  emailCaptureDebug.reset() - Resetear contador');
console.log('  emailCaptureDebug.trigger() - Forzar modal');
console.log('  emailCaptureDebug.simulate(3) - Simular 3 mensajes');

console.log('✅ Email Capture System cargado');
