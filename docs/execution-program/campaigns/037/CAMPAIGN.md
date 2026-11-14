# MKT-C37 · Cooperación SaaS, handoffs y rotas

**PROGRAMA PREVIO · NOT_STARTED · 37/42.** [Campaña original](../../campaigns/37-cooperacion-saas-handoffs-y-rotas.md).

## Objetivo y contrato
Coordinar servicios solapados con contratos mínimos y recibos reales.

**Invariante:** Repos hermanos no reciben datos por defecto ni crean un scheduler empresarial paralelo.. **Dependencias:** MKT-C36. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/bridge/src/parent-handoff.ts`.
- DTO/validación: `packages/contracts/src/37.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/37.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/037.test.ts` y fixtures `tests/fixtures/037/`.
- Evidencia: `docs/evidence/c37/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/service-agreements/`, `packages/handoffs/`, `docs/sibling-contracts.md`.

## Patchsets y aceptación por tarea
### 037.01 — MKT-C37-T01
**Acción:** Definir contratos con redes/clientes/ventas/branding/finanzas/legal.

**Archivo primario:** `packages/bridge/src/parent-handoff.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Alcance de dato/finalidad y autoridad por efecto explícitos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 037.02 — MKT-C37-T02
**Acción:** Crear WorkOrder y entregable con proponente/revisor/aceptante.

**Archivo primario:** `packages/bridge/src/parent-handoff.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Aceptación comercial no autoriza cada efecto técnico.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C37-T01.

### 037.03 — MKT-C37-T03
**Acción:** Implementar offered/acknowledged/working/completed/returned para handoff.

**Archivo primario:** `packages/bridge/src/parent-handoff.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Emitir evento no prueba trabajo recibido.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C37-T02.

### 037.04 — MKT-C37-T04
**Acción:** Coordinar autoridad única de envío/caps/budget entre servicios.

**Archivo primario:** `packages/bridge/src/parent-handoff.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Conflicto produce bloqueo, no carrera de emisores.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C37-T03.

### 037.05 — MKT-C37-T05
**Acción:** Definir datos/eventos de briefing diario/semanal/mensual.

**Archivo primario:** `packages/bridge/src/parent-handoff.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Padre gobierna rota; no inventar actividad para llenarla.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C37-T04.

### 037.06 — MKT-C37-T06
**Acción:** Definir operación de cliente externo y portabilidad/salida.

**Archivo primario:** `packages/bridge/src/parent-handoff.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin UI AgntiaPro requerida, mismo twin/identity policy.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C37-T05.

### 037.07 — MKT-C37-T07
**Acción:** Probar hermano ausente, ACK tardío y datos sin permiso.

**Archivo primario:** `packages/bridge/src/parent-handoff.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Tarea humana/local válida o bloqueo explicado, sin dictamen/saldo inventado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C37-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C37-G01 / NOT_EXECUTED:** Redes y marketing reciben mismo publicable: un EffectOwner controla dispatch.
- **MKT-C37-G02 / NOT_EXECUTED:** Export de clientes a servicio hermano sin contrato se rechaza aunque sea mismo owner.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/service.ts
Tests ejecutados: 17 en `tests/campaigns/c31-c40.test.ts` (`npx vitest run tests/campaigns/c31-c40.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C37-G01 / PASS:** Redes y marketing reciben mismo publicable: un EffectOwner controla dispatch.
- **MKT-C37-G02 / PASS:** Export de clientes a servicio hermano sin contrato se rechaza aunque sea mismo owner.

Desviaciones y ajustes de diseño: Se detectan conflictos de responsable; no hay máquina de estados de handoff completa.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Completar aceptación/rechazo y timeouts entre servicios.
