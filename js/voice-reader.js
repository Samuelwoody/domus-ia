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
        const unwantedElements = temp.querySelectorAll('img, .dalle-loading-container, .generated-image-container, a, code, pre');
        unwantedElements.forEach(el => el.remove());
        
        // Obtener texto limpio
        let text = temp.textContent || temp.innerText || '';
        
        // ============================================================================
        // 🧹 LIMPIEZA AVANZADA - Solo palabras conversacionales
        // ============================================================================
        
        // 1. Eliminar URLs completas (http://, https://, www.)
        text = text.replace(/https?:\/\/[^\s]+/g, '');
        text = text.replace(/www\.[^\s]+/g, '');
        
        // 2. Eliminar emojis y emoticonos (todos los caracteres Unicode de emojis)
        text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emojis generales
        text = text.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Símbolos varios
        text = text.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats
        text = text.replace(/[\u{1F000}-\u{1F02F}]/gu, ''); // Mahjong
        text = text.replace(/[\u{1F0A0}-\u{1F0FF}]/gu, ''); // Cartas
        text = text.replace(/[\u{1F100}-\u{1F64F}]/gu, ''); // Símbolos varios
        text = text.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transporte
        text = text.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Símbolos suplementarios
        text = text.replace(/[\u{2B50}]/gu, '');             // Estrella
        text = text.replace(/[\u{2705}]/gu, '');             // Check mark
        text = text.replace(/[\u{274C}]/gu, '');             // Cruz roja
        text = text.replace(/[\u{2764}]/gu, '');             // Corazón
        text = text.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Banderas
        
        // 3. Eliminar símbolos de markdown (**, __, ##, etc.)
        text = text.replace(/\*\*/g, '');      // Negrita
        text = text.replace(/\_\_/g, '');      // Subrayado
        text = text.replace(/\#\#+/g, '');     // Títulos
        text = text.replace(/\`\`\`/g, '');    // Bloques código
        text = text.replace(/\`/g, '');        // Inline code
        text = text.replace(/\~/g, '');        // Tachado
        
        // 4. Eliminar guiones de viñetas y listas
        text = text.replace(/^[\-\•\◦\▪\▫]\s+/gm, '');  // Inicio de línea
        text = text.replace(/\s[\-\•\◦\▪\▫]\s+/g, ' '); // Medio de línea
        
        // 5. Eliminar símbolos especiales no conversacionales
        text = text.replace(/[\[\]\{\}\(\)]/g, ' ');    // Paréntesis y corchetes
        text = text.replace(/[►▼▲◄]/g, '');             // Flechas especiales
        text = text.replace(/[™®©]/g, '');              // Marcas registradas
        text = text.replace(/[…]/g, '');                 // Puntos suspensivos especiales
        text = text.replace(/[\|]/g, ' ');               // Barras verticales
        text = text.replace(/[\/\\]/g, ' ');             // Barras
        text = text.replace(/[\<\>]/g, ' ');             // Mayor/menor que
        text = text.replace(/[\&]/g, ' y ');             // Ampersand
        text = text.replace(/[\@\#]/g, '');              // Arroba y hash
        
        // 6. Reemplazar símbolos comunes por palabras
        text = text.replace(/€/g, ' euros ');
        text = text.replace(/%/g, ' por ciento ');
        text = text.replace(/\$/g, ' dólares ');
        text = text.replace(/\+/g, ' más ');
        text = text.replace(/=/g, ' igual ');
        
        // 7. Eliminar guiones múltiples (---, ===, etc.)
        text = text.replace(/[\-]{2,}/g, ' ');
        text = text.replace(/[=]{2,}/g, ' ');
        text = text.replace(/[_]{2,}/g, ' ');
        
        // 8. Eliminar asteriscos solos o múltiples
        text = text.replace(/[\*]+/g, ' ');
        
        // 9. Limpiar saltos de línea múltiples
        text = text.replace(/\n+/g, '. ');
        
        // 10. Limpiar espacios múltiples
        text = text.replace(/\s+/g, ' ');
        
        // 11. Limpiar puntos múltiples seguidos
        text = text.replace(/\.{2,}/g, '.');
        
        // 12. Eliminar espacios antes de puntuación
        text = text.replace(/\s+([,\.;:\?!])/g, '$1');
        
        // 13. Añadir espacio después de puntuación si no existe
        text = text.replace(/([,\.;:\?!])([A-Za-zÁÉÍÓÚáéíóúÑñ])/g, '$1 $2');
        
        // 14. Trim final
        text = text.trim();
        
        // 15. Si el texto termina sin puntuación, no hacer nada (es natural)
        // Si termina con múltiples signos, dejar solo uno
        text = text.replace(/([,\.;:\?!])+$/, '$1');
        
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
