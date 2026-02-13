# Auditoría inicial — Domus-IA

- **Fecha:** 2026-02-13
- **Rama:** `audit/domus-initial-review`
- **Repo:** `https://github.com/Samuelwoody/domus-ia`
- **Estado de push:** ❌ No se ha hecho push (según instrucción)

---

## 1) Estructura del proyecto

## Resumen
Proyecto híbrido con frontend estático + backend serverless.

- Frontend: HTML/CSS/JS puro (`index.html`, `js/`, `css/`)
- Backend Vercel: funciones en `api/*.js`
- Backend Netlify (alternativo/parcial): `netlify/functions/chat.js`
- PWA: `manifest.json`, `sw.js`

### Observaciones
1. Estructura general coherente para Vercel (carpeta `api/` en raíz).
2. Hay coexistencia de configuración Vercel + Netlify (válido, pero requiere disciplina para no desalinear endpoints/variables).
3. `README.md` es muy extenso y mezcla changelog/estado operativo/documentación técnica.

---

## 2) Configuración Stripe

### Estado actual
Stripe está **en modo demo/no operativo** en backend y frontend.

- `api/stripe-checkout.js` devuelve sesión demo y mensaje "Stripe no configurado todavía".
- `api/stripe-portal.js` devuelve URL demo.
- `api/stripe-webhook.js` solo loggea en demo, sin persistencia real.
- `js/payments.js` usa `isDemo = true`, `stripePublicKey = null`, price IDs placeholders.

### Riesgos / gaps
1. **No hay cobro real** pese a existir flujo UI/API.
2. Si se "descomentan" bloques backend Stripe, usan `require('stripe')` en proyecto `type: module` (`package.json`) → riesgo de incompatibilidad ESM/CJS.
3. Falta validación fuerte en webhook (actualmente no activa).

### Recomendación
- Definir estrategia única ESM (`import Stripe from 'stripe'`) y activar Stripe por flags de entorno.
- Mantener demo tras feature flag explícito (no por código comentado).

---

## 3) Variables de entorno necesarias

Detectadas en código (`api/` + `netlify/functions/`):

### Críticas
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### Funcionales opcionales (según features)
- `TAVILY_API_KEY` (web search)
- `REPLICATE_API_TOKEN` (edición Nano Banana)
- `SOFIA_1_MODEL`, `SOFIA_2_MODEL`
- `MAX_TOKENS_SOFIA_1`, `MAX_TOKENS_SOFIA_2`

### Stripe (cuando se active real)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PARTICULAR`
- `STRIPE_PRICE_PROFESIONAL`
- `STRIPE_PRICE_PREMIUM`
- `DOMAIN`

### También referenciadas
- `SUPABASE_ANON_KEY` (solo test endpoint)
- `IMGBB_API_KEY` (test)
- `VERCEL_URL` (para construir URL de `api/valorador`)

### Hallazgo de seguridad
- Endpoint `api/test-env.js` expone prefijos de secretos/config en respuesta pública. Aunque parcial, conviene retirarlo o protegerlo.

---

## 4) Dependencias

`package.json`:

- Dependencias runtime:
  - `@supabase/supabase-js` ^2.39.0
  - `node-fetch` ^2.6.7
- Dev:
  - `netlify-cli` ^17.0.0

### Observaciones
1. Proyecto en `type: module`.
2. `node-fetch@2` es CJS legacy; en Node 18+ existe `fetch` nativo (podría simplificarse).
3. Falta dependencia `stripe` (esperable si está en demo, pero necesaria para producción).

---

## 5) Build/Deploy config (Vercel + Cloudflare)

### Vercel
- `vercel.json`:
  - `buildCommand`: no build (site estático)
  - `outputDirectory`: `.`
  - headers de seguridad básicos (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Con `api/` en raíz, Vercel debería resolver funciones serverless sin problema.

### Netlify
- `netlify.toml` presente con redirect `/api/* -> /.netlify/functions/:splat`
- Solo existe `netlify/functions/chat.js` (paridad incompleta vs carpeta `api/` completa).

### Cloudflare
- **No hay configuración de despliegue Cloudflare** detectada (sin `wrangler.toml`, workers/pages config).
- Solo se usa CDN de Cloudflare para Font Awesome (no equivale a build/deploy en Cloudflare).

---

## 6) Posibles errores lógicos / técnicos

## Alta prioridad
1. **Endpoint inexistente llamado desde chat**
   - `api/chat.js` invoca `/api/valorador` pero no existe `api/valorador.js` en repo.
   - Impacto: fallo cuando se activa tool `call_valorador_workflow`.

2. **Exposición de información sensible de entorno (parcial) en test endpoint**
   - `api/test-env.js` devuelve presencia de secretos y prefijos.
   - Impacto: enumeración de configuración por terceros.

3. **Clave de Cloudinary hardcodeada en frontend**
   - `js/main.js` contiene `CLOUDINARY_API_KEY = '963855782996925'`.
   - Impacto: fuga de credencial pública/técnica y deuda de seguridad/config.

## Media prioridad
4. **Desalineación de endpoints en configuración frontend**
   - `js/config.js` define `LOGIN: /api/auth/login` y `REGISTER: /api/auth/register`.
   - Backend real presente: `api/login.js`, `api/register.js`.
   - Impacto: posibles 404 según qué capa use `CONFIG`.

5. **CORS abierto globalmente (`*`) en múltiples APIs**
   - Impacto: superficie amplia para abuso desde orígenes arbitrarios.

6. **Stripe productivo no implementado, pero UX puede sugerir disponibilidad**
   - Impacto: discrepancia funcional/comercial.

## Baja prioridad / técnica
7. **Código comentado extenso como feature toggle**
   - Más propenso a errores al activar manualmente.

8. **Doble stack de despliegue (Vercel/Netlify) con paridad incompleta**
   - Riesgo de comportamiento diferente por proveedor.

---

## 7) Recomendaciones priorizadas

1. **Bloquear/remover `api/test-env.js` en producción** (auth o eliminación).
2. **Implementar o eliminar referencia a `/api/valorador`** para evitar rutas muertas.
3. **Eliminar hardcoded keys en frontend** y mover configuración a entorno seguro.
4. **Unificar mapa de endpoints frontend-backend** (`/api/login` vs `/api/auth/login`).
5. **Definir estrategia de despliegue principal** (Vercel o Netlify) y mantener paridad.
6. **Preparar Stripe production-ready con ESM y feature flags reales**.
7. **Restringir CORS por lista de dominios permitidos**.

---

## 8) Confirmación de alcance solicitado

✅ Clonado repo usando token de entorno cuando disponible
✅ Sin modificar `main`
✅ Rama creada: `audit/domus-initial-review`
✅ Análisis de estructura, Stripe, env vars, dependencias, build config (Vercel/Cloudflare), posibles errores
✅ Informe estructurado generado
✅ Sin push

---

## Anexo rápido (archivos clave revisados)

- `package.json`
- `vercel.json`
- `netlify.toml`
- `api/chat.js`
- `api/stripe-checkout.js`
- `api/stripe-portal.js`
- `api/stripe-webhook.js`
- `api/supabase-client.js`
- `api/test-env.js`
- `js/config.js`
- `js/payments.js`
- `js/main.js`
