# Domus-IA — Reporte técnico multi-tenant (FASE 1)

Fecha: 2026-02-13  
Rama: `audit/domus-initial-review`

---

## 1) Objetivo
Diseñar una base multi-tenant para operar varias marcas/empresas desde Domus-IA con aislamiento por tenant, roles por usuario y trazabilidad de enrutado de leads.

Empresas objetivo iniciales:
- Mas Urba Multiservicios
- Inmo Cerro
- MontCastell-AI
- Domus-IA (núcleo)

---

## 2) Principios de diseño
1. **Single database + tenant_id obligatorio** en tablas de negocio.
2. **Aislamiento por RLS** (Row Level Security) en Supabase/Postgres.
3. **Usuario multi-tenant**: un usuario puede tener roles distintos en varios tenants.
4. **Auditoría de decisiones** (lead routing + acciones de agentes).
5. **Migración incremental**: convivir con esquema actual sin romper producción.

---

## 3) Modelo lógico propuesto

### 3.1 Tablas núcleo
- `tenants`
  - `id (uuid pk)`
  - `slug (text unique)`
  - `name (text)`
  - `status (active|inactive)`
  - `created_at`

- `tenant_memberships`
  - `id (uuid pk)`
  - `tenant_id (fk tenants)`
  - `user_id (fk users)`
  - `role (super_admin|tenant_admin|ops_manager|sales_agent|viewer_exec)`
  - `created_at`
  - unique `(tenant_id, user_id)`

- `lead_router_rules`
  - `id (uuid pk)`
  - `tenant_id (fk tenants)`
  - `priority (int)`
  - `condition_json (jsonb)`
  - `target_tenant_id (fk tenants)`
  - `target_pipeline (text)`
  - `enabled (bool)`
  - `created_at`

- `lead_router_events`
  - `id (uuid pk)`
  - `source_tenant_id (fk tenants)`
  - `lead_id (uuid/text)`
  - `matched_rule_id (fk lead_router_rules, nullable)`
  - `decision_json (jsonb)`
  - `confidence (numeric)`
  - `created_at`

### 3.2 Tablas existentes (a adaptar)
Añadir `tenant_id` + índice en:
- `properties`
- `contacts`
- `tasks`
- `conversations`
- `events`
- `professional_profiles`

Índice recomendado base: `(tenant_id, created_at desc)`

---

## 4) SQL base (propuesta)

```sql
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists lead_router_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  priority int not null default 100,
  condition_json jsonb not null,
  target_tenant_id uuid not null references tenants(id),
  target_pipeline text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists lead_router_events (
  id uuid primary key default gen_random_uuid(),
  source_tenant_id uuid not null references tenants(id),
  lead_id text not null,
  matched_rule_id uuid references lead_router_rules(id),
  decision_json jsonb not null,
  confidence numeric,
  created_at timestamptz not null default now()
);
```

---

## 5) RLS (propuesta de política)

### Contexto
Usar claim JWT `tenant_id` para scope principal y validar membresía para roles elevados.

### Patrón recomendado
1. `enable row level security` en tablas multi-tenant.
2. Policy lectura/escritura por coincidencia de `tenant_id`.
3. Policy extendida para `super_admin` y `tenant_admin`.

Ejemplo (tabla `properties`):

```sql
alter table properties add column if not exists tenant_id uuid;
create index if not exists idx_properties_tenant_created on properties (tenant_id, created_at desc);
alter table properties enable row level security;

create policy properties_select on properties
for select using (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);

create policy properties_insert on properties
for insert with check (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);

create policy properties_update on properties
for update using (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
);
```

---

## 6) Lead Router v1 (implementación funcional mínima)

### Entrada
Lead normalizado con:
- tipo operación (venta/reforma)
- ubicación
- presupuesto
- tipo cliente (particular/profesional)

### Reglas iniciales
1. chalet + presupuesto > 35000 => `Mas Urba`
2. propietario + localidad `Valdemorillo` => `Inmo Cerro`
3. profesional inmobiliario => `MontCastell-AI`
4. particular vendedor => `Domus 49€`
5. reforma pequeña => flujo automático

### Salida
- `assigned_tenant`
- `route_reason`
- `confidence`
- `next_agent`

### Auditoría
Registrar cada decisión en `lead_router_events`.

---

## 7) Plan de migración incremental (sin romper servicio)

1. Crear tablas nuevas (`tenants`, `tenant_memberships`, router).
2. Añadir `tenant_id` nullable en tablas actuales.
3. Backfill por defecto a tenant `domus_core`.
4. Aplicar índices.
5. Activar RLS por tabla de forma escalonada (no todo a la vez).
6. Activar writer path con `tenant_id` obligatorio en backend.
7. Validar por pruebas de aislamiento y regresión.

---

## 8) Riesgos y mitigación

- **Riesgo:** bloqueo de datos por RLS mal configurado  
  **Mitigación:** rollout por tabla + pruebas con usuario admin y usuario tenant.

- **Riesgo:** datos legacy sin `tenant_id`  
  **Mitigación:** backfill + constraint `not null` al final.

- **Riesgo:** reglas ambiguas en router  
  **Mitigación:** prioridad explícita + registro de decisión + fallback.

---

## 9) Siguiente ejecución propuesta

Bloque inmediato de implementación técnica:
1. DDL de tablas multi-tenant en migración SQL.
2. Añadir `tenant_id` en entidades clave del cliente Supabase.
3. Implementar `resolveLeadRoute()` en backend con logging.
4. Entregar PR técnico con checklist de validación.

---

## 10) Estado de revisión
Este documento es de **diseño técnico para revisión**.  
No activa producción ni pagos.
