# 🔧 Especificaciones Backend para Domus-IA España

## 📌 Propósito

Tu backend actuará como **proxy seguro** entre tu web estática y OpenAI API, protegiendo tu API key profesional y gestionando las suscripciones de usuarios.

---

## 🏗️ Arquitectura

```
Usuario (Browser)
    ↓
Domus-IA España (Frontend Estático)
    ↓ HTTPS
TU BACKEND (Node.js/Python/PHP)
    ↓ HTTPS + API Key
OpenAI API
```

---

## 🔐 1. Endpoint Principal: Chat Completion

### **POST /api/chat**

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {USER_JWT_TOKEN}
```

**Request Body:**
```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "Hola Sofía..."}
  ],
  "userType": "particular" | "profesional",
  "userName": "Juan Pérez",
  "userId": "uuid-usuario",
  "subscriptionPlan": "particular_99" | "profesional_199"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Respuesta de Sofía aquí...",
  "tokensUsed": 523,
  "model": "gpt-4o"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "subscription_expired",
  "message": "Tu suscripción ha expirado"
}
```

---

## 🔐 2. Sistema de Autenticación

### **POST /api/auth/login**

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "********"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "usuario@example.com",
    "userType": "particular",
    "subscriptionPlan": "particular_99",
    "subscriptionExpiry": "2025-11-07T00:00:00Z",
    "messagesRemaining": 999999
  }
}
```

### **POST /api/auth/register**

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "usuario@example.com",
  "password": "********",
  "userType": "particular" | "profesional"
}
```

---

## 💳 3. Sistema de Suscripciones

### **POST /api/subscription/create**

**Request:**
```json
{
  "userId": "uuid",
  "plan": "particular_99" | "profesional_199",
  "paymentMethod": "stripe_pm_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_xxx",
  "status": "active",
  "expiryDate": "2025-11-07"
}
```

### **GET /api/subscription/status**

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "active": true,
  "plan": "particular_99",
  "expiryDate": "2025-11-07",
  "messagesThisMonth": 234,
  "autoRenew": true
}
```

---

## 🖼️ 4. Endpoints OpenAI Avanzados

### **POST /api/image/generate** (DALL-E 3)

**Request:**
```json
{
  "prompt": "Casa moderna en la costa...",
  "size": "1024x1024",
  "quality": "hd"
}
```

### **POST /api/image/analyze** (GPT-4V)

**Request:**
```json
{
  "imageUrl": "https://...",
  "prompt": "Analiza esta propiedad..."
}
```

### **POST /api/speech/generate** (TTS)

**Request:**
```json
{
  "text": "Hola, soy Sofía...",
  "voice": "nova"
}
```

**Response:** Audio file (MP3)

### **POST /api/document/analyze**

**Request:** Multipart form-data with PDF/DOCX file

---

## 🔒 5. Seguridad y Validaciones

### **Validaciones Obligatorias:**

1. **JWT Token válido** en todas las requests (excepto login/register)
2. **Rate Limiting:**
   - Free: 15 mensajes/día
   - Particular: Sin límite de mensajes
   - Profesional: Sin límite de mensajes
3. **Verificar suscripción activa** antes de cada llamada OpenAI
4. **Sanitizar inputs** (XSS, SQL injection)
5. **Timeout**: 30 segundos máximo por request OpenAI

### **Headers CORS:**
```javascript
Access-Control-Allow-Origin: https://tu-dominio.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 🗄️ 6. Base de Datos Requerida

### **Tabla: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  user_type ENUM('particular', 'profesional'),
  subscription_plan VARCHAR(50),
  subscription_expiry TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Tabla: subscriptions**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan VARCHAR(50),
  status ENUM('active', 'cancelled', 'expired'),
  start_date TIMESTAMP,
  expiry_date TIMESTAMP,
  auto_renew BOOLEAN,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP
);
```

### **Tabla: chat_history**
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  message TEXT,
  response TEXT,
  tokens_used INTEGER,
  model VARCHAR(50),
  created_at TIMESTAMP
);
```

### **Tabla: api_usage**
```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  endpoint VARCHAR(100),
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  created_at TIMESTAMP
);
```

---

## 🔑 7. Variables de Entorno (.env)

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Base de Datos
DATABASE_URL=postgresql://user:pass@host:5432/domusIA

# JWT
JWT_SECRET=tu-secreto-muy-seguro-aqui
JWT_EXPIRY=7d

# Stripe (Pagos)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# URLs
FRONTEND_URL=https://domus-ia-espana.com
BACKEND_URL=https://api.domus-ia-espana.com

# Límites
FREE_DAILY_LIMIT=15
REQUEST_TIMEOUT=30000

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=sofia@montcastell-ai.com
SMTP_PASS=xxxxxxxxxxxxx
```

