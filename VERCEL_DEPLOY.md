# 🚀 Guía Completa - Desplegar Domus-IA en Vercel con ChatGPT Real

## ✅ Archivos Ya Listos Para Vercel

Ya tienes TODO preparado:
- ✅ `api/chat.js` - Serverless function con tu API key segura
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `js/main.js` - Ya actualizado para Vercel

---

## 📋 Paso 1: Subir a GitHub (5 minutos)

### **Si NO tienes Git instalado:**

1. **Ve a GitHub:**
   - https://github.com/new
   
2. **Crear repo:**
   - Nombre: `domus-ia-espana`
   - Descripción: "SuperAgente Inmobiliario con IA"
   - Público o Privado
   - ✅ Marcar "Add a README file"
   - Click **"Create repository"**

3. **Subir archivos:**
   - En el repo → **"Add file"** → **"Upload files"**
   - Arrastra TODA tu carpeta del proyecto
   - Commit: "Initial commit - Domus-IA España"
   - Click **"Commit changes"**

---

### **Si tienes Git instalado:**

```bash
# En la carpeta de tu proyecto
git init
git add .
git commit -m "Domus-IA España con Vercel Functions"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/domus-ia-espana.git
git push -u origin main
```

---

## 📋 Paso 2: Conectar GitHub con Vercel (3 minutos)

### **1. Entrar a Vercel:**
👉 https://vercel.com

- Click **"Sign Up"** o **"Log In"**
- Elegir **"Continue with GitHub"**

### **2. Autorizar Vercel:**
- GitHub pedirá permiso
- Click **"Authorize Vercel"**

### **3. Importar Proyecto:**
- En Vercel dashboard → **"Add New..."** → **"Project"**
- Busca `domus-ia-espana`
- Click **"Import"**

### **4. Configurar:**

```
Framework Preset: Other
Build Command: (dejar vacío)
Output Directory: .
Install Command: npm install
```

### **5. NO DESPLEGAR AÚN:**
- ❌ **NO** hagas click en "Deploy" todavía
- Primero añadimos la API key ↓

---

## 📋 Paso 3: Añadir Tu API Key de OpenAI (1 minuto)

### **🔑 PASO CRÍTICO**

### **Antes de Deploy:**

1. **En la pantalla de configuración de Vercel**
2. Scroll hasta **"Environment Variables"**
3. Click **"Add"**

### **Añadir Variable:**

```
Name:  OPENAI_API_KEY
Value: sk-proj-[tu-api-key-completa-aqui]
```

**Seleccionar entornos:**
- ✅ Production
- ✅ Preview
- ✅ Development

### **4. Click "Add"**

---

## 📋 Paso 4: Desplegar (1 minuto)

### **Ahora SÍ:**
- Click **"Deploy"**
- Espera 1-2 minutos
- ✅ ¡Desplegado!

### **Tu URL:**
```
https://domus-ia-espana.vercel.app
```

O algo similar (Vercel te da una URL)

---

## 🎉 Paso 5: ¡PROBAR ChatGPT Real!

### **1. Abrir Tu Web:**
```
https://tu-proyecto.vercel.app
```

### **2. Abrir Chat:**
- Click **"💬 Hablar con Sofía Ahora"**

### **3. Enviar Mensaje:**
- Escribe: "Hola Sofía, quiero vender mi casa"
- Enviar

### **4. Verificar en Consola:**
- F12 → Console
- Debe mostrar:
```
✅ ChatGPT Real (GPT-4o) - Tokens usados: 234
```

### **5. ✅ Funcionando!**
Sofía responde con **ChatGPT REAL**, no mock.

---

## 🔍 Verificar Que Funciona

### **Método 1: Consola del Navegador**

```javascript
// Envías mensaje

// SI FUNCIONA:
✅ ChatGPT Real (GPT-4o) - Tokens usados: 234

// SI NO FUNCIONA:
⚠️ Backend no disponible, usando respuestas simuladas
```

### **Método 2: Test de la Function**

Abre:
```
https://tu-proyecto.vercel.app/api/chat
```

**Debe mostrar:**
```json
{"error":"Method Not Allowed"}
```

Si muestra 404 → La función no se desplegó

---

## 🐛 Troubleshooting

### **Error: "API key not configured"**

**Solución:**
1. Vercel Dashboard → Tu proyecto
2. Settings → Environment Variables
3. Añadir `OPENAI_API_KEY`
4. Redeploy: Deployments → ⋯ → Redeploy

