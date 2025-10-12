# 🚀 SOLUCIÓN FINAL - ACTUALIZACIÓN GITHUB

## 🎯 PROBLEMA DETECTADO

Tu sitio está desplegado en Vercel pero:
- ❌ Service Worker está interfiriendo con llamadas al backend
- ❌ Backend no está respondiendo correctamente
- ❌ Sofía usa respuestas simuladas en lugar de ChatGPT Real

---

## ✅ SOLUCIÓN EN 3 PASOS

### **PASO 1: Actualiza `js/main.js` en GitHub** (5 min)

1. Ve a: https://github.com/Samuelwoody/domus-ia/blob/main/js/main.js
2. Click en **✏️ Edit** (arriba derecha)
3. **Busca las líneas 1110-1121** (al final del archivo)
4. Encontrarás este código:

```javascript
// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
```

5. **REEMPLÁZALO** con este código (comentado):

```javascript
// ===== SERVICE WORKER REGISTRATION =====
// TEMPORALMENTE DESACTIVADO para debugging backend
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/
```

6. Commit message: "Disable Service Worker temporarily"
7. Click **"Commit changes"**

---

### **PASO 2: Añade `api/capabilities.js` en GitHub** (2 min)

1. Ve a: https://github.com/Samuelwoody/domus-ia/tree/main/api
2. Click **"Add file"** → **"Create new file"**
3. Nombre: `capabilities.js`
4. Contenido:

```javascript
// API para informar al frontend qué capacidades están activas
// Esto evita el error 404 que vimos en Console

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Retornar capacidades actuales
  const capabilities = {
    chat: true,
    vision: false,  // Futuro: análisis de imágenes
    imageGeneration: false,  // Futuro: DALL-E
    webSearch: false,  // Futuro: búsqueda web
    fileUpload: false,  // Futuro: subir PDFs
    textToSpeech: false,  // Futuro: Sofía habla
    
    versions: [
      {
        id: 'sofia-1.0',
        name: 'Sofía 1.0',
        description: 'Versión estándar con conocimiento completo',
        available: true
      },
      {
        id: 'sofia-2.0-pro',
        name: 'Sofía 2.0 Pro',
        description: 'Versión avanzada con máxima potencia',
        available: true
      }
    ]
  };

  return res.status(200).json(capabilities);
}
```

5. Commit message: "Add capabilities endpoint"
6. Click **"Commit new file"**

---

### **PASO 3: Verifica Environment Variables en Vercel** (3 min)

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto "domus-ia-espana"
3. Click en **"Settings"** (menú superior)
4. Click en **"Environment Variables"** (menú izquierdo)
5. **Busca:** `OPENAI_API_KEY`

#### ✅ **SI EXISTE:**
- Verifica que el valor empieza con `sk-proj-...` o `sk-...`
- Verifica que está marcada en: **Production**, **Preview**, **Development**
- Si está todo correcto → **Continúa al Paso 4**

#### ❌ **SI NO EXISTE:**
- Click en **"Add New"**
- **Name:** `OPENAI_API_KEY`
- **Value:** Tu API key de OpenAI (empieza con `sk-proj-...`)
- **Environments:** Marca las 3 opciones:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development
- Click **"Save"**
- Ve a **"Deployments"** → Click en el último → **"... Redeploy"**

---

## ⏱️ PASO 4: ESPERAR REDEPLOY (2 min)

Después de hacer los commits en GitHub:
- Vercel detectará los cambios automáticamente
- Hará un nuevo deployment (1-2 minutos)
- Ve a **Vercel Dashboard** → tu proyecto → **"Deployments"**
- Espera hasta que diga **"Ready"** ✅

---

## 🧪 PASO 5: PRUEBA FINAL

Una vez que Vercel diga "Ready":

1. **Abre tu sitio:** https://domus-ia-espana.vercel.app
2. **Abre Console (F12)** → pestaña "Console"
3. **Limpia Console:** Click derecho → "Clear console"
4. **Envía mensaje a Sofía:** "Explícame el método comparativo de valoración"
5. **Mira Console:**

### ✅ **ÉXITO SI VES:**
```
✅ ChatGPT Real (GPT-4o) - Tokens usados: 234
```

### ❌ **PROBLEMA SI VES:**
```
⚠️ Backend no disponible, usando respuestas simuladas
```

---

## 📊 ARCHIVOS FINALES EN GitHub

Después de estos cambios, tu proyecto debería tener:

```
/api
├── chat.js (438 líneas - consolidado con 15 consultorías)
└── capabilities.js (nuevo - 45 líneas)

/js
└── main.js (Service Worker comentado líneas 1110-1122)
```

**BORRAR** (si aún existen en `/api`):
- ❌ sofia-knowledge.js
- ❌ sofia-knowledge-extended.js
- ❌ sofia-knowledge-final.js
- ❌ sofia-knowledge-complete.js
- ❌ chat-consolidated.js (duplicado, mantén solo chat.js)

---

## 🎉 RESULTADO ESPERADO

Después de estos cambios:

✅ **Sofía responde con ChatGPT 4o REAL**
✅ **Personalidad única** (cálida, directa, experta)
✅ **Conocimiento completo** de 15 Consultorías MontCastell-AI
✅ **Adaptación inteligente** según propietario vs agente
✅ **Sin errores** en Console
✅ **Service Worker desactivado** temporalmente para evitar interferencias
✅ **Sistema estable** y listo para escalar

---

## 📞 SI ALGO FALLA

Si después de estos pasos **todavía ves respuestas simuladas**:

1. **Captura los logs de Console** (F12 → Console)
2. **Captura Environment Variables** de Vercel (Settings → Environment Variables)
3. **Captura el último deployment log** (Vercel → Deployments → último → Build Logs)
4. Comparte las capturas para diagnosticar

---

## 🔄 PRÓXIMOS PASOS (FUTURO)

Una vez que funcione con ChatGPT Real:

1. ✅ **Re-activar Service Worker** (descomentar código en main.js)
2. 🎨 **Añadir capacidades avanzadas:**
   - Vision (análisis de fotos de propiedades)
   - DALL-E (generación de renders)
   - Web Search (búsqueda de comparables)
   - File Upload (análisis de documentación)
3. 💰 **Sistema de pagos** (Stripe)
4. 👤 **Autenticación** (login/registro)
5. 📊 **Dashboard de usuario** (historial, favoritos)

---

**⏱️ TIEMPO TOTAL: 12 minutos**

**🎯 EMPIEZA POR EL PASO 1 AHORA** → Edita `js/main.js` en GitHub
