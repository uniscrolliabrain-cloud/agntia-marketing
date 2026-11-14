# MKT-C28 · Experimentación con GrowthBook

**PROGRAMA PREVIO · NOT_STARTED · 28/42.** [Campaña original](../../campaigns/28-experimentacion-con-growthbook.md).

## Objetivo y contrato
Diseñar y ejecutar asignación acotada con análisis predefinido.

**Invariante:** Feature flag no es permiso para exponer población o gastar; p-value no sustituye diseño.. **Dependencias:** MKT-C27. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/growthbook.ts`.
- DTO/validación: `packages/contracts/src/28.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/28.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/028.test.ts` y fixtures `tests/fixtures/028/`.
- Evidencia: `docs/evidence/c28/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/experiments/`, `packages/adapters/growthbook/`, `tests/experiment-integrity.test.ts`.

## Patchsets y aceptación por tarea
### 028.01 — MKT-C28-T01
**Acción:** Fijar versión/licencias/funciones y scope proyecto.

**Archivo primario:** `packages/adapters/src/growthbook.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Enterprise no se asume disponible por README.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 028.02 — MKT-C28-T02
**Acción:** Definir ExperimentSpec de unidad/población/hipótesis/MDE/guardrails.

**Archivo primario:** `packages/adapters/src/growthbook.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Estimand y análisis plan revisados antes de observar resultado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C28-T01.

### 028.03 — MKT-C28-T03
**Acción:** Validar elegibilidad/asignación/exposición y persistencia de bucket.

**Archivo primario:** `packages/adapters/src/growthbook.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No reasignación por reintento o cambio de dispositivo sin policy.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C28-T02.

### 028.04 — MKT-C28-T04
**Acción:** Implementar exposición y outcomes con dedup/ventanas.

**Archivo primario:** `packages/adapters/src/growthbook.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No contamination silenciosa entre tratamiento/control.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C28-T03.

### 028.05 — MKT-C28-T05
**Acción:** Comprobar SRM, potencia, comparaciones múltiples y reglas de parada.

**Archivo primario:** `packages/adapters/src/growthbook.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No declarar ganador por mirar repetidamente sin método válido.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C28-T04.

### 028.06 — MKT-C28-T06
**Acción:** Aplicar preview/approval a activar configuración, no flag global libre.

**Archivo primario:** `packages/adapters/src/growthbook.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Solo fixture/sandbox en esta campaña sin usuarios reales.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C28-T05.

### 028.07 — MKT-C28-T07
**Acción:** Probar A/A, efecto sintético conocido, nulo y cambio concurrente.

**Archivo primario:** `packages/adapters/src/growthbook.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Falso positivo, pérdida y exclusiones quedan medidos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C28-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C28-G01 / NOT_EXECUTED:** SRM o contaminación impiden reportar uplift como conclusión firme.
- **MKT-C28-G02 / NOT_EXECUTED:** LLM intenta activar feature flag de todos los proyectos: denegado.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
