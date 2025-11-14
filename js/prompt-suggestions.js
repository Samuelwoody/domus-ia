// ============================================
// 💡 PROMPT SUGGESTIONS - MEJORA UX #1
// ============================================
// Ejemplos clicables de prompts para guiar al usuario

class PromptSuggestions {
    constructor() {
        this.suggestions = [
            {
                icon: '📊',
                text: 'Informe de valoración',
                prompt: 'Necesito un informe de valoración profesional de mi propiedad',
                category: 'valoracion'
            },
            {
                icon: '🎨',
                text: 'Imagen para Facebook',
                prompt: 'Crea una imagen publicitaria para Facebook con el precio y características de mi propiedad',
                category: 'imagen'
            },
            {
                icon: '📝',
                text: 'Texto para anuncio',
                prompt: 'Escribe un texto atractivo y profesional para publicar mi propiedad en portales inmobiliarios',
                category: 'anuncio'
            },
            {
                icon: '🎯',
                text: 'Embudo Vendedores',
                prompt: 'Explícame el embudo de captación de vendedores de Montcastell-AI',
                category: 'embudo'
            },
            {
                icon: '🏢',
                text: 'Formato corporativo',
                prompt: 'Ayúdame a crear materiales corporativos profesionales para mi agencia inmobiliaria',
                category: 'corporativo'
            },
            {
                icon: '💰',
                text: 'Informe de ajuste de precio',
                prompt: 'Analiza si el precio de mi propiedad es competitivo y recomienda ajustes basados en el mercado',
                category: 'precio'
            },
            {
                icon: '📋',
                text: 'Contrato de arras',
                prompt: 'Explícame qué es un contrato de arras y ayúdame a prepararlo',
                category: 'contrato'
            },
            {
                icon: '🎓',
                text: 'Formación Montcastell-ai',
                prompt: 'Cuéntame sobre los cursos y formación que ofrece Montcastell-AI para agentes inmobiliarios',
                category: 'formacion'
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
        
        // Buscar el FORM que contiene el input
        const chatForm = document.getElementById('chatForm');
        if (!chatForm) {
            throw new Error('Chat form no encontrado');
        }
        
        // Crear contenedor de sugerencias
        const container = document.createElement('div');
        container.id = 'promptSuggestions';
        container.className = 'prompt-suggestions-container';
        container.innerHTML = `<div class="suggestions-wrapper"></div>`;
        
        // Insertar ANTES del form completo
        chatForm.insertAdjacentElement('beforebegin', container);
        
        console.log('✅ Contenedor de sugerencias creado ANTES del form');
    }
    
    selectRandomSuggestions() {
        // Mostrar TODAS las sugerencias (8 botones profesionales)
        this.currentSuggestions = this.suggestions;
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
                data-prompt="${this.escapeHtml(suggestion.prompt || suggestion.text)}"
                data-index="${index}"
                style="animation-delay: ${index * 0.08}s"
            >
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
