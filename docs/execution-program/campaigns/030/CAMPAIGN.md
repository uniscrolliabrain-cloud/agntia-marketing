# MKT-C30 · Ads en test accounts y borradores controlados

**PROGRAMA PREVIO · NOT_STARTED · 30/42.** [Campaña original](../../campaigns/30-ads-en-test-accounts-y-borradores-controlados.md).

## Objetivo y contrato
Validar propuestas con proveedores de prueba sin gasto/producción.

**Invariante:** No lanzar campañas, activar billing o gastar medios de clientes en esta campaña.. **Dependencias:** MKT-C29. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/paid-media-draft.ts`.
- DTO/validación: `packages/contracts/src/30.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/30.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/030.test.ts` y fixtures `tests/fixtures/030/`.
- Evidencia: `docs/evidence/c30/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/ads-test/`, `docs/paid-activation-boundary.md`, `tests/integration/ads-sandbox.test.ts`.

## Patchsets y aceptación por tarea
### 030.01 — MKT-C30-T01
**Acción:** Definir allowlist de cuentas exclusivamente test y credenciales separadas.

**Archivo primario:** `packages/adapters/src/paid-media-draft.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cuenta producción se rechaza incluso si token tiene acceso.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 030.02 — MKT-C30-T02
**Acción:** Descubrir validate_only por método admitido y semántica de errors.

**Archivo primario:** `packages/adapters/src/paid-media-draft.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No inventar garantía universal de dry-run para cualquier API.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C30-T01.

### 030.03 — MKT-C30-T03
**Acción:** Crear preview con creativo, audience/targeting, moneda, límites y riesgos.

**Archivo primario:** `packages/adapters/src/paid-media-draft.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Una propuesta de budget no es aprobación de compra.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C30-T02.

### 030.04 — MKT-C30-T04
**Acción:** Vincular autorización humana y expectedVersion a validación/write test.

**Archivo primario:** `packages/adapters/src/paid-media-draft.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** LLM no puede elevar test a ejecución real.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C30-T03.

### 030.05 — MKT-C30-T05
**Acción:** Crear borrador/paused solo si estado y atomicidad están probados.

**Archivo primario:** `packages/adapters/src/paid-media-draft.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No defaults enabled o activación por otra entidad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C30-T04.

### 030.06 — MKT-C30-T06
**Acción:** Reconciliar timeout/partial_failure sin borrar o duplicar objetos.

**Archivo primario:** `packages/adapters/src/paid-media-draft.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Error por operación conserva resultado parcial explícito.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C30-T05.

### 030.07 — MKT-C30-T07
**Acción:** Documentar gates de producción pendientes y no probados en test.

**Archivo primario:** `packages/adapters/src/paid-media-draft.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Performance/overdelivery reales requieren otro encargo y entorno autorizado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C30-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C30-G01 / NOT_EXECUTED:** Cambiar testAccountId por cuenta real bloquea antes de mutar.
- **MKT-C30-G02 / NOT_EXECUTED:** Timeout de creación paused no se reintenta con nueva key creando duplicado.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/delivery.ts
Tests ejecutados: 17 en `tests/campaigns/c21-c30.test.ts` (`npx vitest run tests/campaigns/c21-c30.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C30-G01 / NOT_VERIFIED:** Cambiar testAccountId por cuenta real bloquea antes de mutar.
- **MKT-C30-G02 / NOT_VERIFIED:** Timeout de creación paused no se reintenta con nueva key creando duplicado.

Desviaciones y ajustes de diseño: La propuesta queda bloqueada para producción y con techo de 50 EUR/día.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Confirmar qué funciones cubre validate_only antes de ampliar.
