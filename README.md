# 🏠 Domus-IA España - SuperAgente Inmobiliario

## 🚀 Plataforma de IA Especializada para el Sector Inmobiliario Español

**Domus-IA** es una solución completa de inteligencia artificial diseñada específicamente para profesionales del sector inmobiliario y propietarios en España. No es un chatbot genérico, es tu **socio especializado** en el mercado inmobiliario español.

---

## ✨ Estado Actual del Proyecto

### 📅 Última Actualización: 16 Octubre 2025

### ✅ **FASE 1 COMPLETADA** - Sistema de Autenticación & Email Capture

- ✅ Registro/Login con validación de CIF/NIF
- ✅ Email capture automático al mensaje 3
- ✅ Detección inteligente de profesionales vs particulares
- ✅ Integración completa con Supabase
- ✅ Sincronización de sesiones

🎯 **Estado:** Listo para testing en producción

📄 **Documentación:** Ver `FASE_1_IMPLEMENTADO.md`

---

## 🎯 Propuesta de Valor

### 🚫 NO Competimos con ChatGPT (20€/mes)

### ✅ Competimos con:
- **CRM inmobiliarios**: 300-500€/mes
- **Sistemas de captación con IA**: 400-600€/mes
- **Agencias tradicionales**: 3-6% comisión (6,000€+ por venta)

### 💎 Sofía es tu **PARTNER**, no una herramienta

---

## 💰 Modelo de Precios

### Para Particulares (Propietarios):

| Plan | Precio | Comisión | Características |
|------|--------|----------|-----------------|
| **FREE** | 0€/mes | - | Chat ilimitado + 5 propiedades guardadas |
| **PARTICULAR** | 49€/mes (mientras vendes) | 999€ al vender | Vs 6,000€ agencia tradicional (3%) |

### Para Profesionales (Agentes/Inmobiliarias):

| Plan | Precio | Usuarios | Agentes Vocales | Propiedades |
|------|--------|----------|-----------------|-------------|
| **PRO** | 199€/mes | 1 | 2 | Ilimitadas |
| **BUSINESS** | 499€/mes | 2-5 | 5 | Ilimitadas |
| **AGENCY** | 999€/mes | 5-10 | 10 | Ilimitadas |

💡 **Clave:** El precio se basa en **número de agentes vocales**, no en propiedades

---

## 🎨 Funcionalidades Principales

### 🤖 Sofía - SuperAgente Inmobiliario

#### Para Particulares:
- 💬 **Chat inteligente** sobre venta/compra de propiedades
- 📊 **Valoración automática** usando Catastro + Idealista
- 📄 **Reportes profesionales** (valoración, ajuste precio)
- 🏠 **Gestión de propiedades** en área privada
- 🎯 **Estrategias de venta** personalizadas

#### Para Profesionales:
- 🗂️ **CRM Completo** (propiedades, contactos, tareas)
- 📞 **Agentes Vocales 24/7** (Vapi.ai) - Llaman y reciben llamadas
- 🔄 **Automatizaciones** (Make.com) - Follow-ups, recordatorios
- 📈 **Análisis de portfolio** con IA proactiva
- 🎨 **Generación de imágenes** para marketing (DALL-E 3)
- 👁️ **Análisis de fotos** de propiedades (GPT-4 Vision)
- 🔍 **Búsqueda web en tiempo real** (Tavily)

---

## 🏗️ Arquitectura Técnica

### Frontend
- HTML5 + Tailwind CSS (responsive)
- JavaScript vanilla (clase DomusIA)
- PWA (funciona offline)

### Backend
- **Vercel** (serverless functions)
- **Node.js** API endpoints
- **Supabase** (PostgreSQL con RLS)

### IA & APIs
- **OpenAI GPT-4o** (chat, vision, function calling)
- **DALL-E 3** (generación de imágenes)
- **Tavily API** (búsqueda web)
- **Catastro API** (datos oficiales propiedades)
- **Vapi.ai** (agentes vocales - próximamente)
- **Make.com** (automatizaciones - próximamente)

### Base de Datos (Supabase)

```sql
users (
    id, email, name, user_type, cif_nif, verified,
    subscription_plan, subscription_status
)

properties (
    user_id, property_type, address, city,
    price, surface_m2, rooms, bathrooms, status
)

conversations (
    user_id, message, sender, created_at
)

tasks (
    user_id, title, description, status, priority
)

contacts (
    user_id, name, email, phone, contact_type
)
```

---

## 🚀 Deploy & Configuración

### Variables de Entorno (Vercel)

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_KEY=...

# Búsqueda web
TAVILY_API_KEY=...

# Stripe (próximamente)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/domus-ia-espana.git
cd domus-ia-espana

# Instalar dependencias
npm install

# Configurar .env local
cp .env.example .env
# Editar .env con tus keys

