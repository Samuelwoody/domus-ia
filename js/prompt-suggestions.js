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
        this.containerCreated = false;
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
        console.log('🚀 Iniciando PromptSuggestions...');
        
        // Usar MutationObserver para detectar cuando se crea el chat
        const observer = new MutationObserver(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput && !this.containerCreated) {
                console.log('✅ Chat input detectado, intentando crear sugerencias...');
                this.tryCreateSuggestions();
            }
        });
        
        // Observar cambios en el body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // También intentar inmediatamente por si ya existe
        setTimeout(() => this.tryCreateSuggestions(), 500);
    }
    
    tryCreateSuggestions() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput || this.containerCreated) {
            return;
        }
        
        try {
            this.createSuggestionsContainer();
            this.selectRandomSuggestions();
            this.renderSuggestions();
            this.bindEvents();
            this.containerCreated = true;
            console.log('✅ Sugerencias de prompt creadas exitosamente');
        } catch (error) {
            console.error('❌ Error al crear sugerencias:', error);
            this.containerCreated = false;
            // Reintentar después de 1 segundo
            setTimeout(() => this.tryCreateSuggestions(), 1000);
        }
    }
    
    createSuggestionsContainer() {
        // Buscar el input del chat
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) {
            throw new Error('Chat input no encontrado');
        }
        
        // Verificar si ya existe el contenedor
        if (document.getElementById('promptSuggestions')) {
            console.log('✅ Contenedor ya existe');
            return;
        }
        
        // Buscar el contenedor del input
        let targetContainer = chatInput.parentElement;
        
        // Si el input está dentro de un form, usar el form
        const formContainer = chatInput.closest('form');
        if (formContainer) {
            targetContainer = formContainer;
        }
        
        if (!targetContainer) {
            throw new Error('No se encontró contenedor padre para el input');
        }
        
        // Crear contenedor de sugerencias
        const container = document.createElement('div');
        container.id = 'promptSuggestions';
        container.className = 'prompt-suggestions-container';
        container.innerHTML = `<div class="suggestions-wrapper"></div>`;
        
        // Insertar AL PRINCIPIO del contenedor (más seguro que insertBefore)
        targetContainer.insertAdjacentElement('afterbegin', container);
        
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
            console.log('⏳ Wrapper no encontrado');
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
                e.stopPropagation();
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
        
        console.log('✅ Event listeners vinculados');
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
            container.style.display = '';
            this.isVisible = true;
        }
    }
    
    hide() {
        const container = document.getElementById('promptSuggestions');
        if (container && this.isVisible) {
            container.classList.add('hidden');
            container.style.display = 'none';
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
