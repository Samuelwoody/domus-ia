# Resumen Ejecutivo (1 página) — Domus-IA FASE 1

Fecha: 2026-02-13
Rama: `audit/domus-initial-review`

## 1) Cambios P0 aplicados

### ✅ Seguridad de exposición de entorno
- Archivo: `api/test-env.js`
- Cambio: endpoint de test deshabilitado en producción (`NODE_ENV=production` => `404`).
- Mejora: evita enumeración de variables/configuración desde internet.

### ✅ Eliminación de clave hardcodeada en frontend
- Archivo: `js/main.js`
- Cambio: retirada `CLOUDINARY_API_KEY` del cliente; upload queda por `upload_preset`.
- Mejora: se elimina secreto embebido en frontend.

### ✅ Higiene documental y planificación técnica
- Añadidos:
  - `DOMUS_FIX_CHECKLIST.md`
  - `MULTITENANT_ARCHITECTURE_REPORT.md`
- Mejora: backlog técnico priorizado + diseño multi-tenant con plan incremental.

---

## 2) Riesgos pendientes (prioridad)

### 🔴 Alto
1. `api/chat.js` llama a `/api/valorador` sin endpoint implementado (riesgo de fallo funcional).
2. CORS amplio (`*`) en múltiples endpoints API (riesgo de abuso cross-origin).

### 🟠 Medio
3. Desalineación potencial de rutas auth frontend/backend (`/api/auth/*` vs `/api/*`).
4. Modelo multi-tenant aún en diseño (falta aterrizar en migraciones + RLS en tablas actuales).

### 🟡 Bajo/operativo
5. Dualidad Vercel/Netlify con paridad incompleta (riesgo de comportamientos distintos según entorno).

---

## 3) Próximos 3 PRs propuestos

## PR-A — Multi-tenant base (sin romper producción)
**Objetivo:** estructura base para operar múltiples empresas desde un núcleo.
- Crear tablas: `tenants`, `tenant_memberships`, `lead_router_rules`, `lead_router_events`.
- Añadir `tenant_id` e índices a entidades críticas (`properties`, `contacts`, `tasks`, `conversations`, etc.).
- Definir políticas RLS iniciales por tenant.
- Entrega: migración SQL + ajustes backend mínimos para `tenant_id`.

## PR-B — CORS hardening
**Objetivo:** cerrar superficie de API pública.
- Sustituir `Access-Control-Allow-Origin: *` por allowlist por entorno.
- Centralizar helper CORS para consistencia.
- Validar preflight + métodos permitidos por endpoint.

## PR-C — Endpoints consistency (auth + valorador)
**Objetivo:** eliminar rutas rotas y contrato inconsistente.
- Alinear rutas de auth frontend/backend.
- Implementar `api/valorador.js` o retirar temporalmente su invocación en `api/chat.js` con fallback controlado.
- Añadir smoke tests de rutas críticas (`chat`, `login`, `register`, `valorador`).

---

## Nota de control
- No se han activado cobros Stripe.
- No se han aplicado cambios directos en `main`.
- Próximas implementaciones quedan bloqueadas hasta OK explícito.
