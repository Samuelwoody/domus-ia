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
        // Intentar crear el contenedor después de un delay
        // (el chat modal puede cargarse dinámicamente)
        setTimeout(() => {
            this.createSuggestionsContainer();
            this.selectRandomSuggestions();
            this.renderSuggestions();
            this.bindEvents();
        }, 500);
    }
    
    createSuggestionsContainer() {
        // Buscar el input del chat
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) {
            console.log('⏳ Chat input no encontrado aún, reintentando...');
            setTimeout(() => this.setup(), 1000);
            return;
        }
        
        // Buscar el form container
        const formContainer = chatInput.closest('form') || chatInput.parentElement;
        if (!formContainer) {
            console.error('❌ No se pudo encontrar el contenedor del formulario');
            return;
        }
        
        // Crear contenedor de sugerencias
        const container = document.createElement('div');
        container.id = 'promptSuggestions';
        container.className = 'prompt-suggestions-container';
        container.innerHTML = `
            <div class="suggestions-wrapper"></div>
        `;
        
        // Insertar antes del form
        formContainer.parentNode.insertBefore(container, formContainer);
        
        console.log('✅ Contenedor de sugerencias creado');
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
        const originalOpenChat = window.domusIA?.openChat;
        if (originalOpenChat) {
            window.domusIA.openChat = () => {
                originalOpenChat.call(window.domusIA);
                setTimeout(() => {
                    this.show();
                    this.selectRandomSuggestions();
                    this.renderSuggestions();
                }, 300);
            };
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
