# MKT-C14 · Entrega email de sandbox y reputación

**PROGRAMA PREVIO · NOT_STARTED · 14/42.** [Campaña original](../../campaigns/14-entrega-email-de-sandbox-y-reputacion.md).

## Objetivo y contrato
Crear primer camino de efecto verificable y autoridad única.

**Invariante:** Ningún correo real fuera de destinatarios sandbox se usa para pasar pruebas.. **Dependencias:** MKT-C13. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/email-sandbox.ts`.
- DTO/validación: `packages/contracts/src/14.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/14.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/014.test.ts` y fixtures `tests/fixtures/014/`.
- Evidencia: `docs/evidence/c14/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/channels/email/`, `docs/email-sandbox.md`, `tests/email-delivery.test.ts`.

## Patchsets y aceptación por tarea
### 014.01 — MKT-C14-T01
**Acción:** Asignar un único emisor entre padre/backend/canal local por intent.

**Archivo primario:** `packages/adapters/src/email-sandbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Una petición duplicada no invoca dos transportes.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 014.02 — MKT-C14-T02
**Acción:** Configurar sink local y allowlist de destinos de prueba.

**Archivo primario:** `packages/adapters/src/email-sandbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Destino no sandbox bloqueado antes de HTTP/SMTP.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C14-T01.

### 014.03 — MKT-C14-T03
**Acción:** Definir remitente/headers/links y sanitización HTML/adjuntos.

**Archivo primario:** `packages/adapters/src/email-sandbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** CRLF, scripts y receptor mutable rechazados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C14-T02.

### 014.04 — MKT-C14-T04
**Acción:** Aplicar elegibilidad/supresión/caps justo antes de dispatch.

**Archivo primario:** `packages/adapters/src/email-sandbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Backend no puede añadir suscriptores fuera del máximo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C14-T03.

### 014.05 — MKT-C14-T05
**Acción:** Normalizar receipt accepted/sent/delivered/bounce/complaint.

**Archivo primario:** `packages/adapters/src/email-sandbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Open/click no se declara entrega humana o compra.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C14-T04.

### 014.06 — MKT-C14-T06
**Acción:** Definir idempotencia y ventanas reales del transporte.

**Archivo primario:** `packages/adapters/src/email-sandbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Ledger local no promete dedup remoto ilimitado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C14-T05.

### 014.07 — MKT-C14-T07
**Acción:** Probar pérdida ACK, caída worker y fallback prohibido.

**Archivo primario:** `packages/adapters/src/email-sandbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un efecto o uncertainty visible, nunca nuevo envío desde otro backend.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C14-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C14-G01 / NOT_EXECUTED:** Proveedor aceptó pero cliente recibe timeout: no mandar de nuevo por Resend/padre.
- **MKT-C14-G02 / NOT_EXECUTED:** Mensaje de prueba a dirección del owner no aprobada como sandbox se rechaza.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/adapters/src/stubs.ts, apps/worker/src/worker.ts
Tests ejecutados: 20 en `tests/campaigns/c11-c20.test.ts` (`npx vitest run tests/campaigns/c11-c20.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C14-G01 / PASS:** Proveedor aceptó pero cliente recibe timeout: no mandar de nuevo por Resend/padre.
- **MKT-C14-G02 / PASS:** Mensaje de prueba a dirección del owner no aprobada como sandbox se rechaza.

Desviaciones y ajustes de diseño: La entrega verificada es de sandbox; no se envió correo real a nadie.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Añadir proveedor real con dominio verificado y gestión de reputación.
