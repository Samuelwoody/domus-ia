# 🚀 Cómo Activar el Backend - Paso a Paso

## 📋 Guía Completa para Poner Domus-IA en Producción con IA Real

---

## 🎯 Objetivo

Pasar de **respuestas simuladas** (modo demo) a **inteligencia real de OpenAI** que TÚ (MontCastell-AI) pagas y controlas.

---

## 📊 Estado Actual

```
┌─────────────────────────────────────────────┐
│  FRONTEND (100% Completo)                   │
│  ├─ Imagen de Sofía integrada ✅            │
│  ├─ Sistema de chat funcional ✅            │
│  ├─ Gestión de usuarios ✅                  │
│  └─ Modo demo (respuestas simuladas) 🟡     │
│                                             │
│  BACKEND (Pendiente)                        │
│  ├─ Servidor Node.js ❌                     │
│  ├─ Base de datos ❌                        │
│  ├─ OpenAI API conectada ❌                 │
│  └─ Sistema de pagos ❌                     │
└─────────────────────────────────────────────┘
```

---

## ⚡ Opción Rápida: 5 Pasos en 1 Hora

### **Paso 1: Obtener API Key de OpenAI** (5 minutos)

1. Ve a https://platform.openai.com
2. Regístrate o inicia sesión
3. Navega a **API Keys** (menú izquierdo)
4. Click **Create new secret key**
5. Copia la key (empieza con `sk-proj-...`)
6. **¡GUÁRDALA EN LUGAR SEGURO!** (no se volverá a mostrar)

**Costo inicial**: $5 de crédito gratis para probar

---

### **Paso 2: Desplegar Backend en Railway** (15 minutos)

#### **2.1 Crear Cuenta en Railway:**
1. Ve a https://railway.app
2. Regístrate con GitHub (gratis)
3. Verifica tu email

#### **2.2 Crear Nuevo Proyecto:**
1. Click **New Project**
2. Selecciona **Deploy from GitHub repo**
3. Si no tienes repo, usa **Empty Service**

#### **2.3 Configurar el Servicio:**

**Crear archivo `server.js`** (copia el código de `BACKEND_SPECS.md` líneas 79-165)

**Crear archivo `package.json`:**
```json
{
  "name": "domus-ia-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.20.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3"
  }
}
```

#### **2.4 Configurar Variables de Entorno:**

En Railway dashboard:
1. Click **Variables**
2. Añade estas variables:

```bash
OPENAI_API_KEY=sk-proj-TU_KEY_AQUI
JWT_SECRET=generaUnSecretoAleatorioAqui123456
FRONTEND_URL=https://tu-web.netlify.app
PORT=3000
NODE_ENV=production
```

#### **2.5 Añadir PostgreSQL:**
1. Click **New** → **Database** → **PostgreSQL**
2. Railway auto-configura `DATABASE_URL`
3. ¡Listo!

#### **2.6 Deploy:**
1. Click **Deploy**
2. Espera 2-3 minutos
3. Railway te da una URL: `https://tu-proyecto.railway.app`

**Costo**: $5/mes (gratis primeros 500 horas)

---

### **Paso 3: Actualizar Frontend** (5 minutos)

#### **3.1 Editar `js/config.js`:**

```javascript
// Línea 9: Cambiar BASE_URL
BASE_URL: 'https://tu-proyecto.railway.app',  // ← TU URL DE RAILWAY

// Línea 29: Activar backend
USE_BACKEND: true,              // ← Cambiar a true
USE_MOCK_RESPONSES: false,      // ← Cambiar a false
```

#### **3.2 Subir Cambios:**
Si usas Netlify/Vercel:
```bash
git add js/config.js
git commit -m "Activar backend en producción"
git push
```

---

### **Paso 4: Probar la Conexión** (5 minutos)

#### **4.1 Verificar Backend:**
```bash
# En navegador o terminal:
curl https://tu-proyecto.railway.app/health

# Debe responder:
{"status":"ok","message":"Domus-IA Backend Online"}
```

#### **4.2 Probar en tu Web:**
1. Abre https://tu-web.netlify.app
2. Click "Hablar con Sofía Ahora"
3. Envía un mensaje: "Hola Sofía, ¿estás usando OpenAI real?"
4. Sofía debe responder con contexto real (no mock)

---

### **Paso 5: Configurar Base de Datos** (30 minutos)

#### **5.1 Conectar a PostgreSQL:**

