# MKT-C34 · Dashboard, infografías y briefing

**PROGRAMA PREVIO · NOT_STARTED · 34/42.** [Campaña original](../../campaigns/34-dashboard-infografias-y-briefing.md).

## Objetivo y contrato
Mostrar trabajo y resultados reproducibles sin rellenar huecos.

**Invariante:** La visualización no convierte estimación o dato ausente en hecho.. **Dependencias:** MKT-C33. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `apps/web/src/views/MarketingDashboard.tsx`.
- DTO/validación: `packages/contracts/src/34.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/34.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/034.test.ts` y fixtures `tests/fixtures/034/`.
- Evidencia: `docs/evidence/c34/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/reporting/`, `apps/portal/reports/`, `docs/metrics-catalog.md`.

## Patchsets y aceptación por tarea
### 034.01 — MKT-C34-T01
**Acción:** Definir catálogo de KPI con definición/denominador/exclusiones.

**Archivo primario:** `apps/web/src/views/MarketingDashboard.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** CTR/CVR/ROAS no se suman o promedian sin regla.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 034.02 — MKT-C34-T02
**Acción:** Crear snapshots con datasets/filtros/versions/hash y ACL.

**Archivo primario:** `apps/web/src/views/MarketingDashboard.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Mismo snapshot reproduce cifras aunque fuente cambie.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C34-T01.

### 034.03 — MKT-C34-T03
**Acción:** Construir gráficos/tablas con coverage/freshness/uncertainty.

**Archivo primario:** `apps/web/src/views/MarketingDashboard.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Descriptivo/atribuido/causal visibles en cada claim.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C34-T02.

### 034.04 — MKT-C34-T04
**Acción:** Agregar timeline de entregables, approvals, efectos y bloqueos.

**Archivo primario:** `apps/web/src/views/MarketingDashboard.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Laia/supervisor solo reporta trabajo con receipt/evidencia.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C34-T03.

### 034.05 — MKT-C34-T05
**Acción:** Generar narrativa con fuentes y afirmaciones verificables.

**Archivo primario:** `apps/web/src/views/MarketingDashboard.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Modelo no rellena ingresos/métricas que faltan.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C34-T04.

### 034.06 — MKT-C34-T06
**Acción:** Exportar PDF/SVG/HTML u otros formatos tras revisión de datos.

**Archivo primario:** `apps/web/src/views/MarketingDashboard.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin PII/secretos/CSV injection o enlaces de otros tenants.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C34-T05.

### 034.07 — MKT-C34-T07
**Acción:** Probar cifras tardías, cero, null y reporte multilingüe.

**Archivo primario:** `apps/web/src/views/MarketingDashboard.tsx`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Nueva revisión no altera silenciosamente un informe aceptado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C34-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C34-G01 / NOT_EXECUTED:** Sin conversiones observadas no se afirma ROI ni fracaso sin cobertura.
- **MKT-C34-G02 / NOT_EXECUTED:** InformeA no muestra lista, modelo, links o agregados identificables deB.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/measurement.ts
Tests ejecutados: 17 en `tests/campaigns/c31-c40.test.ts` (`npx vitest run tests/campaigns/c31-c40.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C34-G01 / NOT_VERIFIED:** Sin conversiones observadas no se afirma ROI ni fracaso sin cobertura.
- **MKT-C34-G02 / NOT_VERIFIED:** InformeA no muestra lista, modelo, links o agregados identificables deB.

Desviaciones y ajustes de diseño: El reporte es un snapshot JSON con hash; no hay render HTML ni infografías.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Añadir render y export con control de acceso por campo.
