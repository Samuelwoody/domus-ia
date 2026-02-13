# Domus-IA — Checklist de fixes priorizados

## P0 (bloqueantes / seguridad)
- [ ] Eliminar o proteger `api/test-env.js` (solo admin/internal)
- [ ] Quitar API keys hardcodeadas del frontend (`js/main.js`)
- [ ] Definir variables sensibles solo en entorno (Vercel/Netlify)
- [ ] Rotar claves que hayan podido exponerse en commits/chat

## P1 (funcionalidad rota)
- [ ] Crear `api/valorador.js` o quitar llamada desde `api/chat.js`
- [ ] Alinear rutas auth frontend/backend (`/api/auth/login` vs `/api/login`)
- [ ] Revisar CORS (`*`) y restringir a dominios permitidos

## P2 (Stripe producción)
- [ ] Sustituir modo demo por feature flag (`STRIPE_MODE=demo|live`)
- [ ] Migrar integración a ESM (`import Stripe from 'stripe'`)
- [ ] Añadir dependencia `stripe` y pruebas de webhook con firma
- [ ] Configurar `STRIPE_PRICE_*`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DOMAIN`

## P3 (deploy y mantenibilidad)
- [ ] Elegir proveedor principal (Vercel o Netlify) y dejar el otro como opcional documentado
- [ ] Documentar `.env.example` real y mínimo
- [ ] Separar README: guía rápida + arquitectura + changelog
- [ ] Añadir test smoke de endpoints críticos (`chat`, `login`, `register`, `valorador`)

## Validación antes de merge
- [ ] `vercel dev` arranca sin errores
- [ ] Flujo login/register funciona
- [ ] `/api/chat` responde con y sin web search
- [ ] No hay secretos expuestos en frontend/respuestas API
- [ ] PR revisado por Samuel y aprobado
