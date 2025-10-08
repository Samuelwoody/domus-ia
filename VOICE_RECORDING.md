# 🎤 Funcionalidad de Transcripción de Voz

## 📋 Descripción

Se ha añadido un **botón de micrófono** en el chat que permite a los usuarios **hablar en lugar de escribir** sus mensajes. La voz se transcribe automáticamente al texto mediante la **Web Speech API**.

---

## ✨ Características

### **Funcionalidad:**
- ✅ Click en micrófono → Empieza a grabar
- ✅ Habla tu mensaje
- ✅ Click de nuevo → Detiene y transcribe
- ✅ Texto aparece automáticamente en el input
- ✅ Puedes enviarlo o editarlo antes

### **UX/UI:**
- 🎤 Botón de micrófono junto al botón de enviar
- 🔴 Se pone rojo y pulsa cuando está grabando
- 💬 Indicador visual "🎤 Escuchando... Habla ahora"
- ⚡ Hover effect suave
- 📱 Responsive en móvil

### **Compatibilidad:**
- ✅ Chrome/Edge (completo)
- ✅ Safari (completo)
- ✅ Firefox (limitado)
- ❌ Oculta automáticamente en navegadores no compatibles

---

## 🎨 Diseño

### **Botón Normal:**
```css
- Color: Gris claro (bg-gray-100)
- Hover: Dorado con texto blanco
- Icono: Micrófono (fa-microphone)
```

### **Botón Grabando:**
```css
- Color: Rojo acento (bg-domus-accent)
- Efecto: Pulso continuo (animate-pulse)
- Icono: Stop (fa-stop)
- Mensaje: "🎤 Escuchando... Habla ahora"
```

---

## 💻 Implementación Técnica

### **HTML (index.html):**
```html
<button 
    type="button"
    id="voiceBtn"
    class="bg-gray-100 text-domus-navy p-3 rounded-xl hover:bg-domus-gold hover:text-white transition-all flex-shrink-0"
    title="Mantén presionado para hablar">
    <i class="fas fa-microphone"></i>
</button>
```

### **JavaScript (js/main.js):**

#### **Inicialización:**
```javascript
initVoiceRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        // Oculta botón si no hay soporte
        return;
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
}
```

#### **Grabar:**
```javascript
startRecording() {
    this.recognition.start();
    this.isRecording = true;
    
    // Cambiar UI del botón
    voiceBtn.classList.add('bg-domus-accent', 'text-white', 'animate-pulse');
    voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
    
    // Mostrar indicador
    this.showVoiceMessage('🎤 Escuchando... Habla ahora', true);
}
```

#### **Detener:**
```javascript
stopRecording() {
    this.recognition.stop();
    this.isRecording = false;
    
    // Resetear UI
    voiceBtn.classList.remove('bg-domus-accent', 'text-white', 'animate-pulse');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    
    this.hideVoiceMessage();
}
```

#### **Resultado:**
```javascript
this.recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const chatInput = document.getElementById('chatInput');
    
    // Añadir al input
    if (chatInput.value.trim()) {
        chatInput.value += ' ' + transcript;
    } else {
        chatInput.value = transcript;
    }
    
    chatInput.focus();
};
```

#### **Manejo de Errores:**
```javascript
this.recognition.onerror = (event) => {
    if (event.error === 'no-speech') {
        this.showVoiceMessage('No se detectó voz. Inténtalo de nuevo.');
    } else if (event.error === 'not-allowed') {
        this.showVoiceMessage('Permiso de micrófono denegado.');
    }
    this.stopRecording();
};
```

---

## 🎯 Flujo de Usuario

### **Caso Normal:**
```
1. Usuario click en 🎤
   └─> Botón se pone rojo y pulsa
   └─> Aparece "🎤 Escuchando..."

2. Usuario habla: "Quiero vender mi casa"
   └─> API de voz escucha

3. Usuario click en 🛑 (o la voz termina)
   └─> Transcribe automáticamente
   └─> Texto aparece en input: "Quiero vender mi casa"

4. Usuario revisa (opcional) y envía
   └─> Mensaje se procesa normalmente
```

### **Caso Error (Sin Voz):**
```
1. Usuario click en 🎤
2. No habla (silencio)
3. Sistema: "No se detectó voz. Inténtalo de nuevo."
4. Botón vuelve a estado normal
```

### **Caso Error (Permiso Denegado):**
```
1. Usuario click en 🎤
2. Navegador pide permiso → Usuario RECHAZA
3. Sistema: "Permiso de micrófono denegado. Actívalo en configuración."
4. Usuario debe activar manualmente en settings del navegador
```

---

## 📱 Comportamiento Móvil

### **iOS (Safari):**
- ✅ Web Speech API soportada
- ✅ Pide permiso de micrófono
- ✅ Funciona en HTTPS (requerido)
- ⚠️ No funciona en navegación privada

### **Android (Chrome):**
- ✅ Web Speech API soportada
- ✅ Mejor rendimiento que iOS
- ✅ Funciona en HTTP local + HTTPS
- ✅ Funciona en navegación privada

### **Optimizaciones Móviles:**
```css
@media (max-width: 768px) {
    #voiceBtn {
        padding: 0.625rem; /* Más pequeño */
    }
}
```

---

## 🔒 Seguridad y Privacidad

### **Privacidad:**
- ✅ **Todo en cliente**: Voz NO se envía a tu servidor
- ✅ **API del navegador**: Chrome/Safari procesan la voz
- ✅ **No se almacena**: Solo se obtiene el texto transcrito
- ⚠️ **Google/Apple procesan**: Sus servidores transcriben

