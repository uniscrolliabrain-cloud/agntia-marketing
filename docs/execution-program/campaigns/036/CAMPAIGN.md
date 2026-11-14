# MKT-C36 · Portal responsive y sesiones Anam

**PROGRAMA PREVIO · NOT_STARTED · 36/42.** [Campaña original](../../campaigns/36-portal-responsive-y-sesiones-anam.md).

## Objetivo y contrato
Construir experiencia revisable para cliente integrado o externo.

**Invariante:** AV es presencia del twin, no identidad, firma o permiso de compra.. **Dependencias:** MKT-C35. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `apps/web/src/views/MarketingPortal.tsx`.
- DTO/validación: `packages/contracts/src/36.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/36.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/036.test.ts` y fixtures `tests/fixtures/036/`.
- Evidencia: `docs/evidence/c36/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `apps/portal/`, `packages/presence/anam/`, `tests/browser/portal-anam.test.ts`.

## Patchsets y aceptación por tarea
### 036.01 — MKT-C36-T01
**Acción:** Diseñar vistas owner/marketer/revisor/colaborador con scope visible.

**Archivo primario:** `apps/web/src/views/MarketingPortal.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Listas y datos sensibles no se muestran por defecto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 036.02 — MKT-C36-T02
**Acción:** Construir chat lateral desktop/panel móvil y flujo de edición/revisión.

**Archivo primario:** `apps/web/src/views/MarketingPortal.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Teclado/lectores/táctil permiten contrastar fuentes antes de aprobar.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C36-T01.

### 036.03 — MKT-C36-T03
**Acción:** Integrar Supabase/cambio de tenant con invalidación de caché/Realtime.

**Archivo primario:** `apps/web/src/views/MarketingPortal.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Borrador deA no se manda bajo sesiónB.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C36-T02.

### 036.04 — MKT-C36-T04
**Acción:** Crear token Anam backend efímero ligado a TwinBinding/mandato/campaña.

**Archivo primario:** `apps/web/src/views/MarketingPortal.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** API key nunca sale y token AV no sustituye JWT.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C36-T03.

### 036.05 — MKT-C36-T05
**Acción:** Aplicar duración/concurrencia/budget/retención y disclosure/permisos AV.

**Archivo primario:** `apps/web/src/views/MarketingPortal.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Grabación off hasta política aprobada; fallback texto útil.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C36-T04.

### 036.06 — MKT-C36-T06
**Acción:** Enrutar tools/confirmaciones por PEP y UI autenticada.

**Archivo primario:** `apps/web/src/views/MarketingPortal.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un sí hablado no compra medios o lanza campañas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C36-T05.

### 036.07 — MKT-C36-T07
**Acción:** Probar móvil ES/EN/FR, red lenta, revocación y reconexión.

**Archivo primario:** `apps/web/src/views/MarketingPortal.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No contexto residual privado ni fake activity.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C36-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C36-G01 / NOT_EXECUTED:** Sesión Anam de campañaA intenta leer audienceB: bloqueada.
- **MKT-C36-G02 / NOT_EXECUTED:** Dos pestañas cambian tenant durante approval: scope/revisión se revalidan.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: apps/portal/public/index.html, packages/core/src/service.ts
Tests ejecutados: 17 en `tests/campaigns/c31-c40.test.ts` (`npx vitest run tests/campaigns/c31-c40.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C36-G01 / NOT_VERIFIED:** Sesión Anam de campañaA intenta leer audienceB: bloqueada.
- **MKT-C36-G02 / NOT_VERIFIED:** Dos pestañas cambian tenant durante approval: scope/revisión se revalidan.

Desviaciones y ajustes de diseño: Portal estático y sesión simulada; no hay integración Anam real ni video.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Integrar Anam con token efímero y verificar que no autentica.
