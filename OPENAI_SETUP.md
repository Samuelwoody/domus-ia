# 🔌 Configuración de OpenAI API - Domus-IA España

## ⚠️ Estado Actual

**La IA NO está conectada a OpenAI por defecto.**

Actualmente usa respuestas simuladas (mock) para demostración.

---

## 🔑 Cómo Conectar OpenAI

### Paso 1: Obtener API Key

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea cuenta o inicia sesión
3. Ve a **API Keys** en el menú
4. Click en **"Create new secret key"**
5. Copia la key (empieza por `sk-...`)
6. **⚠️ IMPORTANTE**: Guárdala en lugar seguro, solo se muestra una vez

### Paso 2: Activar Billing en OpenAI

1. Ve a **Settings** → **Billing**
2. Añade método de pago
3. Configura límites de gasto (recomendado: $10-20/mes para empezar)

---

## 💻 Configuración en Domus-IA

### Método 1: Interfaz de Usuario (Recomendado)

1. **Abre Domus-IA** en tu navegador
2. Click en **"Comenzar"** o abre el chat
3. Si detecta que no hay API configurada, mostrará opción
4. Click en **"Configurar API Key"**
5. Pega tu API key
6. ¡Listo! Sofía ahora usa OpenAI real

### Método 2: Consola del Navegador (Desarrollo)

```javascript
// Abre la consola (F12)
// Ejecuta esto:
window.domusIA.sofiaAI.setApiKey('sk-TU_API_KEY_AQUI');
```

---

## 🧪 Probar la Conexión

Una vez configurada, prueba con:

```
"Hola Sofía, ¿puedes ayudarme con una valoración inmobiliaria?"
```

**Si funciona correctamente:**
- ✅ Respuestas inteligentes y contextuales
- ✅ Recuerda la conversación
- ✅ Puede generar imágenes si se lo pides
- ✅ Analiza documentos que compartas

**Si NO funciona:**
- ❌ Respuestas genéricas/repetitivas
- ❌ No recuerda contexto
- ❌ Error en la consola

---

## 💰 Costos de OpenAI

### Modelo: GPT-4o (recomendado)
- **Entrada**: $2.50 / 1M tokens (~750,000 palabras)
- **Salida**: $10.00 / 1M tokens (~750,000 palabras)

### Ejemplo Real:
- **10 conversaciones/día** x 30 días = 300 conversaciones/mes
- **~500 tokens por conversación** = 150,000 tokens/mes
- **Costo aproximado**: $1-3/mes

### Límites Recomendados:
```
Hard Limit: $20/mes (evita sorpresas)
Soft Limit: $10/mes (te avisa)
```

---

## 🔒 Seguridad de API Key

### ⚠️ NUNCA:
- ❌ Compartas tu API key públicamente
- ❌ La subas a GitHub/repositorios públicos
- ❌ La pongas en código frontend público

### ✅ SIEMPRE:
- ✅ Usa variables de entorno
- ✅ Implementa rate limiting
- ✅ Configura límites de gasto
- ✅ Monitorea el uso regularmente

---

## 🏗️ Para Producción (Recomendado)

### Arquitectura Segura:

```
Usuario → Frontend (Domus-IA)
              ↓
         Tu Backend (Node.js/Python)
              ↓
         OpenAI API (con tu key)
```

**Ventajas**:
- ✅ API key nunca expuesta
- ✅ Control de rate limiting
- ✅ Logs centralizados
- ✅ Costos controlados

### Backend Simple (Node.js):

```javascript
// server.js
const express = require('express');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  const { message, userType } = req.body;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: getSystemPrompt(userType) },
      { role: "user", content: message }
    ]
  });
  
  res.json({ response: completion.choices[0].message.content });
});

app.listen(3000);
```

---

## 🔧 Configuración Avanzada

### 1. Modificar el Modelo

En `js/sofia-ai.js`, línea ~12:

```javascript
this.model = 'gpt-4o'; // Más inteligente, más caro
// Alternativas:
// this.model = 'gpt-4o-mini'; // Más barato, menos capaz
// this.model = 'gpt-3.5-turbo'; // Muy barato, menos inteligente
```

### 2. Ajustar Temperatura

```javascript
this.temperature = 0.7; // Equilibrio (default)
// 0.0 = Determinista, preciso
// 1.0 = Creativo, variado
```

### 3. Limitar Tokens

```javascript
this.maxTokens = 2000; // Respuestas largas
// 500 = Respuestas cortas
// 4000 = Respuestas muy largas
```

---

## 📊 Monitoreo

### Dashboard de OpenAI:
[platform.openai.com/usage](https://platform.openai.com/usage)

**Revisa**:
- Requests por día
- Tokens consumidos
- Costo acumulado
- Errores (rate limits, etc.)

---

## ⚡ Modo de Desarrollo (Sin API)

**Estado Actual**: Domus-IA funciona con respuestas mock

**Ventajas**:
- ✅ Sin costo
- ✅ Funciona offline
- ✅ Respuestas inmediatas
- ✅ Ideal para diseño/testing UI

**Desventajas**:
- ❌ No es inteligente real
- ❌ Respuestas limitadas
- ❌ No recuerda contexto
- ❌ No puede hacer tareas avanzadas

---

## 🚀 Próximos Pasos

### Para Activar IA Real:

#### Opción A: Uso Personal
1. Obtén API key de OpenAI
2. Configúrala en la interfaz
3. ¡Usa Sofía con IA real!

#### Opción B: Producción
1. Crea backend (Node.js/Python)
2. Protege API key en servidor
3. Frontend llama a tu backend
4. Backend llama a OpenAI

#### Opción C: Servicio Proxy
1. Usa servicios como Vercel Edge Functions
2. API key en variables de entorno
3. Frontend llama a tu edge function
4. Edge function llama a OpenAI

---

## 🆘 Troubleshooting

### Error: "API key not configured"
**Solución**: Configura tu API key en la interfaz o consola

### Error: "401 Unauthorized"
**Solución**: API key incorrecta o expirada

### Error: "429 Too Many Requests"
**Solución**: Rate limit alcanzado, espera o mejora plan

### Error: "Insufficient quota"
**Solución**: Añade créditos en OpenAI billing

### Respuestas genéricas
**Problema**: Probablemente usando respuestas mock
**Solución**: Verifica que API key esté configurada

---

## 📝 Checklist de Configuración

### Para Desarrolladores:
- [ ] Cuenta OpenAI creada
- [ ] API key generada
- [ ] Billing configurado
- [ ] Límites establecidos
- [ ] API key configurada en app
- [ ] Prueba de conexión exitosa
- [ ] Logs monitoreados

### Para Producción:
- [ ] Backend implementado
- [ ] API key en variables de entorno
- [ ] Rate limiting implementado
- [ ] Error handling robusto
- [ ] Logs centralizados
- [ ] Monitoreo de costos
- [ ] Backup de conversaciones

---

## 📚 Recursos

- [OpenAI API Docs](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

---

**Estado**: 📝 Documentado - Pendiente de configuración
**Impacto**: 🔥🔥🔥 CRÍTICO para funcionalidad real
**Prioridad**: ALTA