### **Permisos:**
- 🔐 **Requiere HTTPS** en producción
- 🔐 **Permiso de micrófono** del usuario
- 🔐 **No persistente**: Se pide cada vez

### **RGPD/Privacidad:**
```
Añadir a tu Política de Privacidad:

"La funcionalidad de voz a texto utiliza la API de 
reconocimiento de voz del navegador (Google Web Speech API 
o Apple Speech). Tu voz es procesada por estos servicios 
para convertirla en texto. No almacenamos grabaciones de 
audio. Consulta las políticas de privacidad de Google/Apple 
para más información sobre cómo procesan los datos de voz."
```

---

## 🌍 Idiomas Soportados

### **Actualmente:**
```javascript
this.recognition.lang = 'es-ES'; // Español de España
```

### **Para Añadir Más Idiomas:**
```javascript
// Detectar idioma del navegador
const userLang = navigator.language || 'es-ES';
this.recognition.lang = userLang;

// O selector manual
const langSelector = document.getElementById('langSelect');
this.recognition.lang = langSelector.value; // 'es-ES', 'en-US', 'ca-ES', etc.
```

---

## 🎨 Personalización

### **Cambiar Colores:**
```javascript
// En startRecording()
voiceBtn.classList.add('bg-blue-500', 'text-white'); // Azul en vez de rojo
```

### **Cambiar Icono:**
```html
<!-- Usar otro icono de Font Awesome -->
<i class="fas fa-podcast"></i>  <!-- Podcast icon -->
<i class="fas fa-volume-up"></i> <!-- Volume icon -->
```

### **Cambiar Mensajes:**
```javascript
this.showVoiceMessage('🎙️ Grabando...', true);
this.showVoiceMessage('✅ Listo! Revisa tu mensaje');
```

---

## ⚙️ Configuración Avanzada

### **Continuous Recording (Dictar Largo):**
```javascript
this.recognition.continuous = true; // Sigue grabando sin parar
this.recognition.interimResults = true; // Muestra resultados parciales
```

### **Múltiples Alternativas:**
```javascript
this.recognition.maxAlternatives = 3; // Obtener 3 posibles transcripciones
```

### **Detección Automática de Fin:**
```javascript
// Actual: Usuario click para parar
// Alternativa: Para automáticamente cuando deja de hablar
this.recognition.continuous = false; // Para cuando detecta silencio
```

---

## 🐛 Troubleshooting

### **"Botón de micrófono no aparece"**
**Causa:** Navegador no soporta Web Speech API  
**Solución:** Usar Chrome, Edge o Safari

### **"No funciona en móvil"**
**Causa:** No estás en HTTPS  
**Solución:** Desplegar en Netlify/Vercel (HTTPS automático)

### **"Permiso denegado"**
**Causa:** Usuario rechazó permiso de micrófono  
**Solución:** 
```
Chrome: Settings → Privacy → Site Settings → Microphone → Allow
Safari iOS: Settings → Safari → Camera & Microphone → Allow
```

### **"Transcribe mal"**
**Causa:** Ruido ambiente, pronunciación  
**Solución:** 
- Hablar más claro
- Ambiente silencioso
- Usar audífonos con micrófono

### **"Se detiene muy rápido"**
**Causa:** `continuous = false` para en silencios  
**Solución:** Hablar sin pausas largas o cambiar a `continuous = true`

---

## 📊 Métricas de Uso (Opcional)

Para trackear uso:

```javascript
// En onresult
this.recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence; // 0-1
    
    // Analytics
    gtag('event', 'voice_message', {
        'event_category': 'chat',
        'event_label': 'success',
        'value': Math.round(confidence * 100)
    });
    
    // Tu código...
};
```

---

## 🚀 Mejoras Futuras

### **Posibles Mejoras:**

1. **Detección de Idioma Automática**
   ```javascript
   // Detectar si habla inglés, catalán, etc.
   ```

2. **Visualización de Forma de Onda**
   ```javascript
   // Mostrar barras que suben/bajan con el audio
   ```

3. **Dictado Continuo**
   ```javascript
   // Mantener presionado = grabar, soltar = parar
   ```

4. **Comandos de Voz**
   ```javascript
   // "Sofía, enviar" → Envía automáticamente
   // "Sofía, borrar" → Limpia el input
   ```

5. **Traducción Automática**
   ```javascript
   // Usuario habla en catalán → Transcribe en español
   ```

---

## ✅ Checklist de Implementación

- [x] HTML: Botón de micrófono añadido
- [x] CSS: Estilos y animaciones
- [x] JavaScript: Web Speech API integrada
- [x] Manejo de errores
- [x] Indicadores visuales
- [x] Responsive móvil
- [x] Compatibilidad con navegadores
- [x] Documentación completa

---

## 📝 Notas Finales

### **Ventajas:**
- ✅ Más accesible (personas con dificultad para escribir)
- ✅ Más rápido en móvil
- ✅ Manos libres
- ✅ Natural y conversacional
- ✅ Sin costos (API del navegador)

### **Desventajas:**
- ❌ Requiere permiso de micrófono
- ❌ No funciona en navegadores antiguos
- ❌ Privacidad (Google/Apple procesan)
- ❌ Puede transcribir mal en ruido
- ❌ Solo HTTPS en producción

---

**Implementado:** 2025-10-07  
**Versión:** 1.0.0  
**Browser Support:** Chrome 25+, Edge 79+, Safari 14.1+

