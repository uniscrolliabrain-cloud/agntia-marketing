# MKT-C35 · SDK Hono, tools y bridge del padre

**PROGRAMA PREVIO · NOT_STARTED · 35/42.** [Campaña original](../../campaigns/35-sdk-hono-tools-y-bridge-del-padre.md).

## Objetivo y contrato
Preparar interoperabilidad tipada sin editar agente.

**Invariante:** MCP/Anam/SDK pasan por mismo PEP; no proxy genérico ni wiring automático al padre.. **Dependencias:** MKT-C34. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/sdk/src/index.ts`.
- DTO/validación: `packages/contracts/src/35.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/35.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/035.test.ts` y fixtures `tests/fixtures/035/`.
- Evidencia: `docs/evidence/c35/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/sdk/`, `packages/host-bridge/`, `docs/host-patch-proposal.md`.

## Patchsets y aceptación por tarea
### 035.01 — MKT-C35-T01
**Acción:** Crear cliente servidor con DTOs/error/timeouts y config privada.

**Archivo primario:** `packages/sdk/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No token proveedor en browser ni unknown sin validación.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 035.02 — MKT-C35-T02
**Acción:** Crear allowlist exacta método/ruta/tamaño en Hono.

**Archivo primario:** `packages/sdk/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Nuevo endpoint sensible no queda expuesto por prefijo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C35-T01.

### 035.03 — MKT-C35-T03
**Acción:** Definir tools de lectura/propuesta con input mínimo.

**Archivo primario:** `packages/sdk/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Actor/tenant/capabilities fuera del control del modelo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C35-T02.

### 035.04 — MKT-C35-T04
**Acción:** Mapear SystemEvent nativo1.0/owner/emittedAt/source permitido.

**Archivo primario:** `packages/sdk/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Marketing events nuevos no se insertan como enum inventado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C35-T03.

### 035.05 — MKT-C35-T05
**Acción:** Implementar inbox/outbox/receipt/ACK y enlaces de tarea/evidencia.

**Archivo primario:** `packages/sdk/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Replay no crea doble tarea/envío.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C35-T04.

### 035.06 — MKT-C35-T06
**Acción:** Documentar patch de instalación/wiring sin aplicarlo.

**Archivo primario:** `packages/sdk/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cero cambios a claims/rutas/config del padre.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C35-T05.

### 035.07 — MKT-C35-T07
**Acción:** Probar contratos API↔SDK↔host fake y build.

**Archivo primario:** `packages/sdk/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Fake no se anuncia integración instalada, real queda gate pendiente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C35-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C35-G01 / NOT_EXECUTED:** Modelo intenta /provider/method o SQL libre: rechazo antes de ejecutar.
- **MKT-C35-G02 / NOT_EXECUTED:** Host approval adapter ausente no permite fabricar una aprobación local equivalente.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/sdk/src/*.ts
Tests ejecutados: 17 en `tests/campaigns/c31-c40.test.ts` (`npx vitest run tests/campaigns/c31-c40.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C35-G01 / PASS:** Modelo intenta /provider/method o SQL libre: rechazo antes de ejecutar.
- **MKT-C35-G02 / PASS:** Host approval adapter ausente no permite fabricar una aprobación local equivalente.

Desviaciones y ajustes de diseño: El SDK cubre 8 tools; no se publicó paquete ni se desplegó Hono externo.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Publicar SDK versionado cuando el contrato esté congelado.

## Hardening 2026-11-15 (2ª pasada)

Estado tras hardening: DONE

- `GET /v1/marketing/events` sirve eventos del tenant autenticado, con `limit` acotado a 200.
- `GET /v1/marketing/conflicts` expone conflictos de responsable del tenant.
- Ambas rutas exigen capability de lectura; no hay lectura cruzada entre tenants.

Gates: G01 y G02 siguen PASS.

Límite que sigue abierto: El bridge al padre sigue siendo eventos en memoria; no hay transporte real al bus del padre.
