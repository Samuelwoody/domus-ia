# ⚡ Solución Rápida - Usar Tu API Key de OpenAI

## 🎯 Opción 1: Variable de Entorno (Recomendada para Netlify/Vercel)

### **Paso 1: En Netlify/Vercel**

1. Ve a tu dashboard de Netlify/Vercel
2. Settings → Environment Variables
3. Añade:
   ```
   VITE_OPENAI_API_KEY=tu-api-key-aqui
   ```

### **Paso 2: Actualizar js/config.js**

```javascript
const CONFIG = {
    OPENAI: {
        API_KEY: import.meta.env.VITE_OPENAI_API_KEY || null,
    }
}
```

### **Paso 3: Usar en sofia-ai.js**

```javascript
constructor() {
    this.apiKey = CONFIG.OPENAI.API_KEY;
}
```

⚠️ **PROBLEMA**: Variables de entorno NO funcionan en sitios estáticos puros sin build step.

---

## 🚀 Opción 2: Netlify Functions (Recomendada - SEGURA)

Netlify Functions actúa como mini-backend serverless.

### **Crear netlify/functions/chat.js:**

```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Tu API Key segura aquí (solo en servidor)
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { messages, userType, userName } = JSON.parse(event.body);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres Sofía, SuperAgente Inmobiliario de Domus-IA España...`
          },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: data.choices[0].message.content,
        tokensUsed: data.usage.total_tokens
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
```

### **Configurar en Netlify:**

1. Crea carpeta `netlify/functions/`
2. Pon el archivo `chat.js` ahí
3. En Netlify Dashboard → Environment Variables:
   ```
   OPENAI_API_KEY=tu-api-key-aqui
   ```
4. Deploy

### **Actualizar js/main.js:**

```javascript
async generateAIResponse(message) {
    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: this.conversationHistory,
                userType: this.userType,
                userName: this.userName
            })
        });

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error:', error);
        return 'Lo siento, hubo un error al procesar tu mensaje.';
    }
}
```

**Ventajas:**
- ✅ API key SEGURA (solo en servidor)
- ✅ Gratis (Netlify Free tier: 125K requests/mes)
- ✅ Sin backend complejo

---

## 💥 Opción 3: HARDCODEAR (INSEGURO - Solo para Testing)

⚠️ **SOLO PARA PRUEBAS LOCALES - NUNCA EN PRODUCCIÓN**

```javascript
// En js/sofia-ai.js
constructor() {
    // TEMPORAL - QUITAR ANTES DE SUBIR A GITHUB/PRODUCCIÓN
    this.apiKey = 'sk-proj-TU_API_KEY_AQUI';
}
```

**Peligros:**
- ❌ Cualquiera puede ver tu key (inspeccionar código)
- ❌ Te robarán la key en minutos
- ❌ OpenAI te cobrará miles de €
- ❌ Banearán tu cuenta

**Solo para:**
- Testing en localhost
- Demo privado (sin subir a internet)

---

## 🎯 ¿Cuál Elegir?

### **Para PROBAR HOY (localhost):**
→ Opción 3 (hardcodear) - QUITAR antes de subir

### **Para DEMO PÚBLICO:**
→ Opción 2 (Netlify Functions) - 5 minutos setup

### **Para PRODUCCIÓN REAL:**
→ Backend completo (Railway + Node.js) - 1-2 horas

---

## 📋 QUIERES QUE LO HAGA YO?

Dime cuál opción prefieres y lo implemento:

1. **"Opción 2 - Netlify Functions"** → Creo el código ahora
2. **"Opción 3 - Hardcodear para testing"** → Actualizo sofia-ai.js
3. **"Ninguna, prefiero Railway backend"** → Ya está en ACTIVAR_BACKEND.md

¿Cuál eliges?
