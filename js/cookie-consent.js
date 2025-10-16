/**
 * 🍪 COOKIE CONSENT MANAGER - DOMUS-IA ESPAÑA
 * Versión: 1.0.0
 * Gestión de consentimiento de cookies según RGPD y LSSI
 */

class CookieConsent {
    constructor() {
        this.cookieConsentKey = 'domus_cookie_consent';
        this.cookieConsentDate = 'domus_cookie_consent_date';
        this.bannerShown = false;
        
        // Configuración del banner
        this.config = {
            expiryDays: 365, // Duración del consentimiento (1 año)
            position: 'bottom', // 'bottom' o 'top'
            theme: 'dark' // 'dark' o 'light'
        };
    }

    /**
     * Inicializa el gestor de cookies
     */
    init() {
        // Verificar si ya hay consentimiento guardado
        const consent = this.getConsent();
        
        if (!consent) {
            // No hay consentimiento guardado, mostrar banner
            this.showBanner();
        } else {
            // Ya hay consentimiento, verificar si ha expirado
            const consentDate = localStorage.getItem(this.cookieConsentDate);
            if (consentDate) {
                const daysSinceConsent = this.getDaysSince(new Date(consentDate));
                if (daysSinceConsent > this.config.expiryDays) {
                    // Consentimiento expirado, solicitar de nuevo
                    this.showBanner();
                } else {
                    console.log('✅ Consentimiento de cookies válido (caduca en ' + 
                               (this.config.expiryDays - daysSinceConsent) + ' días)');
                }
            }
        }
    }

    /**
     * Obtiene el consentimiento guardado
     * @returns {Object|null} Objeto con preferencias o null si no existe
     */
    getConsent() {
        const consent = localStorage.getItem(this.cookieConsentKey);
        return consent ? JSON.parse(consent) : null;
    }

    /**
     * Guarda el consentimiento
     * @param {Object} preferences - Objeto con preferencias de cookies
     */
    saveConsent(preferences) {
        localStorage.setItem(this.cookieConsentKey, JSON.stringify(preferences));
        localStorage.setItem(this.cookieConsentDate, new Date().toISOString());
        console.log('✅ Consentimiento de cookies guardado:', preferences);
    }