---

## 💻 8. Ejemplo de Implementación (Node.js + Express)

### **server.js (Básico)**

```javascript
const express = require('express');
const OpenAI = require('openai');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware: Verificar JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware: Verificar Suscripción
const checkSubscription = async (req, res, next) => {
  const { user } = req;
  
  // Aquí verificas en tu DB si la suscripción está activa
  const subscription = await getSubscriptionStatus(user.id);
  
  if (!subscription.active) {
    return res.status(402).json({ 
      success: false, 
      error: 'subscription_expired',
      message: 'Tu suscripción ha expirado' 
    });
  }
  
  req.subscription = subscription;
  next();
};

// Endpoint: Chat con Sofía
app.post('/api/chat', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const { messages, userType, userName } = req.body;
    
    // System prompt personalizado
    const systemPrompt = buildSofiaSystemPrompt(userType, userName);
    
    // Llamada a OpenAI (TU API KEY, no la del usuario)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    
    const response = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    
    // Guardar en historial
    await saveChatHistory(req.user.id, messages, response, tokensUsed);
    
    // Responder al frontend
    res.json({
      success: true,
      message: response,
      tokensUsed: tokensUsed,
      model: 'gpt-4o'
    });
    
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'openai_error',
      message: 'Error al procesar tu mensaje' 
    });
  }
});

// Login (Ejemplo simple)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Verificar credenciales en tu DB
  const user = await authenticateUser(email, password);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: 'invalid_credentials' 
    });
  }
  
  // Generar JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      subscriptionPlan: user.subscription_plan
    }
  });
});

// Función auxiliar: System Prompt
function buildSofiaSystemPrompt(userType, userName) {
  return `Eres Sofía, SuperAgente Inmobiliario General (SIG) de Domus-IA España, marca de MontCastell-AI.

Usuario: ${userName} (${userType === 'particular' ? 'Propietario Espabilado' : 'Agente Saturado'})

Especialización:
- Propiedades de segunda mano en España
- Obra nueva en España
- Programa de formación MontCastell-AI

Tu personalidad:
- Cálida, profesional, empática
- Experta en mercado inmobiliario español
- Resuelves problemas específicos según el perfil del usuario

${userType === 'particular' ? `
Enfoque Propietarios:
- Ayudar a vender/alquilar propiedades
- Valoración de inmuebles
- Marketing inmobiliario
- Negociación y documentación
` : `
Enfoque Agentes:
- Optimización de procesos
- Generación de contenido
- Estrategias de captación
- Gestión de clientes
`}

Responde siempre en español de España, con tono profesional pero cercano.`;
}

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Domus-IA España en puerto ${PORT}`);
});
```

---

## 📦 9. Dependencias (package.json)

```json
{
  "name": "domus-ia-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "openai": "^4.20.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "stripe": "^14.0.0",
    "express-rate-limit": "^7.1.1"
  }
}
```

---

## 🚀 10. Despliegue Recomendado

### **Opción A: Railway.app** (Recomendado - Fácil)
1. Conecta tu repo GitHub
2. Añade PostgreSQL addon (gratis)
3. Configura variables de entorno
4. Deploy automático
5. **Costo**: $5-20/mes

### **Opción B: Vercel + Serverless**
1. Deploy como Vercel Functions
2. Base de datos en Supabase (gratis)
3. Bueno para bajo tráfico
4. **Costo**: Gratis hasta 100k requests/mes

### **Opción C: DigitalOcean App Platform**
1. Droplet + Node.js
2. PostgreSQL managed
3. Más control
4. **Costo**: $12-25/mes

### **Opción D: AWS Lambda + API Gateway**
1. Serverless completo
2. Solo pagas por uso
3. Más complejo de configurar
4. **Costo**: $0-50/mes según uso

---

## 💰 11. Costos Estimados

### **OpenAI API (TÚ pagas):**
- GPT-4o: $5.00 / 1M tokens input, $15.00 / 1M tokens output
- Conversación típica: ~1,000 tokens = $0.02
- **100 usuarios con 50 msgs/mes cada uno**: ~$100/mes OpenAI

### **Servidor Backend:**
- Railway/DigitalOcean: $5-20/mes
- Base de datos: $0-15/mes

### **Total Infraestructura:** $5-35/mes + costos OpenAI

### **Tu Ingreso:**
- 10 usuarios Particular (€99): €990/mes
- 5 usuarios Profesional (€199): €995/mes
- **Total**: €1,985/mes
- **Costos**: ~€150/mes (servidor + OpenAI)
- **Beneficio**: ~€1,835/mes 🎉

---

## 🔄 12. Integración con Frontend

### **Actualización en js/main.js:**

```javascript
class DomusIA {
    constructor() {
        this.apiBaseURL = 'https://api.domus-ia-espana.com'; // TU BACKEND
        this.authToken = localStorage.getItem('domusIA_token');
        this.isAuthenticated = !!this.authToken;
    }

