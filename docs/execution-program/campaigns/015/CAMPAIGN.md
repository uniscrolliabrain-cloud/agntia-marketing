# MKT-C15 · Formularios y landings controladas

**PROGRAMA PREVIO · NOT_STARTED · 15/42.** [Campaña original](../../campaigns/15-formularios-y-landings-controladas.md).

## Objetivo y contrato
Recoger datos mínimos y proponer cambios web revisables.

**Invariante:** Publicar página y activar tracking son efectos distintos de guardar un borrador.. **Dependencias:** MKT-C14. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/landings.ts`.
- DTO/validación: `packages/contracts/src/15.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/15.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/015.test.ts` y fixtures `tests/fixtures/015/`.
- Evidencia: `docs/evidence/c15/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/landings/`, `packages/forms/`, `tests/landing-intake.test.ts`.

## Patchsets y aceptación por tarea
### 015.01 — MKT-C15-T01
**Acción:** Definir plantilla/HTML permitido y derechos de assets.

**Archivo primario:** `packages/domain/src/landings.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Scripts/iframes/URLs arbitrarios no pasan por contenido LLM.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 015.02 — MKT-C15-T02
**Acción:** Definir formulario mínimo con notice/purpose/version y consentimiento separado.

**Archivo primario:** `packages/domain/src/landings.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Casillas no preaceptan promoción por enviar consulta.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C15-T01.

### 015.03 — MKT-C15-T03
**Acción:** Provisionar binding dominio/proyecto/tenant por servidor.

**Archivo primario:** `packages/domain/src/landings.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Visitante no dirige datos a otro tenant desde hidden field.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C15-T02.

### 015.04 — MKT-C15-T04
**Acción:** Aplicar Supabase/capacidad de intake limitada y antiabuso.

**Archivo primario:** `packages/domain/src/landings.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Registro no crea membership ni acceso interior.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C15-T03.

### 015.05 — MKT-C15-T05
**Acción:** Crear preview/diff con audiencia/copy/links/UTM y política tags.

**Archivo primario:** `packages/domain/src/landings.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin deploy o pixels al previsualizar.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C15-T04.

### 015.06 — MKT-C15-T06
**Acción:** Definir adaptador CMS opcional nominativo con aprobación de cambio.

**Archivo primario:** `packages/domain/src/landings.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No tocar repo agente ni deploy producción desde este plan.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C15-T05.

### 015.07 — MKT-C15-T07
**Acción:** Probar móvil/accesibilidad, CSV/HTML injection y doble submit.

**Archivo primario:** `packages/domain/src/landings.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un intake deduplicado y aviso/versión recuperables.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C15-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C15-G01 / NOT_EXECUTED:** Formulario recopila email para recurso y no inscribe automáticamente a newsletter.
- **MKT-C15-G02 / NOT_EXECUTED:** Landing incluye tag remoto no aprobado: publicación bloqueada.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/campaigns.ts, apps/portal/public/index.html
Tests ejecutados: 20 en `tests/campaigns/c11-c20.test.ts` (`npx vitest run tests/campaigns/c11-c20.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C15-G01 / NOT_VERIFIED:** Formulario recopila email para recurso y no inscribe automáticamente a newsletter.
- **MKT-C15-G02 / NOT_VERIFIED:** Landing incluye tag remoto no aprobado: publicación bloqueada.

Desviaciones y ajustes de diseño: Se propone y publica con aprobación, pero no hay despliegue real de landing ni formularios.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Definir hosting, CSP y flujo de formularios antes de publicar.
