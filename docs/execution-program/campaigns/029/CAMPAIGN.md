# MKT-C29 · Paid media lectura y descubrimiento

**PROGRAMA PREVIO · NOT_STARTED · 29/42.** [Campaña original](../../campaigns/29-paid-media-lectura-y-descubrimiento.md).

## Objetivo y contrato
Preparar informes/propuestas de ads sin habilitar compras.

**Invariante:** Acceso a cuenta/reportes no autoriza mutación, customer-match o billing.. **Dependencias:** MKT-C28. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/paid-media-read.ts`.
- DTO/validación: `packages/contracts/src/29.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/29.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/029.test.ts` y fixtures `tests/fixtures/029/`.
- Evidencia: `docs/evidence/c29/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/adapters/google-ads/read.ts`, `packages/adapters/meta-ads/read.ts`, `docs/ads-capabilities.md`.

## Patchsets y aceptación por tarea
### 029.01 — MKT-C29-T01
**Acción:** Verificar documentación/scopes/versión y credenciales aprobadas.

**Archivo primario:** `packages/adapters/src/paid-media-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Meta429 mantiene actual verificación pendiente, no ejemplo heredado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 029.02 — MKT-C29-T02
**Acción:** Validar tenant→ad account/manager/currency/timezone.

**Archivo primario:** `packages/adapters/src/paid-media-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cuenta hija de otro cliente no se descubre como fallback.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C29-T01.

### 029.03 — MKT-C29-T03
**Acción:** Implementar consultas nominadas de rendimiento con fields cerrados.

**Archivo primario:** `packages/adapters/src/paid-media-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No GAQL/query arbitraria del modelo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C29-T02.

### 029.04 — MKT-C29-T04
**Acción:** Preservar definiciones de conversión/atribución/ventana y data lag.

**Archivo primario:** `packages/adapters/src/paid-media-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No sumar ventas atribuidas entre plataformas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C29-T03.

### 029.05 — MKT-C29-T05
**Acción:** Descubrir límites de test accounts/reporting y capacidades.

**Archivo primario:** `packages/adapters/src/paid-media-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Fake performance no se presenta como dataset de campaña real.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C29-T04.

### 029.06 — MKT-C29-T06
**Acción:** Crear propuestas de creativo/targeting/presupuesto en DTO local.

**Archivo primario:** `packages/adapters/src/paid-media-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin mutation/upload audiencia/offline conversions por leer.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C29-T05.

### 029.07 — MKT-C29-T07
**Acción:** Probar revocación, rate-limit, cuentaB y payload grande.

**Archivo primario:** `packages/adapters/src/paid-media-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Lectura falla segura y no activa anuncios.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C29-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C29-G01 / NOT_EXECUTED:** Tool ads_read solicita billing/mutate: capability denegada antes de HTTP.
- **MKT-C29-G02 / NOT_EXECUTED:** Datos atribuidos duplicados de Meta/Google no se convierten en ingreso único sumado.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