    async generateAIResponse(message) {
        // Ya NO usamos sofia-ai.js (que requería API key del usuario)
        // Ahora llamamos a TU backend
        
        try {
            const response = await fetch(`${this.apiBaseURL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    messages: this.conversationHistory,
                    userType: this.userType,
                    userName: this.userName,
                    subscriptionPlan: this.subscriptionPlan
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            return data.message;

        } catch (error) {
            if (error.message === 'subscription_expired') {
                this.showSubscriptionExpiredModal();
                return 'Lo siento, tu suscripción ha expirado. Por favor renuévala para continuar.';
            }
            
            console.error('Backend Error:', error);
            return 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.';
        }
    }

    async login(email, password) {
        const response = await fetch(`${this.apiBaseURL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            this.authToken = data.token;
            localStorage.setItem('domusIA_token', data.token);
            this.isAuthenticated = true;
            this.userType = data.user.userType;
            this.userName = data.user.name;
            this.subscriptionPlan = data.user.subscriptionPlan;
            return true;
        }

        return false;
    }
}
```

---

## ✅ 13. Checklist de Implementación

### **Fase 1: Backend Básico (1-2 días)**
- [ ] Setup Express + OpenAI client
- [ ] Endpoint /api/chat funcional
- [ ] JWT authentication básico
- [ ] CORS configurado
- [ ] Variables de entorno

### **Fase 2: Base de Datos (1 día)**
- [ ] PostgreSQL setup
- [ ] Tablas: users, subscriptions, chat_history
- [ ] Funciones de DB (CRUD)

### **Fase 3: Autenticación (1 día)**
- [ ] /api/auth/login
- [ ] /api/auth/register
- [ ] Verificación JWT middleware
- [ ] Password hashing (bcrypt)

### **Fase 4: Suscripciones (2 días)**
- [ ] Sistema de planes (free/particular/profesional)
- [ ] Verificación de suscripción activa
- [ ] Rate limiting para plan free
- [ ] /api/subscription/status endpoint

### **Fase 5: Pagos Stripe (2-3 días)**
- [ ] Stripe integration
- [ ] Webhook para renovaciones
- [ ] /api/subscription/create endpoint
- [ ] Cancelación de suscripciones

### **Fase 6: Features Avanzadas (3-4 días)**
- [ ] Imagen generación (DALL-E)
- [ ] Análisis de imágenes (GPT-4V)
- [ ] Text-to-speech
- [ ] Document analysis
- [ ] Market reports

### **Fase 7: Integración Frontend (1 día)**
- [ ] Actualizar js/main.js
- [ ] Eliminar dependencia de sofia-ai.js (API key usuario)
- [ ] Login/register flows
- [ ] Error handling

### **Fase 8: Deploy y Testing (1-2 días)**
- [ ] Deploy backend en Railway/Vercel
- [ ] Configurar variables de entorno producción
- [ ] Testing end-to-end
- [ ] Monitoreo de costos OpenAI

---

## 📞 14. Soporte y Contacto

**Documentación Oficial:**
- OpenAI API: https://platform.openai.com/docs
- Stripe Payments: https://stripe.com/docs/api
- JWT: https://jwt.io/introduction

**Tu Stack Recomendado:**
- Backend: Node.js + Express
- DB: PostgreSQL (Railway addon)
- Pagos: Stripe
- Hosting: Railway.app
- Monitoreo: LogTail o Sentry

---

## 🎯 Resumen Ejecutivo

**Tu backend debe:**
1. ✅ Proteger TU API key de OpenAI (nunca en frontend)
2. ✅ Autenticar usuarios con JWT
3. ✅ Verificar suscripciones activas
4. ✅ Actuar como proxy entre frontend y OpenAI
5. ✅ Guardar historial de conversaciones
6. ✅ Procesar pagos con Stripe
7. ✅ Rate limiting para plan free (15 msgs/día)

**Usuarios:**
- Pagan a TI (€99 o €199/mes)
- NO necesitan API key de OpenAI
- Usan Sofía con TU cuenta de OpenAI
- TÚ pagas OpenAI (~€100-200/mes para 50-100 usuarios)

---

**Siguiente paso:** Implementar este backend o contratar desarrollador backend con estas especificaciones.