En Railway, click en PostgreSQL → **Connect** → copia la URL

#### **5.2 Ejecutar Migraciones:**

**Crea archivo `migrations/01_initial.sql`:**

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('particular', 'profesional')),
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de chat
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER,
  model VARCHAR(50) DEFAULT 'gpt-4o',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de uso de API
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
```

#### **5.3 Ejecutar SQL:**

Opción A - Railway Dashboard:
1. PostgreSQL → **Query**
2. Pega el SQL
3. Click **Run**

Opción B - Terminal:
```bash
psql DATABASE_URL -f migrations/01_initial.sql
```

---

## 🎉 ¡LISTO!

Tu Domus-IA España ahora tiene:
- ✅ Frontend completo con imagen de Sofía
- ✅ Backend funcionando en Railway
- ✅ OpenAI conectado y funcional
- ✅ Base de datos PostgreSQL
- ✅ IA real respondiendo a usuarios

---

## 📊 Próximos Pasos (Opcionales)

### **1. Sistema de Pagos con Stripe** (1-2 días)

#### **Configuración:**
1. Crear cuenta en https://stripe.com
2. Obtener API keys (test y live)
3. Añadir a Railway:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### **Implementar en Backend:**
```javascript
// Añadir a server.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Endpoint para crear suscripción
app.post('/api/subscription/create', authenticateToken, async (req, res) => {
  const { planId, paymentMethodId } = req.body;
  
  // Crear cliente en Stripe
  const customer = await stripe.customers.create({
    email: req.user.email,
    payment_method: paymentMethodId,
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
  
  // Crear suscripción
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: planId }],  // price_id de Stripe
    expand: ['latest_invoice.payment_intent'],
  });
  
  // Guardar en base de datos
  await saveSubs cription(req.user.id, subscription);
  
  res.json({ success: true, subscription });
});
```

#### **Integrar en Frontend:**
```javascript
// Añadir Stripe.js
<script src="https://js.stripe.com/v3/"></script>