---

### **Error: Function 404**

**Causa:** Estructura incorrecta

**Verificar:**
```
proyecto/
├── api/
│   └── chat.js      ← ¿Existe?
├── vercel.json      ← ¿Existe?
└── package.json     ← ¿Existe?
```

**Solución:**
```bash
git add .
git commit -m "Fix api structure"
git push
```

Vercel redespliega automáticamente.

---

### **Error: OpenAI API error**

**Causa:** API key inválida o sin créditos

**Solución:**
1. https://platform.openai.com/api-keys
2. Verificar key válida
3. https://platform.openai.com/usage
4. Verificar créditos ($5 gratis inicial)
5. Si no hay créditos → Añadir método de pago

---

## 💰 Costos

### **Vercel (Hosting + Functions):**
- ✅ **Gratis** hasta 100GB bandwidth/mes
- ✅ **Gratis** hasta 100 horas función/mes
- ✅ **Gratis** para siempre en Hobby plan

### **OpenAI API:**
- GPT-4o: $5 / 1M tokens input, $15 / 1M output
- Conversación típica: ~1,000 tokens = $0.02
- **100 conversaciones/día = $60/mes**

### **Total:**
- **$0/mes** hosting
- **$10-100/mes** OpenAI (según uso)

---

## 🎯 Añadir Dominio Personalizado (Opcional)

### **1. Comprar Dominio:**
- Namecheap, GoDaddy, etc.
- Ejemplo: `domus-ia-espana.com`

### **2. En Vercel:**
- Settings → Domains
- Add: `domus-ia-espana.com`
- Seguir instrucciones DNS

### **3. SSL Automático:**
- Vercel configura HTTPS gratis
- ✅ Listo en 5 minutos

---

## 🔐 Verificar Seguridad

### **Tu API Key Está Segura Si:**

✅ En Environment Variables de Vercel  
✅ NO en ningún archivo `.js`  
✅ NO visible en navegador (inspeccionar)  
✅ NO en GitHub

### **Doble Check:**

1. Abre tu web
2. F12 → Sources → Busca en archivos
3. ❌ NO debe aparecer `sk-proj-` o `sk-`

---

## 📊 Monitorear Uso

### **Dashboard Vercel:**
- Analytics → Ver requests
- Functions → Ver invocaciones

### **Dashboard OpenAI:**
👉 https://platform.openai.com/usage

**Configurar límites:**
- Límite mensual: $100
- Alerta: $50

---

## 🚀 Actualizar Tu Web

### **Cambios Futuros:**

1. Editas archivos localmente
2. Subes a GitHub:
   ```bash
   git add .
   git commit -m "Actualización"
   git push
   ```
3. Vercel **redespliega automáticamente** ✨

---

## ⚡ Ventajas de Vercel

✅ **Más rápido** que Netlify  
✅ **Deploy automático** en cada push  
✅ **Preview deployments** (branches)  
✅ **Edge Network** global  
✅ **Analytics incluido**

---

## 🎉 ¡LISTO!

Si llegaste aquí:

✅ Web en Vercel  
✅ ChatGPT REAL (GPT-4o)  
✅ API key segura  
✅ Gratis hasta 100 horas/mes  
✅ URL pública para compartir

---

## 📞 Soporte

### **Problemas con Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

### **Problemas con OpenAI:**
- Docs: https://platform.openai.com/docs
- Status: https://status.openai.com

---

## ✅ Checklist Final

- [ ] Subido a GitHub
- [ ] Importado en Vercel
- [ ] API key añadida en Environment Variables
- [ ] Desplegado
- [ ] Probado enviar mensaje
- [ ] Verificado: "✅ ChatGPT Real" en consola
- [ ] API key NO visible en código
- [ ] Límites en OpenAI configurados

---

## 💡 Próximos Pasos

1. **Custom domain** (opcional)
2. **Analytics** integrado en Vercel
3. **Rate limiting** cuando tengas tráfico
4. **Base de datos** cuando tengas usuarios reales

---

**🎉 ¡Tu Domus-IA España está VIVA con ChatGPT Real en Vercel!**

**Tiempo total:** ~10 minutos  
**Costo:** $0 hosting + uso de OpenAI  
**Resultado:** ChatGPT funcionando 🚀

---

**Creado:** 2025-10-07  
**Versión:** 1.2.0 (Vercel + ChatGPT Real)  
**Plataforma:** Vercel Serverless Functions
