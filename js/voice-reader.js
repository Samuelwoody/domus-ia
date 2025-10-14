// 🔊 DOMUS-IA VOICE READER - SISTEMA DE LECTURA VOCAL PARA SOFÍA
// Autor: MontCastell-AI
// Versión: 1.0.0
// Descripción: Sistema de Text-to-Speech con voz femenina española para mensajes de Sofía

class VoiceReader {
    constructor() {
        this.isEnabled = false;
        this.synth = window.speechSynthesis;
        this.selectedVoice = null;
        this.isSpeaking = false;
        this.messageQueue = [];
        
        // Configuración de voz
        this.voiceConfig = {
            lang: 'es-ES',
            rate: 1.0,      // Velocidad natural
            pitch: 1.1,     // Tono ligeramente más agudo (femenino)
            volume: 1.0     // Volumen máximo
        };
        
        this.init();
    }
    
    init() {
        // Esperar a que las voces estén disponibles
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
        
        // Cargar voces inmediatamente si están disponibles
        setTimeout(() => this.loadVoices(), 100);
        
        // Cargar estado guardado
        const savedState = localStorage.getItem('domusIA_voiceEnabled');
        if (savedState === 'true') {
            this.isEnabled = true;
        }
    }
    
    loadVoices() {
        const voices = this.synth.getVoices();
        
        // Buscar voces femeninas en español de España
        // Prioridad: voces con "female" o "mujer" en el nombre, y luego voces españolas
        const spanishVoices = voices.filter(voice => 
            voice.lang.startsWith('es-ES') || voice.lang.startsWith('es_ES')
        );
        
        // Preferencia de voces (ordenadas por calidad/naturalidad)
        const voicePreferences = [
            // Voces de calidad premium
            'Google español de España',
            'Microsoft Helena - Spanish (Spain)',
            'Microsoft Laura - Spanish (Spain)',
            'Mónica',
            'Monica',
            'Helena',
            'Laura',
            // Voces femeninas genéricas
            'female',
            'mujer',
            // Cualquier voz española como fallback
            'Spanish'
        ];
        
        // Buscar la mejor voz disponible
        for (const preference of voicePreferences) {
            const voice = spanishVoices.find(v => 
                v.name.toLowerCase().includes(preference.toLowerCase())
            );
            if (voice) {
                this.selectedVoice = voice;
                console.log('🔊 Voz seleccionada:', voice.name);
                break;
            }
        }
        
        // Fallback: usar la primera voz española disponible
        if (!this.selectedVoice && spanishVoices.length > 0) {
            this.selectedVoice = spanishVoices[0];
            console.log('🔊 Voz fallback:', this.selectedVoice.name);
        }
        
        // Si no hay voces españolas, usar cualquier voz disponible
        if (!this.selectedVoice && voices.length > 0) {
            this.selectedVoice = voices[0];
            console.warn('⚠️ No se encontraron voces en español. Usando:', this.selectedVoice.name);
        }
        
        if (!this.selectedVoice) {
            console.error('❌ No se encontraron voces disponibles para Text-to-Speech');
        }
    }
    
    toggle() {
        console.log('🔄 Toggle llamado, estado antes:', this.isEnabled);
        
        this.isEnabled = !this.isEnabled;
        
        console.log('🔄 Nuevo estado:', this.isEnabled);
        
        // Guardar estado
        localStorage.setItem('domusIA_voiceEnabled', this.isEnabled.toString());
        console.log('💾 Estado guardado en localStorage:', localStorage.getItem('domusIA_voiceEnabled'));
        
        // Si se desactiva, detener cualquier reproducción en curso
        if (!this.isEnabled) {
            this.stop();
        }
        
        // Actualizar UI del botón
        this.updateButtonUI();
        
        console.log('🔊 Lectura de voz:', this.isEnabled ? 'ACTIVADA ✅' : 'DESACTIVADA ❌');
        
        return this.isEnabled;
    }
    
    updateButtonUI() {
        const button = document.getElementById('toggleVoiceBtn');
        if (!button) {
            console.warn('⚠️ Botón toggleVoiceBtn no encontrado');
            return;
        }
        
        const icon = button.querySelector('i');
        const textSpan = button.querySelector('span');
        
        if (!icon) {
            console.warn('⚠️ Ícono del botón no encontrado');
            return;
        }
        
        if (this.isEnabled) {
            // Estado ACTIVADO: verde brillante
            console.log('🔊 Actualizando UI: ACTIVADO');
            
            icon.className = 'fas fa-volume-up text-green-400 text-base';
            button.title = 'Desactivar lectura de voz';
            button.classList.remove('bg-white/10', 'hover:bg-white/20');
            button.classList.add('bg-green-500/20', 'hover:bg-green-500/30');
            
            if (textSpan) {
                textSpan.textContent = '¡Lectura activada!';
                textSpan.classList.remove('animate-pulse', 'text-white');
                textSpan.classList.add('text-green-300');
            }
        } else {
            // Estado DESACTIVADO: blanco con pulse
            console.log('🔇 Actualizando UI: DESACTIVADO');
            
            icon.className = 'fas fa-volume-mute text-white text-base';
            button.title = 'Activar lectura de voz';
            button.classList.remove('bg-green-500/20', 'hover:bg-green-500/30');
            button.classList.add('bg-white/10', 'hover:bg-white/20');
            
            if (textSpan) {
                textSpan.textContent = 'Activa lectura automática';
                textSpan.classList.remove('text-green-300');
                textSpan.classList.add('animate-pulse', 'text-white');
            }
        }
    }
    
