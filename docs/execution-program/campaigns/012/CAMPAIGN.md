# MKT-C12 · Mautic borradores y autoridad de ejecución

**PROGRAMA PREVIO · NOT_STARTED · 12/42.** [Campaña original](../../campaigns/12-mautic-borradores-y-autoridad-de-ejecucion.md).

## Objetivo y contrato
Preparar contactos/campañas sin activar side effects imprevistos.

**Invariante:** Crear/importar un contacto no debe disparar un workflow no aprobado.. **Dependencias:** MKT-C11. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/mautic-write.ts`.
- DTO/validación: `packages/contracts/src/12.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/12.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/012.test.ts` y fixtures `tests/fixtures/012/`.
- Evidencia: `docs/evidence/c12/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/adapters/mautic/write.ts`, `docs/mautic-execution-boundary.md`, `tests/mautic-drafts.test.ts`.

## Patchsets y aceptación por tarea
### 012.01 — MKT-C12-T01
**Acción:** Inventariar eventos/cron/plugins que pueden enviar tras cambios.

**Archivo primario:** `packages/adapters/src/mautic-write.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Test fixture demuestra ausencia de triggers colaterales.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 012.02 — MKT-C12-T02
**Acción:** Definir create/update allowlist y dry-run local de diff.

**Archivo primario:** `packages/adapters/src/mautic-write.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin write remoto en preview.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C12-T01.

### 012.03 — MKT-C12-T03
**Acción:** Vincular approval al contenido/audiencia/canal/estado y coste.

**Archivo primario:** `packages/adapters/src/mautic-write.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No autorización general al árbol completo de campaña.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C12-T02.

### 012.04 — MKT-C12-T04
**Acción:** Crear draft desactivado en sandbox con idempotency/link.

**Archivo primario:** `packages/adapters/src/mautic-write.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No scheduled/running por valor default o relación al segmento.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C12-T03.

### 012.05 — MKT-C12-T05
**Acción:** Verificar estado remoto y escritura incierta por refs fiables.

**Archivo primario:** `packages/adapters/src/mautic-write.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin lookup suficiente no hay retry automático.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C12-T04.

### 012.06 — MKT-C12-T06
**Acción:** Evaluar si el backend permite supresión y máximo congelado al enviar.

**Archivo primario:** `packages/adapters/src/mautic-write.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Si no, dispatch permanece bloqueado por esa ruta.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C12-T05.

### 012.07 — MKT-C12-T07
**Acción:** Probar import/replay, edición concurrente y plugin de prueba adversarial.

**Archivo primario:** `packages/adapters/src/mautic-write.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Ningún correo fuera del sink y audit completo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C12-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C12-G01 / NOT_EXECUTED:** Agregar contacto al segmento intentaría enviar por cron: gate bloquea ruta.
- **MKT-C12-G02 / NOT_EXECUTED:** Timeout tras draft create no duplica campaña al reintentar.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/campaigns.ts, packages/adapters/src/stubs.ts
Tests ejecutados: 20 en `tests/campaigns/c11-c20.test.ts` (`npx vitest run tests/campaigns/c11-c20.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C12-G01 / NOT_VERIFIED:** Agregar contacto al segmento intentaría enviar por cron: gate bloquea ruta.
- **MKT-C12-G02 / NOT_VERIFIED:** Timeout tras draft create no duplica campaña al reintentar.

Desviaciones y ajustes de diseño: La autoridad de ejecución está implementada; el empuje de borradores a Mautic no existe.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Implementar draft push idempotente con receipt y reconciliación.
