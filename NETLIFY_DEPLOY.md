# 🚀 Guía Completa - Desplegar Domus-IA en Netlify con ChatGPT Real

## ✅ Archivos Creados

Ya tienes TODO listo:
- ✅ `netlify/functions/chat.js` - Servidor seguro con tu API key
- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `package.json` - Dependencias
- ✅ `js/main.js` - Actualizado para usar Netlify Function

---

## 📋 Paso 1: Crear Cuenta en Netlify (2 minutos)

### **1. Ir a Netlify:**
👉 https://app.netlify.com/signup

### **2. Registrarse con GitHub:**
- Click en **"Sign up with GitHub"** (recomendado)
- O usa tu email

### **3. Autorizar:**
- GitHub pedirá permiso → Click **"Authorize Netlify"**

### **4. ✅ Listo!**
Ya tienes cuenta Netlify (gratis, sin tarjeta)

---

## 📋 Paso 2: Subir a GitHub (5 minutos)

### **Opción A: Si NO tienes Git instalado**

1. **Crear cuenta GitHub:**
   - https://github.com/signup

2. **Crear repositorio nuevo:**
   - https://github.com/new
   - Nombre: `domus-ia-espana`
   - Descripción: "SuperAgente Inmobiliario con IA"
   - Privado o Público (tú decides)
   - ✅ **Marcar**: "Add a README file"
   - Click **"Create repository"**

3. **Subir archivos:**
   - En la página del repo, click **"Add file"** → **"Upload files"**
   - Arrastra TODA la carpeta de tu proyecto
   - Commit message: "Initial commit - Domus-IA España"
   - Click **"Commit changes"**

---

### **Opción B: Si tienes Git instalado**

Abre terminal en la carpeta de tu proyecto:

```bash
# Inicializar Git
git init

# Añadir todos los archivos
git add .

# Primer commit
git commit -m "Initial commit - Domus-IA España con Netlify Functions"

# Renombrar rama a main
git branch -M main

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/domus-ia-espana.git

# Subir a GitHub
git push -u origin main
```

**⚠️ IMPORTANTE:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub

---

## 📋 Paso 3: Conectar GitHub con Netlify (3 minutos)

### **1. En Netlify Dashboard:**
- Click **"Add new site"** (botón verde)
- Selecciona **"Import an existing project"**

### **2. Elegir GitHub:**
- Click en **"GitHub"**
- Autorizar Netlify si te lo pide

### **3. Seleccionar Repositorio:**
- Busca `domus-ia-espana`
- Click en tu repositorio

### **4. Configurar Build Settings:**

```
Build command: (dejar vacío)
Publish directory: .
Functions directory: netlify/functions
```

### **5. Deploy:**
- Click **"Deploy site"** (botón verde)
- Espera 1-2 minutos mientras despliega

### **6. ✅ Tu Web Está Viva!**
Netlify te da una URL tipo:
```
https://random-name-12345.netlify.app
```

---

## 📋 Paso 4: Añadir Tu API Key de OpenAI (2 minutos)

### **🔑 PASO CRÍTICO - Aquí va tu API key**

### **1. En Netlify Dashboard:**
- Ve a tu sitio
- Click en **"Site settings"** (arriba)

### **2. Environment Variables:**
- En el menú izquierdo: **"Environment variables"**
- Click **"Add a variable"**

### **3. Añadir API Key:**
```
Key:   OPENAI_API_KEY
Value: sk-proj-[tu-api-key-completa-aqui]
```

**⚠️ IMPORTANTE:** 
- Copia tu API key COMPLETA (empieza con `sk-proj-` o `sk-`)
- NO pongas espacios
- NO pongas comillas

### **4. Guardar:**
- Click **"Create variable"**
- ✅ Listo!

### **5. Re-Desplegar (Importante):**
- Ve a **"Deploys"** (menú superior)
- Click **"Trigger deploy"** → **"Deploy site"**
- Espera 1 minuto

---

## 🎉 Paso 5: ¡PROBAR ChatGPT Real!

### **1. Abrir Tu Web:**
```
https://tu-sitio.netlify.app
```

### **2. Abrir Chat:**
- Click en **"💬 Hablar con Sofía Ahora"**

### **3. Enviar Mensaje:**
- Escribe: "Hola Sofía, quiero vender mi casa"
- Enviar

### **4. ✅ Si Funciona:**
Verás en consola del navegador:
```
✅ ChatGPT Real - Tokens usados: 234
```

Y Sofía responderá con **inteligencia REAL**, no respuestas mock.

---

## 🔍 Verificar Que Funciona

### **Abrir Consola del Navegador:**

1. Click derecho → **"Inspeccionar"**
2. Pestaña **"Console"**
3. Envía mensaje a Sofía

### **Si Ves Esto = Funciona ✅:**
```javascript
✅ ChatGPT Real - Tokens usados: 234
```

### **Si Ves Esto = No Funciona ❌:**
```javascript
⚠️ Netlify Function not available
ℹ️ Usando respuestas simuladas
```

---

## 🐛 Troubleshooting

### **Error: "API key not configured"**

**Causa:** No añadiste la API key en Environment Variables

**Solución:**
1. Netlify Dashboard → Site settings → Environment variables
2. Añadir `OPENAI_API_KEY`
3. Trigger deploy de nuevo

---

### **Error: "Function not found"**

**Causa:** La función no se desplegó correctamente