    extractTextFromHTML(html) {
        // Crear un elemento temporal para extraer texto sin HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remover elementos que no queremos leer
        const unwantedElements = temp.querySelectorAll('img, .dalle-loading-container, .generated-image-container');
        unwantedElements.forEach(el => el.remove());
        
        // Obtener texto limpio
        let text = temp.textContent || temp.innerText || '';
        
        // Limpiar espacios múltiples y saltos de línea
        text = text.replace(/\s+/g, ' ').trim();
        
        // Reemplazar símbolos comunes por palabras
        text = text.replace(/€/g, ' euros ');
        text = text.replace(/%/g, ' por ciento ');
        text = text.replace(/\$/g, ' dólares ');
        text = text.replace(/\+/g, ' más ');
        text = text.replace(/-/g, ' menos ');
        text = text.replace(/\*/g, ' ');
        text = text.replace(/=/g, ' igual ');
        
        // Limpiar nuevamente espacios múltiples
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
    
    speak(text) {
        // Si está desactivado o no hay texto, no hacer nada
        if (!this.isEnabled || !text || text.trim().length === 0) {
            return;
        }
        
        // Si no hay voz seleccionada, intentar cargarlas nuevamente
        if (!this.selectedVoice) {
            this.loadVoices();
            if (!this.selectedVoice) {
                console.error('❌ No se puede reproducir: no hay voces disponibles');
                return;
            }
        }
        
        // Extraer texto si viene con HTML
        const cleanText = this.extractTextFromHTML(text);
        
        if (cleanText.length === 0) {
            console.log('🔊 Texto vacío, no se reproduce');
            return;
        }
        
        // Si ya está hablando, añadir a la cola
        if (this.isSpeaking) {
            this.messageQueue.push(cleanText);
            console.log('🔊 Mensaje añadido a la cola. Cola actual:', this.messageQueue.length);
            return;
        }
        
        // Marcar como hablando
        this.isSpeaking = true;
        
        // Crear utterance
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = this.selectedVoice;
        utterance.lang = this.voiceConfig.lang;
        utterance.rate = this.voiceConfig.rate;
        utterance.pitch = this.voiceConfig.pitch;
        utterance.volume = this.voiceConfig.volume;
        
        // Event handlers
        utterance.onstart = () => {
            console.log('🔊 Reproduciendo mensaje:', cleanText.substring(0, 50) + '...');
        };
        
        utterance.onend = () => {
            console.log('✅ Reproducción finalizada');
            this.isSpeaking = false;
            
            // Procesar siguiente mensaje en la cola
            if (this.messageQueue.length > 0) {
                const nextMessage = this.messageQueue.shift();
                setTimeout(() => this.speak(nextMessage), 300); // Pequeña pausa entre mensajes
            }
        };
        
        utterance.onerror = (event) => {
            console.error('❌ Error en reproducción:', event.error);
            this.isSpeaking = false;
            
            // Procesar siguiente mensaje en la cola
            if (this.messageQueue.length > 0) {
                const nextMessage = this.messageQueue.shift();
                setTimeout(() => this.speak(nextMessage), 300);
            }
        };
        
        // Reproducir
        this.synth.speak(utterance);
    }
    
    stop() {
        // Detener reproducción actual
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        
        // Limpiar cola
        this.messageQueue = [];
        this.isSpeaking = false;
        
        console.log('🛑 Reproducción de voz detenida');
    }
    
    // Método público para que main.js pueda llamarlo cuando Sofía envía un mensaje
    readSofiaMessage(messageContent) {
        if (this.isEnabled) {
            // Pequeño delay para asegurar que el mensaje esté renderizado
            setTimeout(() => {
                this.speak(messageContent);
            }, 100);
        }
    }
}

// Instancia global del Voice Reader
let voiceReader = null;
let voiceButtonBound = false;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceReader);
} else {
    initVoiceReader();
}

// También intentar bind cuando se abre el chat (por si el botón no existe al cargar)
function bindVoiceButtonIfNeeded() {
    if (voiceButtonBound) return;
    
    const toggleButton = document.getElementById('toggleVoiceBtn');
    if (toggleButton && voiceReader) {
        console.log('🔄 Binding tardío del botón de voz (chat abierto)');
        
        toggleButton.addEventListener('click', (e) => {
            console.log('🖱️ Click detectado en botón de voz');
            e.preventDefault();
            e.stopPropagation();
            voiceReader.toggle();
        });
        
        voiceReader.updateButtonUI();
        voiceButtonBound = true;
        console.log('✅ Botón de voz vinculado correctamente');
    }
}

function initVoiceReader() {
    console.log('🎤 Inicializando Voice Reader...');
    
    voiceReader = new VoiceReader();
    
    // Bind del botón toggle
    const toggleButton = document.getElementById('toggleVoiceBtn');
    
    if (toggleButton) {
        console.log('✅ Botón toggleVoiceBtn encontrado en carga inicial');
        
        toggleButton.addEventListener('click', (e) => {
            console.log('🖱️ Click detectado en botón de voz (bind inicial)');
            e.preventDefault();
            e.stopPropagation();
            voiceReader.toggle();
        });
        
        // Actualizar UI inicial
        voiceReader.updateButtonUI();
        voiceButtonBound = true;
        console.log('✅ UI inicial actualizada y botón vinculado');
    } else {
        console.warn('⚠️ Botón toggleVoiceBtn NO encontrado en carga inicial (probablemente chat cerrado)');
        console.log('ℹ️  Se intentará vincular cuando se abra el chat');
    }
    
    console.log('✅ Voice Reader inicializado completamente');
}