    /**
     * Calcula días transcurridos desde una fecha
     * @param {Date} date - Fecha de inicio
     * @returns {number} Días transcurridos
     */
    getDaysSince(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Muestra el banner de consentimiento
     */
    showBanner() {
        if (this.bannerShown) return;
        
        // Crear HTML del banner
        const bannerHTML = `
            <div id="cookie-consent-banner" class="cookie-consent-banner">
                <div class="cookie-consent-content">
                    <div class="cookie-consent-icon">
                        <i class="fas fa-cookie-bite"></i>
                    </div>
                    <div class="cookie-consent-text">
                        <h3>🍪 Utilizamos Cookies</h3>
                        <p>
                            Utilizamos cookies <strong>esenciales</strong> para el funcionamiento de la plataforma 
                            y guardamos tu historial de conversaciones en <strong>localStorage</strong>. 
                            <strong>NO utilizamos cookies publicitarias ni rastreamos tu comportamiento.</strong>
                        </p>
                        <p style="font-size: 0.9em; margin-top: 0.5rem;">
                            Al continuar navegando, aceptas nuestra 
                            <a href="legal/cookies.html" target="_blank">Política de Cookies</a>, 
                            <a href="legal/privacidad.html" target="_blank">Privacidad</a> y 
                            <a href="legal/terminos.html" target="_blank">Términos</a>.
                        </p>
                    </div>
                    <div class="cookie-consent-actions">
                        <button id="cookie-accept-all" class="cookie-btn cookie-btn-accept">
                            <i class="fas fa-check"></i> Aceptar
                        </button>
                        <button id="cookie-reject-optional" class="cookie-btn cookie-btn-reject">
                            <i class="fas fa-times"></i> Solo Esenciales
                        </button>
                        <button id="cookie-settings" class="cookie-btn cookie-btn-settings">
                            <i class="fas fa-cog"></i> Configurar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insertar banner en el DOM
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        this.bannerShown = true;

        // Añadir event listeners
        this.attachEventListeners();

        // Animación de entrada
        setTimeout(() => {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) banner.classList.add('show');
        }, 300);
    }

    /**
     * Oculta el banner de consentimiento
     */
    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
                this.bannerShown = false;
            }, 400);
        }
    }

    /**
     * Adjunta event listeners a los botones
     */
    attachEventListeners() {
        // Botón "Aceptar Todas"
        const acceptBtn = document.getElementById('cookie-accept-all');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptAll());
        }

        // Botón "Solo Esenciales"
        const rejectBtn = document.getElementById('cookie-reject-optional');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.rejectOptional());
        }

        // Botón "Configurar"
        const settingsBtn = document.getElementById('cookie-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
    }

    /**
     * Acepta todas las cookies
     */
    acceptAll() {
        const preferences = {
            essential: true,      // Cookies técnicas (obligatorias)
            preferences: true,    // localStorage (conversaciones, preferencias)
            analytics: false,     // Actualmente NO usadas
            marketing: false      // NO usadas
        };
        
        this.saveConsent(preferences);
        this.hideBanner();
        
        // Mostrar notificación
        this.showNotification('✅ Preferencias de cookies guardadas. Gracias por confiar en Domus-IA.', 'success');
    }

    /**
     * Acepta solo cookies esenciales
     */
    rejectOptional() {
        const preferences = {
            essential: true,      // Obligatorias (no se pueden rechazar)
            preferences: false,   // Rechazar localStorage
            analytics: false,
            marketing: false
        };
        
        this.saveConsent(preferences);
        this.hideBanner();
        
        // Advertencia sobre funcionalidad limitada
        this.showNotification(
            '⚠️ Solo cookies esenciales activadas. El historial de conversaciones NO se guardará.', 
            'warning'
        );
    }

    /**
     * Abre el modal de configuración avanzada
     */
    openSettings() {
        const modalHTML = `
            <div id="cookie-settings-modal" class="cookie-modal">
                <div class="cookie-modal-content">
                    <div class="cookie-modal-header">
                        <h2><i class="fas fa-cog"></i> Configuración de Cookies</h2>
                        <button id="cookie-modal-close" class="cookie-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="cookie-modal-body">
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>🔧 Cookies Técnicas (Esenciales)</h3>
                                    <p>Necesarias para el funcionamiento básico de la plataforma.</p>
                                </div>
                                <label class="cookie-toggle disabled">
                                    <input type="checkbox" checked disabled>
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                            <ul class="cookie-details">
                                <li><strong>sofia_session:</strong> Mantiene tu sesión activa</li>
                                <li><strong>csrf_token:</strong> Protección contra ataques</li>
                            </ul>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>💾 localStorage (Preferencias)</h3>
                                    <p>Guarda tu historial de conversaciones y configuración.</p>
                                </div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" id="preferences-toggle" checked>
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                            <ul class="cookie-details">
                                <li><strong>sofia_conversations:</strong> Historial de chat</li>
                                <li><strong>user_preferences:</strong> Idioma, voz, tema</li>
                            </ul>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>📊 Cookies Analíticas</h3>
                                    <p>Miden el tráfico y uso del sitio (anónimas).</p>
                                </div>
                                <label class="cookie-toggle disabled">
                                    <input type="checkbox" id="analytics-toggle" disabled>
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 0.5rem;">
                                <i class="fas fa-info-circle"></i> Actualmente NO utilizadas.
                            </p>
                        </div>

                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div>
                                    <h3>📢 Cookies de Marketing</h3>
                                    <p>Publicidad personalizada y rastreo de comportamiento.</p>
                                </div>
                                <label class="cookie-toggle disabled">
                                    <input type="checkbox" id="marketing-toggle" disabled>
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 0.5rem;">
                                <i class="fas fa-ban"></i> <strong>NUNCA</strong> utilizadas. NO rastreamos para publicidad.
                            </p>
                        </div>
                    </div>

                    <div class="cookie-modal-footer">
                        <button id="cookie-save-settings" class="cookie-btn cookie-btn-accept">
                            <i class="fas fa-save"></i> Guardar Preferencias
                        </button>
                        <button id="cookie-cancel-settings" class="cookie-btn cookie-btn-secondary">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listeners del modal
        document.getElementById('cookie-modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cookie-cancel-settings')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cookie-save-settings')?.addEventListener('click', () => this.saveCustomSettings());
    }

    /**
     * Guarda configuración personalizada del modal
     */
    saveCustomSettings() {
        const preferencesToggle = document.getElementById('preferences-toggle');
        
        const preferences = {
            essential: true,
            preferences: preferencesToggle ? preferencesToggle.checked : false,
            analytics: false,
            marketing: false
        };

        this.saveConsent(preferences);
        this.closeModal();
        this.hideBanner();
        
        this.showNotification('✅ Preferencias de cookies guardadas correctamente.', 'success');
    }

    /**
     * Cierra el modal de configuración
     */
    closeModal() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) modal.remove();
    }

    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'warning', 'error'
     */
    showNotification(message, type = 'success') {
        const colors = {
            success: '#4ade80',
            warning: '#fbbf24',
            error: '#ef4444'
        };

        const notification = document.createElement('div');
        notification.className = 'cookie-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: #1a1a1a;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            z-index: 100000;
            font-weight: 500;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Verifica si el usuario ha dado consentimiento para una categoría
     * @param {string} category - Categoría de cookie: 'essential', 'preferences', 'analytics', 'marketing'
     * @returns {boolean}
     */
    hasConsent(category) {
        const consent = this.getConsent();
        if (!consent) return false;
        return consent[category] === true;
    }

    /**
     * Elimina el consentimiento (para testing)
     */
    resetConsent() {
        localStorage.removeItem(this.cookieConsentKey);
        localStorage.removeItem(this.cookieConsentDate);
        console.log('🔄 Consentimiento de cookies eliminado');
    }
}

// Inicializar gestor de cookies cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
    window.cookieConsent.init();
});

// Exportar para uso global
window.CookieConsent = CookieConsent;