**Solución:**
1. Verifica que existe `netlify/functions/chat.js`
2. Verifica que existe `netlify.toml`
3. En Netlify: Settings → Functions → Debe decir "netlify/functions"
4. Re-desplegar

---

### **Error: "OpenAI API error"**

**Causa:** API key inválida o sin créditos

**Solución:**
1. Ve a https://platform.openai.com/api-keys
2. Verifica que tu API key funciona
3. Ve a https://platform.openai.com/usage
4. Verifica que tienes créditos ($5 inicial gratis)
5. Si no tienes créditos, añade método de pago

---

### **Respuestas Mock en Netlify**

**Causa:** La función no está disponible

**Solución:**
1. Abre: `https://tu-sitio.netlify.app/.netlify/functions/chat`
2. Debe mostrar: `{"error":"Method Not Allowed"}`
3. Si muestra error 404 → La función no se desplegó
4. Verifica estructura de carpetas:
   ```
   proyecto/
   ├── netlify/
   │   └── functions/
   │       └── chat.js
   ├── netlify.toml
   └── package.json
   ```

---

## 💰 Costos

### **Netlify (Hosting + Functions):**
- ✅ **Gratis** hasta 125,000 invocaciones/mes
- ✅ **Gratis** hasta 100GB bandwidth/mes
- ✅ **Gratis** para siempre en plan Free

### **OpenAI API (Lo que pagas):**
- GPT-4o: $5 / 1M tokens input, $15 / 1M tokens output
- Conversación típica: ~1,000 tokens = $0.02
- **100 conversaciones/día = $2/día = $60/mes**

### **Total Para Empezar:**
- **$0/mes** hosting
- **$10-100/mes** OpenAI (según uso)

---

## 🎯 Cambiar Nombre del Sitio (Opcional)

### **Tu sitio tiene un nombre random:**
```
https://random-name-12345.netlify.app
```

### **Para Cambiarlo:**

1. Netlify Dashboard → Site settings
2. **"Change site name"**
3. Elige: `domus-ia-espana`
4. Ahora será: `https://domus-ia-espana.netlify.app`

---

## 🌐 Dominio Personalizado (Opcional)

### **Para usar tu dominio (ej: domus-ia.com):**

1. Compra dominio en Namecheap, GoDaddy, etc.
2. Netlify Dashboard → Domain settings
3. **"Add custom domain"**
4. Sigue instrucciones para configurar DNS
5. Netlify da SSL gratis automáticamente

---

## 🔐 Seguridad - Verificación

### **Tu API Key Está Segura Si:**

✅ Está en **Environment Variables** de Netlify (solo tú la ves)  
✅ NO está en ningún archivo `.js` del proyecto  
✅ NO aparece en el código del navegador (inspeccionar)  
✅ NO está en GitHub (verifica tu repo)

### **Doble Check:**

1. Abre tu web
2. Click derecho → Inspeccionar → Sources
3. Busca en archivos JS
4. ❌ NO debe aparecer `sk-proj-` o `sk-` en ningún lado

Si aparece → **PELIGRO**, tu API key está expuesta

---

## 📊 Monitorear Uso de OpenAI

### **1. Dashboard de OpenAI:**
👉 https://platform.openai.com/usage

### **2. Configurar Límites:**
👉 https://platform.openai.com/account/billing/limits

**Recomendación:**
- Límite mensual: $100
- Alerta email: $50
- Así controlas gastos

---

## 🎉 ¡FELICIDADES!

Si llegaste aquí, tienes:

✅ Web funcionando en Netlify  
✅ ChatGPT REAL (GPT-4o)  
✅ API key segura  
✅ Gratis hasta 125K requests/mes  
✅ URL pública para compartir

---

## 🚀 Próximos Pasos

### **Para Producción:**

1. **Custom domain:** domus-ia-espana.com
2. **Analytics:** Google Analytics
3. **Monitoreo:** Sentry para errores
4. **Base de datos:** Cuando tengas usuarios reales
5. **Pagos Stripe:** Para suscripciones

### **Para Mejorar:**

1. **Rate limiting:** Limitar mensajes por IP
2. **Autenticación:** Solo usuarios logueados
3. **Historial:** Guardar conversaciones
4. **Caché:** Reducir llamadas a OpenAI

---

## 📞 Soporte

### **Problemas con Netlify:**
- Docs: https://docs.netlify.com
- Forum: https://answers.netlify.com

### **Problemas con OpenAI:**
- Docs: https://platform.openai.com/docs
- Status: https://status.openai.com

### **Tu Proyecto:**
- Ver logs: Netlify Dashboard → Functions → Logs
- Ver errores: Consola del navegador (F12)

---

## ✅ Checklist Final

Antes de compartir tu web:

- [ ] Web desplegada en Netlify
- [ ] API key añadida en Environment Variables
- [ ] Re-desplegado después de añadir API key
- [ ] Probado enviar mensaje → Responde ChatGPT real
- [ ] Verificado en consola: "✅ ChatGPT Real - Tokens usados"
- [ ] API key NO visible en código fuente
- [ ] Límites configurados en OpenAI ($100/mes)
- [ ] Nombre del sitio cambiado (opcional)

---

**🎉 ¡Tu Domus-IA España está VIVA con ChatGPT Real!**

**Comparte tu URL y que los clientes prueben a Sofía** 🚀

---

**Creado:** 2025-10-07  
**Versión:** 1.2.0 (con ChatGPT real vía Netlify Functions)  
**Tiempo total setup:** ~15 minutos

