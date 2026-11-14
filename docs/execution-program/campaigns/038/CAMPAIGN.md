# MKT-C38 · Coste de servicio y observabilidad operacional

**PROGRAMA PREVIO · NOT_STARTED · 38/42.** [Campaña original](../../campaigns/38-coste-de-servicio-y-observabilidad-operacional.md).

## Objetivo y contrato
Medir consumo y fiabilidad antes de prometer planes y escala.

**Invariante:** Bolsas30/70/300 son hipótesis, no tarifa/proveedor contratado ni gasto de medios.. **Dependencias:** MKT-C37. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/observability/src/costs.ts`.
- DTO/validación: `packages/contracts/src/38.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/38.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/038.test.ts` y fixtures `tests/fixtures/038/`.
- Evidencia: `docs/evidence/c38/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/observability/`, `packages/usage/`, `docs/cost-workloads.md`.

## Patchsets y aceptación por tarea
### 038.01 — MKT-C38-T01
**Acción:** Verificar tarifas/mínimos/región/retención de proveedores elegidos.

**Archivo primario:** `packages/observability/src/costs.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No precios de memoria ni compra para pasar un gate.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 038.02 — MKT-C38-T02
**Acción:** Instrumentar tokens/minutosAV/email/storage/egress/compute por operación.

**Archivo primario:** `packages/observability/src/costs.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Consumo observado ligado a reserva y receipt.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C38-T01.

### 038.03 — MKT-C38-T03
**Acción:** Aplicar routing de modelos aprobados y escalado bajo presupuesto.

**Archivo primario:** `packages/observability/src/costs.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Fallback barato no mueve PII a proveedor no aprobado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C38-T02.

### 038.04 — MKT-C38-T04
**Acción:** Implementar rate-limit/backpressure y aislamiento de ruido.

**Archivo primario:** `packages/observability/src/costs.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un tenant no monopoliza cola/cómputo ajenos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C38-T03.

### 038.05 — MKT-C38-T05
**Acción:** Crear logs/traces sanitizados y métricas de lag/unknown/conflictos.

**Archivo primario:** `packages/observability/src/costs.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No JWT/tokens/emails en etiquetas de telemetría.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C38-T04.

### 038.06 — MKT-C38-T06
**Acción:** Medir p50/p95, costo por tarea válida y sensibilidad de volumen.

**Archivo primario:** `packages/observability/src/costs.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No presentar una simulación como SLA comercial.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C38-T05.

### 038.07 — MKT-C38-T07
**Acción:** Probar agotamiento y reconciliación tardía con extras disabled.

**Archivo primario:** `packages/observability/src/costs.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Seguridad no se degrada; AV/MMM se bloquea si no cabe.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C38-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C38-G01 / NOT_EXECUTED:** Plan mínimo AV supera bolsaLite: no se activa cargo automático.
- **MKT-C38-G02 / NOT_EXECUTED:** Segundo tenant bajo carga conserva límites/servicio sin lectura cruzada.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
