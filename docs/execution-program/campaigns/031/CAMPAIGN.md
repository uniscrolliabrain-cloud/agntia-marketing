# MKT-C31 · Atribución e incrementalidad admisible

**PROGRAMA PREVIO · NOT_STARTED · 31/42.** [Campaña original](../../campaigns/31-atribucion-e-incrementalidad-admisible.md).

## Objetivo y contrato
Separar crédito de efecto causal y validar datasets de medición.

**Invariante:** Ajuste, correlación o ventas atribuidas no prueban incremento.. **Dependencias:** MKT-C30. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/analytics/src/attribution.ts`.
- DTO/validación: `packages/contracts/src/31.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/31.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/031.test.ts` y fixtures `tests/fixtures/031/`.
- Evidencia: `docs/evidence/c31/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/measurement/claims/`, `docs/identification-contract.md`, `tests/measurement-claims.test.ts`.

## Patchsets y aceptación por tarea
### 031.01 — MKT-C31-T01
**Acción:** Definir métricas de negocio, ingreso neto/bruto/margen y fuentes.

**Archivo primario:** `packages/analytics/src/attribution.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin coste/margen no mostrar beneficio inventado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 031.02 — MKT-C31-T02
**Acción:** Deduplicar ConversionFacts y aplicar cancelaciones/refunds.

**Archivo primario:** `packages/analytics/src/attribution.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Una venta atribuida por varios canales cuenta una vez como hecho.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C31-T01.

### 031.03 — MKT-C31-T03
**Acción:** Definir reglas de atribución versionadas y límites de ventana.

**Archivo primario:** `packages/analytics/src/attribution.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Reporte etiqueta explícitamente plataforma/modelo y cobertura.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C31-T02.

### 031.04 — MKT-C31-T04
**Acción:** Crear contrato causal con estimand/población/tratamiento/controles.

**Archivo primario:** `packages/analytics/src/attribution.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No denominar causal una regresión sin justificación.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C31-T03.

### 031.05 — MKT-C31-T05
**Acción:** Validar experimentos naturales/cortes con supuestos y alternativas.

**Archivo primario:** `packages/analytics/src/attribution.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Intervención descubierta no se asume exógena.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C31-T04.

### 031.06 — MKT-C31-T06
**Acción:** Calcular incertidumbre/sensibilidad y estados insufficient/blocked.

**Archivo primario:** `packages/analytics/src/attribution.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Salida descriptiva sigue útil sin fabricar iROAS.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C31-T05.

### 031.07 — MKT-C31-T07
**Acción:** Probar confusión endógena, placebo y efecto conocido sintético.

**Archivo primario:** `packages/analytics/src/attribution.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Se mide recuperación/false conclusions, no solo fit.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C31-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C31-G01 / NOT_EXECUTED:** Modelo ajusta bien pero atribuye ventas preexistentes: no se certifica causalidad.
- **MKT-C31-G02 / NOT_EXECUTED:** Plataforma reporta ingresos pero no IDs negocio: cobertura/dedup limitados se explican.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/measurement.ts
Tests ejecutados: 17 en `tests/campaigns/c31-c40.test.ts` (`npx vitest run tests/campaigns/c31-c40.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C31-G01 / PASS:** Modelo ajusta bien pero atribuye ventas preexistentes: no se certifica causalidad.
- **MKT-C31-G02 / PASS:** Plataforma reporta ingresos pero no IDs negocio: cobertura/dedup limitados se explican.

Desviaciones y ajustes de diseño: Se impide sumar plataformas; no hay cálculo de incrementalidad real.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Diseñar experimentos de geo o switchback cuando haya volumen.