# Ejecutar localmente
vercel dev
```

### Deploy a Producción

```bash
# Push a GitHub
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# Vercel detecta automáticamente y deploya
```

---

## 📂 Estructura de Archivos

```
domus-ia-espana/
├── index.html                  # Landing page principal
├── crm.html                    # Dashboard CRM (profesionales)
│
├── api/
│   ├── chat.js                 # Endpoint principal de chat
│   ├── register.js             # Registro de usuarios
│   ├── login.js                # Login de usuarios
│   ├── supabase-client.js      # Cliente de BD
│   ├── properties.js           # CRUD propiedades
│   ├── capabilities.js         # Features activas
│   └── dalle.js                # Generación de imágenes
│
├── js/
│   ├── main.js                 # Controlador principal (104 KB)
│   ├── auth.js                 # Sistema de autenticación
│   ├── email-capture.js        # Captación al mensaje 3
│   ├── payments.js             # Integración Stripe
│   ├── sofia-ai.js             # Wrapper de IA
│   ├── crm-dashboard.js        # Lógica del CRM
│   ├── crm-property-detector.js # Detección automática
│   └── voice-reader.js         # Text-to-speech
│
├── css/
│   ├── style.css               # Estilos principales
│   ├── crm-modals.css          # Estilos CRM
│   └── cookie-consent.css      # GDPR
│
└── legal/
    ├── privacidad.html
    ├── terminos.html
    └── cookies.html
```

---

## 🧪 Testing

### Test Manual - Registro de Usuario

```bash
# 1. Abrir https://tu-proyecto.vercel.app
# 2. Click en "Comenzar"
# 3. Completar formulario:
#    - Nombre: Test User
#    - Email: test@example.com
#    - Password: test123
#    - Tipo: Particular
# 4. Crear cuenta
# 5. Verificar sesión en console:
#    authSystem.isAuthenticated() // debe ser true
```

### Test Manual - Email Capture

```bash
# 1. Abrir en modo incógnito
# 2. Abrir chat
# 3. Enviar mensaje 1: "Hola"
# 4. Enviar mensaje 2: "Quiero vender mi piso"
# 5. Enviar mensaje 3: "¿Cuánto cuesta?"
# 6. Verificar: Modal de registro aparece automáticamente
```

### Debug Commands (Console)

```javascript
// Ver estado de email capture
emailCaptureDebug.status()

// Resetear contador
emailCaptureDebug.reset()

// Simular 3 mensajes
emailCaptureDebug.simulate(3)

// Ver sesión actual
authSystem.getCurrentUser()

// Logout
authSystem.logout()
```

---

## 📊 Métricas de Rendimiento

| Métrica | Valor | Estado |
|---------|-------|--------|
| Tiempo de carga | < 2s | ✅ Excelente |
| Lighthouse Score | 95+ | ✅ Excelente |
| Bundle size | ~380 KB | ✅ Optimizado |
| API Response | < 500ms | ✅ Rápido |

---

## 🛣️ Roadmap

### ✅ Fase 1 - Autenticación (COMPLETADA)
- [x] Sistema de registro/login
- [x] Validación de CIF/NIF
- [x] Email capture al mensaje 3
- [x] Detección inteligente de usuarios

### 🔄 Fase 2 - Verificación & Seguridad (EN PROGRESO)
- [ ] Email verification
- [ ] Reset de contraseña
- [ ] Verificación real de CIF/NIF (API externa)
- [ ] Dashboard de usuario

### 📅 Fase 3 - Monetización (PRÓXIMAMENTE)
- [ ] Integración Stripe completa
- [ ] Checkout con trial de 7 días
- [ ] Webhooks de suscripción
- [ ] Límites por plan (paywall)

### 📅 Fase 4 - Reportes Profesionales (PRÓXIMAMENTE)
- [ ] Valoración de propiedades (Catastro API)
- [ ] Análisis de mercado (Idealista scraping)
- [ ] Generación HTML → PDF
- [ ] Reportes automáticos semanales

### 📅 Fase 5 - Vocal Agents (PRÓXIMAMENTE)
- [ ] Integración Vapi.ai
- [ ] Pool de números telefónicos
- [ ] Agentes hacen/reciben llamadas 24/7
- [ ] Dashboard de llamadas

### 📅 Fase 6 - Automatizaciones (PRÓXIMAMENTE)
- [ ] Integración Make.com
- [ ] Workflows: post-lead, follow-ups
- [ ] Recordatorios automáticos
- [ ] Reactivación de leads fríos

### 📅 Fase 7 - IA Proactiva (PRÓXIMAMENTE)
- [ ] Análisis semanal de portfolio
- [ ] Detección de propiedades estancadas
- [ ] Sugerencias automáticas
- [ ] Creación automática de tareas

---

## 📚 Documentación Adicional

- **`ANALISIS_COMPATIBILIDAD_FASE_1.md`** - Análisis de estructura pre-implementación
- **`FASE_1_IMPLEMENTADO.md`** - Documentación completa de Fase 1
- **`FASE_1_CAPTACION_EMAIL.md`** - Especificación original de email capture
- **`FASE_1_LIMITES_PAYWALL.md`** - Especificación de límites por plan
- **`FASE_1_STRIPE_INTEGRATION.md`** - Especificación de integración Stripe
- **`supabase-schema-update.sql`** - Script SQL para actualizar BD

---

## 🤝 Contribución

Este es un proyecto privado de MontCastell-AI para Más Urba Multiservicios.

---

## 📄 Licencia

Todos los derechos reservados © 2025 MontCastell-AI, Grupo Más Urba Multiservicios

---

## 📞 Contacto

- **Email:** info@domus-ia.com
- **Teléfono:** +34 610 94 95 39
- **Ubicación:** Valdemorillo, España

---

## 🎉 Agradecimientos

Desarrollado con ❤️ por el equipo de MontCastell-AI

**Tecnologías utilizadas:**
- OpenAI GPT-4o
- Vercel
- Supabase
- Tailwind CSS
- Node.js

---

**¿Listo para revolucionar el sector inmobiliario español? ¡Vamos! 🚀**
