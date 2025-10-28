// ============================================
// 💡 PROMPT SUGGESTIONS - MEJORA UX #1
// ============================================
// Ejemplos clicables de prompts para guiar al usuario

class PromptSuggestions {
    constructor() {
        this.suggestions = [
            {
                icon: '🏠',
                text: 'Busco un piso de 3 habitaciones en Madrid',
                category: 'busqueda'
            },
            {
                icon: '💰',
                text: '¿Cuánto vale el m² en Barcelona?',
                category: 'precios'
            },
            {
                icon: '🎨',
                text: 'Genera un render de una cocina moderna',
                category: 'imagenes'
            },
            {
                icon: '📊',
                text: 'Analiza este contrato de arrendamiento',
                category: 'documentos'
            },
            {
                icon: '🔍',
                text: 'Busca información sobre el mercado inmobiliario actual',
                category: 'web'
            },
            {
                icon: '🏢',
                text: 'Quiero vender mi piso, ¿por dónde empiezo?',
                category: 'venta'
            },
            {
                icon: '📈',
                text: '¿Cómo está el mercado en Valencia?',
                category: 'mercado'
            },
            {
                icon: '🎯',
                text: 'Ayúdame a valorar una propiedad',
                category: 'valoracion'
            },
            {
                icon: '📝',
                text: '¿Qué documentos necesito para vender?',
                category: 'documentacion'
            },
            {
                icon: '🏘️',
                text: 'Compara barrios de Madrid',
                category: 'comparacion'
            }
        ];
        
        this.currentSuggestions = [];
        this.isVisible = true;
        this.init();
    }
    
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Usar MutationObserver para detectar cuando se crea el chat
        const observer = new MutationObserver(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput && !document.getElementById('promptSuggestions')) {
                console.log('✅ Chat input detectado, creando sugerencias...');
                this.createSuggestionsContainer();
                this.selectRandomSuggestions();
                this.renderSuggestions();
                this.bindEvents();
            }
        });
        
        // Observar cambios en el body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // También intentar inmediatamente por si ya existe
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput && !document.getElementById('promptSuggestions')) {
                this.createSuggestionsContainer();
                this.selectRandomSuggestions();
                this.renderSuggestions();
                this.bindEvents();
            }
        }, 1000);
    }
    
    createSuggestionsContainer() {
        // Buscar el input del chat
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) {
            console.log('⏳ Chat input no encontrado aún, reintentando...');
            setTimeout(() => this.setup(), 1000);
            return;
        }
        
        // Verificar si ya existe el contenedor
        if (document.getElementById('promptSuggestions')) {
            console.log('✅ Contenedor ya existe');
            return;
        }
        
        // Buscar el form container
        const formContainer = chatInput.closest('form');
        if (!formContainer) {
            console.log('⚠️ No se encontró form, buscando alternativa...');
            // Intentar insertar después del input directamente
            const container = document.createElement('div');
            container.id = 'promptSuggestions';
            container.className = 'prompt-suggestions-container';
            container.innerHTML = `<div class="suggestions-wrapper"></div>`;
            chatInput.parentNode.insertBefore(container, chatInput);
            console.log('✅ Contenedor creado (alternativa)');
            return;
        }
        
        // Crear contenedor de sugerencias
        const container = document.createElement('div');
        container.id = 'promptSuggestions';
        container.className = 'prompt-suggestions-container';
        container.innerHTML = `<div class="suggestions-wrapper"></div>`;
        
        // Insertar DENTRO del form, antes del input
        formContainer.insertBefore(container, chatInput.parentElement || chatInput);
        
        console.log('✅ Contenedor de sugerencias creado dentro del form');
    }
    
    selectRandomSuggestions() {
        // Seleccionar 4 sugerencias aleatorias
        const shuffled = [...this.suggestions].sort(() => Math.random() - 0.5);
        this.currentSuggestions = shuffled.slice(0, 4);
    }
    
    renderSuggestions() {
        const wrapper = document.querySelector('.suggestions-wrapper');
        if (!wrapper) {
            console.log('⏳ Wrapper no encontrado, reintentando...');
            setTimeout(() => this.renderSuggestions(), 500);
            return;
        }
        
        wrapper.innerHTML = this.currentSuggestions.map((suggestion, index) => `
            <button 
                type="button"
                class="suggestion-pill" 
                data-prompt="${this.escapeHtml(suggestion.text)}"
                data-index="${index}"
                style="animation-delay: ${index * 0.1}s"
            >
                <span class="suggestion-icon">${suggestion.icon}</span>
                <span class="suggestion-text">${this.escapeHtml(suggestion.text)}</span>
            </button>
        `).join('');
        
        console.log('✅ Sugerencias renderizadas');
    }
    
    bindEvents() {
        // Click en sugerencias
        document.addEventListener('click', (e) => {
            const pill = e.target.closest('.suggestion-pill');
            if (pill) {
                e.preventDefault();
                const prompt = pill.dataset.prompt;
                this.selectSuggestion(prompt);
            }
        });
        
        // Ocultar cuando usuario empieza a escribir
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                if (chatInput.value.trim().length > 0) {
                    this.hide();
                } else {
                    this.show();
                }
            });
            
            // Mostrar de nuevo cuando el input está vacío
            chatInput.addEventListener('focus', () => {
                if (chatInput.value.trim().length === 0) {
                    this.show();
                }
            });
        }
        
        // Refrescar sugerencias cada vez que se abre el chat
        // Usar observer para detectar cuando el chat se abre
        this.observeChatModal();
    }
    
    observeChatModal() {
        // Intentar override del método openChat
        const tryOverride = () => {
            if (window.domusIA?.openChat) {
                const originalOpenChat = window.domusIA.openChat;
                window.domusIA.openChat = function() {
                    originalOpenChat.call(this);
                    setTimeout(() => {
                        // Re-crear contenedor si no existe
                        if (!document.getElementById('promptSuggestions')) {
                            window.promptSuggestions.createSuggestionsContainer();
                        }
                        window.promptSuggestions.show();
                        window.promptSuggestions.selectRandomSuggestions();
                        window.promptSuggestions.renderSuggestions();
                    }, 500);
                };
                console.log('✅ Chat open hook instalado');
                return true;
            }
            return false;
        };
        
        // Intentar inmediatamente
        if (!tryOverride()) {
            // Si no está listo, reintentar cada segundo
            const interval = setInterval(() => {
                if (tryOverride()) {
                    clearInterval(interval);
                }
            }, 1000);
            
            // Timeout después de 10 segundos
            setTimeout(() => clearInterval(interval), 10000);
        }
    }
    
    selectSuggestion(prompt) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = prompt;
            chatInput.focus();
            this.hide();
            
            // Opcional: enviar automáticamente
            // chatInput.form?.requestSubmit();
        }
    }
    
    show() {
        const container = document.getElementById('promptSuggestions');
        if (container && !this.isVisible) {
            container.classList.remove('hidden');
            this.isVisible = true;
        }
    }
    
    hide() {
        const container = document.getElementById('promptSuggestions');
        if (container && this.isVisible) {
            container.classList.add('hidden');
            this.isVisible = false;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cuando el documento esté listo
if (typeof window !== 'undefined') {
    window.promptSuggestions = new PromptSuggestions();
}