// En js/main.js
async function subscribeToPlan(planId) {
  const stripe = Stripe('pk_live_TU_PUBLIC_KEY');
  
  // Crear checkout session
  const response = await fetch(`${CONFIG.API.BASE_URL}/api/subscription/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    },
    body: JSON.stringify({ planId })
  });
  
  const session = await response.json();
  
  // Redirigir a Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id
  });
}
```

---

### **2. Monitoreo y Logs** (30 minutos)

#### **Opción A: Railway Logs** (Gratis)
Ya integrado, click en **Logs** en Railway dashboard.

#### **Opción B: Sentry** (Gratis hasta 5K events/mes)
```bash
# Añadir a package.json
"@sentry/node": "^7.0.0"

# En server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

#### **Opción C: LogTail** (Gratis hasta 1GB/mes)
1. Crear cuenta en https://logtail.com
2. Añadir source: Node.js
3. Copiar token
4. Añadir a Railway:
   ```bash
   LOGTAIL_TOKEN=tu_token_aqui
   ```

---

### **3. Domain Personalizado** (10 minutos)

#### **Frontend (Netlify/Vercel):**
1. Comprar dominio: `domus-ia-espana.com`
2. En Netlify: Settings → Domain Management → Add custom domain
3. Configurar DNS según instrucciones

#### **Backend (Railway):**
1. Settings → Networking → Custom Domain
2. Añadir: `api.domus-ia-espana.com`
3. Railway da instrucciones de DNS
4. Actualizar en `js/config.js`:
   ```javascript
   BASE_URL: 'https://api.domus-ia-espana.com'
   ```

---

### **4. Backup Automático** (15 minutos)

En Railway:
1. PostgreSQL → Settings
2. Enable **Automated Backups**
3. Retención: 7 días (gratis) o más (pago)

---

### **5. SSL/HTTPS** ✅

**Ya incluido:**
- Railway: SSL automático ✅
- Netlify/Vercel: SSL automático ✅

---

## 🔒 Checklist de Seguridad

Antes de lanzar públicamente:

- [ ] API Key de OpenAI NUNCA en frontend
- [ ] Variables de entorno configuradas
- [ ] JWT con expiración corta (7 días)
- [ ] Rate limiting habilitado
- [ ] CORS restringido a tu dominio
- [ ] HTTPS en todo (Railway + Netlify lo hacen)
- [ ] Validación de inputs server-side
- [ ] Passwords hasheados (bcrypt)
- [ ] Backups automáticos habilitados
- [ ] Logs de errores configurados

---

## 💰 Costos Mensuales Estimados

### **Mínimo Viable (0-10 usuarios):**
```
Railway (backend + DB):     $5/mes
OpenAI API:                 $10-30/mes
Dominio:                    $1/mes (anual)
Total:                      $16-36/mes
```

### **Crecimiento (50 usuarios):**
```
Railway (escalado):         $20/mes
OpenAI API:                 $100-150/mes
Stripe fees (2.9% + $0.30): $45/mes
Total:                      $165-215/mes

Ingresos (50 users @ €99):  €4,950/mes
Beneficio neto:             €4,735/mes 🎉
```

### **Escala (200 usuarios):**
```
Railway Pro:                $50/mes
OpenAI API:                 $500-700/mes
Stripe fees:                $180/mes
Total:                      $730-930/mes

Ingresos (200 users @ €99): €19,800/mes
Beneficio neto:             €18,870/mes 🚀
```

---

## 🆘 Troubleshooting

### **Error: "API Key inválida"**
```
✓ Verifica que copiaste bien la key de OpenAI
✓ Debe empezar con "sk-proj-"
✓ Check que está en Railway variables
✓ Restart del servicio en Railway
```

### **Error: "CORS blocked"**
```javascript
// En server.js, asegúrate:
app.use(cors({
  origin: 'https://tu-web.netlify.app',  // ← TU URL EXACTA
  credentials: true
}));
```

### **Error: "Database connection failed"**
```
✓ PostgreSQL addon añadido en Railway
✓ DATABASE_URL auto-configurada
✓ Check logs en Railway para detalles
```

### **Sofía no responde (timeout)**
```
✓ OpenAI puede tardar 10-30 segundos
✓ Aumentar timeout en server.js:
   const controller = new AbortController();
   setTimeout(() => controller.abort(), 60000);  // 60s
```

---

## 📞 Soporte

### **Documentos de Referencia:**
- `BACKEND_SPECS.md` - Especificaciones técnicas completas
- `ESTADO_ACTUAL.md` - Estado del proyecto
- `OPENAI_SETUP.md` - Configuración OpenAI
- `CAMBIOS_REALIZADOS.md` - Últimos cambios

### **Recursos Externos:**
- Railway Docs: https://docs.railway.app
- OpenAI API Docs: https://platform.openai.com/docs
- Stripe Docs: https://stripe.com/docs
- PostgreSQL Tutorial: https://www.postgresqltutorial.com

---

## ✅ Checklist Final

Antes de considerar el proyecto "en producción":

### **Técnico:**
- [ ] Backend desplegado y funcionando
- [ ] Base de datos con migraciones ejecutadas
- [ ] OpenAI conectado y respondiendo
- [ ] Frontend actualizado (USE_BACKEND: true)
- [ ] SSL/HTTPS habilitado
- [ ] Domain personalizado configurado
- [ ] Backups automáticos habilitados

### **Funcional:**
- [ ] Registro/Login funcionando
- [ ] Chat con IA real operativo
- [ ] Sistema de suscripciones funcional
- [ ] Pagos con Stripe integrados (opcional)
- [ ] Rate limiting funcionando

### **Legal/Negocio:**
- [ ] Términos y Condiciones escritos
- [ ] Política de Privacidad publicada
- [ ] RGPD compliance (Europa)
- [ ] Cuenta bancaria para recibir pagos
- [ ] Facturación automática configurada

### **Marketing:**
- [ ] Landing page optimizada
- [ ] SEO básico configurado
- [ ] Analytics instalado (Google Analytics)
- [ ] Email de bienvenida automatizado
- [ ] Estrategia de captación definida

---

## 🎯 Resultado Esperado

Después de seguir esta guía:

```
✅ Domus-IA España funcionando en producción
✅ Sofía responde con inteligencia real de OpenAI
✅ Usuarios pueden registrarse y suscribirse
✅ TÚ controlas y pagas OpenAI (no los usuarios)
✅ Sistema escalable a cientos de usuarios
✅ Beneficio neto de €1,500-2,000/mes con 15-20 usuarios
```

---

**Última actualización**: 2025-10-07  
**Tiempo estimado**: 1-2 horas (mínimo viable)  
**Dificultad**: ⭐⭐⭐ (Media - requiere conocimientos técnicos básicos)

**¡Éxito con tu lanzamiento! 🚀**

