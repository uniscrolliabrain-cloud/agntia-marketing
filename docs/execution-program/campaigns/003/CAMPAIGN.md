# MKT-C03 · Supabase JWT y principal verificado

**PROGRAMA PREVIO · NOT_STARTED · 3/42.** [Campaña original](../../campaigns/03-supabase-jwt-y-principal-verificado.md).

## Objetivo y contrato
Autenticar todos los modos y resolver tenant desde autoridad confiable.

**Invariante:** Firma válida sin membership/scope no concede acceso empresarial.. **Dependencias:** MKT-C02. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/auth/src/principal.ts`.
- DTO/validación: `packages/contracts/src/03.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/03.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/003.test.ts` y fixtures `tests/fixtures/003/`.
- Evidencia: `docs/evidence/c03/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/auth/`, `tests/security/jwt.test.ts`, `docs/auth-contract.md`.

## Patchsets y aceptación por tarea
### 003.01 — MKT-C03-T01
**Acción:** Fijar issuer/audience/proyecto/JWKS y algoritmos en servidor.

**Archivo primario:** `packages/auth/src/principal.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Token no elige host de claves ni configuración de confianza.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 003.02 — MKT-C03-T02
**Acción:** Verificar firma, exp/nbf, tolerancia, rotación y caché acotada.

**Archivo primario:** `packages/auth/src/principal.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** JWKS caído o algoritmo inválido no activa fallback.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C03-T01.

### 003.03 — MKT-C03-T03
**Acción:** Resolver sub a usuario activo y tenant a membership provisionada.

**Archivo primario:** `packages/auth/src/principal.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** user_metadata no autoriza ni crea membership implícita.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C03-T02.

### 003.04 — MKT-C03-T04
**Acción:** Conservar tenantId opaco y roles/capacidades de servidor.

**Archivo primario:** `packages/auth/src/principal.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** authenticated no equivale a owner ni marketer.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C03-T03.

### 003.05 — MKT-C03-T05
**Acción:** Aplicar ACL de proyecto/recurso/campo a principal.

**Archivo primario:** `packages/auth/src/principal.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Usuario válido no ve listas completas por compartir tenant.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C03-T04.

### 003.06 — MKT-C03-T06
**Acción:** Definir credencial privada de worker y mandato originado por principal.

**Archivo primario:** `packages/auth/src/principal.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No falsificar JWT humano o guardarlo indefinidamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C03-T05.

### 003.07 — MKT-C03-T07
**Acción:** Probar claims manipulados, suspensión y cambio de tenant.

**Archivo primario:** `packages/auth/src/principal.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** 401/403/404 consistentes, sin metadatos de otros clientes.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C03-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C03-G01 / NOT_EXECUTED:** JWT de otro proyecto o tenant_idB en sesiónA se rechaza.
- **MKT-C03-G02 / NOT_EXECUTED:** Revocar membership con job en cola impide el siguiente efecto.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: apps/api/src/auth.ts
Tests ejecutados: 26 en `tests/campaigns/c01-c10.test.ts` (`npx vitest run tests/campaigns/c01-c10.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C03-G01 / PASS:** JWT de otro proyecto o tenant_idB en sesiónA se rechaza.
- **MKT-C03-G02 / PASS:** Revocar membership con job en cola impide el siguiente efecto.

Desviaciones y ajustes de diseño: La ruta JWKS está implementada pero sólo se probó HS256 local: la verificación contra Supabase real queda NOT_VERIFIED.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Probar RS256 con un proyecto Supabase de staging antes de producción.
