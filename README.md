# Domus-IA España - SuperAgente Inmobiliario con IA

![Domus-IA España](https://img.shields.io/badge/Domus--IA%20Espa%C3%B1a-v1.0.0-8b1a1a)
![Status](https://img.shields.io/badge/Status-Frontend%20Completo-success)
![License](https://img.shields.io/badge/License-MontCastell--AI-d4af37)

Una plataforma de inteligencia artificial especializada en el sector inmobiliario español que presenta a **Sofía**, el SuperAgente Inmobiliario General (SIG), desarrollada por MontCastell-AI para Grupo Más Urba Multiservicios.

> 📚 **¿Necesitas orientación?** Consulta [INDICE_DOCUMENTACION.md](INDICE_DOCUMENTACION.md) para encontrar rápidamente la documentación que necesitas.

## 🏠 Descripción

Domus-IA España es una innovadora web de IA similar a ChatGPT, específicamente diseñada para el sector inmobiliario español. Sofía, el primer SuperAgente Inmobiliario de España, está diseñada para **Propietarios Espabilados** y **Agentes Saturados** que quieren vender más y mejor con formación, estrategias y acompañamiento profesional.

### 🤖 Sofía - SuperAgente Inmobiliario General (SIG)

Sofía es una IA avanzada que integra:
- **Conocimiento profundo** del sector inmobiliario
- **Especialización** en compraventa de segunda mano y obra nueva
- **Formación** basada en el programa de consultorías de MontCastell-AI
- **Capacidades multimodales** de OpenAI (texto, imagen, audio, documentos)

## ✨ Características Principales

### 🎯 Funcionalidades Core
- ✅ **Interfaz de chat tipo ChatGPT** - Experiencia familiar e intuitiva
- ✅ **Detección automática de usuario** - Identifica si es particular o profesional
- ✅ **Sistema de suscripciones** - Planes Free, Particular y Profesional
- ✅ **Conexión OpenAI completa** - Todas las APIs más avanzadas
- ✅ **Diseño responsive** - Funciona en desktop, tablet y móvil
- ✅ **Interfaz elegante** - Colores profesionales y UX sofisticada

### 🏢 Para Agentes Profesionales
- **Construcción de empresa y marca personal**
- **Imagen corporativa y publicidad**
- **Captación formal y bien remunerada**
- **Gestión VIP de encargos de venta**
- **Informes de ajuste de precios con datos reales**
- **Negociación formal y cierre de acuerdos**
- **Formatos legales y post-venta**
- **Formación sobre IA y Agentes IA**

### 🏡 Para Propietarios Particulares
- **Estudio de mercado personalizado**
- **Preparación del inmueble para venta**
- **Estudio y revisión de documentación**
- **Estrategias de publicación de calidad**
- **Cómo atender y convencer compradores**
- **Defensa del precio de venta**
- **Acuerdos escritos y arras penitenciales**
- **Organización de firma ante notario**

### 🧠 Capacidades IA Avanzadas
- **Análisis y generación de imágenes**
- **Creación de logos e imagen corporativa**
- **Videos y contenido para publicidad**
- **Construcción de embudos de captación**
- **Informes de precios con búsquedas profundas**
- **Roleplay audio para práctica de argumentos**
- **Redacción de documentos y formatos legales**

## 💰 Planes de Suscripción

### 🆓 Plan Gratuito
- **Precio**: €0/mes
- **Mensajes**: 15 diarios
- **Funciones**: Básicas de Sofía
- **Detección**: Automática de usuario
- **Soporte**: Comunidad

### 🏠 Plan Particular
- **Precio**: €99/mes (antes €299)
- **Oferta**: Válida hasta 31 Dic 2025
- **Mensajes**: Ilimitados
- **Funciones**: Completas para propietarios
- **Soporte**: Prioritario
- **Garantía**: Precio fijo mientras no interrumpas

### 💼 Plan Profesional
- **Precio**: €199/mes (antes €499)
- **Oferta**: Válida hasta 31 Dic 2025
- **Mensajes**: Ilimitados
- **Funciones**: Completas + formación MontCastell-AI
- **APIs**: Acceso completo OpenAI
- **Soporte**: VIP 24/7
- **Garantía**: Precio fijo mientras no interrumpas

## ⚠️ Estado de OpenAI API

**IMPORTANTE**: Por defecto, Domus-IA usa **respuestas simuladas** para demostración.

### Para Activar IA Real:
1. Obtén API Key en [platform.openai.com](https://platform.openai.com)
2. Configúrala en la interfaz al elegir plan Premium
3. Sofía usará OpenAI real (~$1-3/mes uso normal)

📖 **Guía completa**: Ver `OPENAI_SETUP.md`

---

## 🚀 Funcionalidades Técnicas Implementadas

### ✅ Completadas

#### 🎨 Frontend
- **HTML5 semántico** con estructura profesional
- **CSS3 avanzado** con animaciones y efectos
- **Tailwind CSS** para diseño responsive
- **Font Awesome** para iconografía
- **Google Fonts** (Inter + Playfair Display)

#### 💬 Sistema de Chat
- **Interfaz tipo ChatGPT** con mensajes en tiempo real
- **Detección automática** de tipo de usuario (particular/profesional)
- **Historial de conversación** persistente
- **Contador de mensajes** para plan gratuito
- **Indicador de escritura** con animación
- **Respuestas contextualizadas** según perfil de usuario
- **🎤 Transcripción de voz** - Habla en lugar de escribir (Web Speech API)

#### 🔐 Gestión de Usuarios
- **Registro/Login automático** con detección inteligente
- **Almacenamiento local** de datos de usuario
- **Sistema de suscripciones** integrado
- **Límites por plan** (15 msgs/día gratuito, ilimitado premium)

#### 🤖 Integración IA
- **Conexión completa OpenAI API**
  - GPT-4o para chat avanzado
  - DALL-E 3 para generación de imágenes  
  - GPT-4V para análisis de imágenes
  - TTS para audio y roleplay
  - Whisper para transcripción (preparado)
- **Sistema de prompts especializado** inmobiliario
- **Respuestas contextualizadas** por tipo de usuario
- **Manejo de errores** y fallbacks profesionales

#### 📱 UX/UI
- **Diseño responsive** mobile-first
- **Colores corporativos** elegantes y profesionales
- **Animaciones suaves** y transiciones
- **Countdown timer** para ofertas
- **Modal system** para chat y registro
- **Loading states** y feedback visual

### 🔧 APIs y Endpoints Preparados

#### OpenAI Integration
```javascript
// Chat Completions
POST /chat/completions

// Image Analysis  
POST /chat/completions (with vision)

// Image Generation
POST /images/generations

// Text-to-Speech
POST /audio/speech

// Document Analysis
POST /chat/completions (with document context)
```

#### Funcionalidades Específicas
- **generateMarketReport()** - Informes de mercado
- **createRolePlayScenario()** - Práctica de ventas
- **generateLegalDocument()** - Documentos legales
- **analyzeProperty()** - Análisis de inmuebles
- **generateMarketingContent()** - Contenido publicitario
- **analyzePricing()** - Valoraciones profesionales

## 📁 Estructura del Proyecto

```
domus-ia/
├── index.html                 # Página principal
├── manifest.json             # PWA manifest
├── sw.js                     # Service Worker para PWA
├── css/
│   └── style.css             # Estilos personalizados
├── js/
│   ├── main.js               # Lógica principal y UI
│   ├── sofia-ai.js           # Integración OpenAI avanzada
│   └── config.js             # Configuración centralizada
├── images/
│   └── sofia-avatar.jpg      # Imagen de Sofía con branding Domus-IA
├── docs/
│   ├── BACKEND_SPECS.md      # Especificaciones del backend
│   ├── ESTADO_ACTUAL.md      # Estado operativo actual
│   ├── OPENAI_SETUP.md       # Guía de configuración OpenAI
│   ├── BRANDING.md           # Guía de marca
│   ├── POSITIONING.md        # Estrategia de marketing
│   └── [otros docs...]       # Documentación adicional
└── README.md                 # Documentación principal
```

## 🛠️ Instalación y Configuración

### 1. Despliegue Básico
La aplicación es completamente client-side y puede desplegarse en cualquier servidor web estático:

```bash
# Clonar o descargar archivos
# Subir a servidor web (Apache, Nginx, Netlify, Vercel, etc.)
# ¡Listo! La app funciona inmediatamente
```

### 2. 🚀 Activar ChatGPT Real con Netlify Functions (5 minutos)

**✅ YA ESTÁ LISTO** - Solo necesitas desplegarlo:

#### **📋 Guía Completa:** [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)

**Pasos:**
1. Crear cuenta Netlify (gratis)
2. Subir proyecto a GitHub
3. Conectar GitHub con Netlify
4. Añadir tu API key de OpenAI (variable de entorno)
5. ¡Listo! ChatGPT funcionando

**Archivos ya creados:**
- ✅ `netlify/functions/chat.js` - Servidor seguro con tu API key
- ✅ `netlify.toml` - Configuración
- ✅ `package.json` - Dependencias
- ✅ `js/main.js` - Ya integrado

**Ventajas:**
- ✅ ChatGPT REAL (GPT-4o)
- ✅ API key 100% segura
- ✅ Gratis hasta 125K requests/mes
- ✅ Sin backend complejo

---

### 3. Alternativa: Backend Completo Railway (1-2 horas)
   - Registrarse en [OpenAI Platform](https://platform.openai.com)
   - Crear API Key en el dashboard
   - Configurar billing y límites

2. **Configurar en la aplicación**:
   ```javascript
   // Los usuarios premium introducen su API key
   // O configurar a nivel de aplicación para todos los usuarios
   window.domusIA.sofiaAI.setApiKey('tu-api-key-aqui');
   ```

### 3. Personalización de Marca

Editar variables CSS para personalizar colores:
```css
:root {
    --domus-navy: #2c0a0e;      /* Rojo oscuro profundo */
    --domus-gold: #d4af37;      /* Oro elegante */
    --domus-sage: #6b7280;      /* Color secundario */
    --domus-cream: #fafafa;     /* Color de fondo */
    --domus-accent: #8b1a1a;    /* Rojo corporativo */
    --gradient-primary: linear-gradient(135deg, #d4af37 0%, #8b1a1a 100%);
}
```

## 🌐 URLs y Endpoints

### Producción
- **Website Principal**: `https://tu-dominio.com/`
- **Chat Interface**: `https://tu-dominio.com/#chat`
- **Planes**: `https://tu-dominio.com/#planes`

### APIs Externas Utilizadas
- **OpenAI API**: `https://api.openai.com/v1/`
- **CDN Recursos**: 
  - Tailwind CSS: `https://cdn.tailwindcss.com`
  - Font Awesome: `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css`
  - Google Fonts: `https://fonts.googleapis.com/css2`

## 💾 Modelos de Datos

### User Profile
```javascript
{
  isAuthenticated: boolean,
  userType: 'particular' | 'profesional' | null,
  userName: string,
  subscriptionPlan: 'free' | 'particular' | 'profesional',
  dailyMessageCount: number,
  apiKey: string,
  lastUsageDate: string
}
```

### Conversation History
```javascript
[
  {
    role: 'user' | 'assistant',
    content: string,
    timestamp: string
  }
]
```

### Sofia AI Configuration
```javascript
{
  model: 'gpt-4o',
  maxTokens: 2000,
  temperature: 0.7,
  capabilities: {
    textGeneration: true,
    imageAnalysis: true,
    imageGeneration: true,
    documentAnalysis: true,
    voiceGeneration: true
  }
}
```

## 🚧 Próximas Funcionalidades

### 📋 En Desarrollo
- [ ] **Sistema de pagos** integrado (Stripe/PayPal)
- [ ] **Panel de administración** para gestionar usuarios
- [ ] **Analytics avanzados** de uso y conversiones
- [ ] **API propia** para integrar con CRM inmobiliarios
- [ ] **App móvil nativa** (React Native/Flutter)

### 🔮 Roadmap Futuro
- [ ] **Integración WhatsApp** Business para consultas
- [ ] **Marketplace inmobiliario** integrado
- [ ] **CRM completo** para agentes
- [ ] **Formación online** con certificaciones
- [ ] **Comunidad profesional** con networking
- [ ] **Integraciones** con portales inmobiliarios (Idealista, Fotocasa)

## 🏗️ Arquitectura y Tecnologías

### Frontend Stack
- **HTML5** - Estructura semántica
- **CSS3** - Estilos avanzados + Tailwind CSS
- **Vanilla JavaScript** - Lógica sin frameworks (máximo rendimiento)
- **LocalStorage** - Persistencia de datos client-side
- **Fetch API** - Comunicación con OpenAI
- **Service Workers** - Preparado para PWA

### AI & APIs
- **OpenAI GPT-4o** - Chat inteligente
- **OpenAI DALL-E 3** - Generación de imágenes
- **OpenAI Vision** - Análisis de imágenes
- **OpenAI TTS** - Síntesis de voz
- **OpenAI Whisper** - Reconocimiento de voz (preparado)

### Deployment
- **Static Hosting** - Compatible con Netlify, Vercel, GitHub Pages
- **CDN Ready** - Recursos optimizados para carga rápida
- **Progressive Web App** - Preparado para instalación
- **Cross-browser** - Compatible IE11+, Chrome, Firefox, Safari

## 📞 Soporte y Contacto

### 🏢 Empresa
- **Desarrollado por**: MontCastell-AI
- **Grupo**: Más Urba Multiservicios  
- **Año**: 2025
- **Website**: [montcastell-ai.com](https://montcastell-ai.com)

### 📧 Contacto Técnico
- **Email**: info@domus-ia.com
- **Soporte**: +34 XXX XXX XXX
- **Horarios**: L-V 9:00-18:00 CET

### 🤝 Colaboración
¿Eres desarrollador y quieres contribuir? ¿Tienes una empresa inmobiliaria y quieres integrar Domus-IA España? ¡Contacta con nosotros!

---

## 📄 Licencia y Derechos

**© 2025 Domus-IA España - MontCastell-AI, Grupo Más Urba Multiservicios**

Todos los derechos reservados. Software propietario desarrollado específicamente para el sector inmobiliario español.

---

**🚀 ¡Domus-IA España está listo para revolucionar el sector inmobiliario español con IA! 🏠**

*Sofía te espera para transformar tu experiencia inmobiliaria en España. ¡Comienza gratis hoy mismo!*