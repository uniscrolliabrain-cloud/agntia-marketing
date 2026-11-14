# MKT-C19 · Journeys y motor de campañas

**PROGRAMA PREVIO · NOT_STARTED · 19/42.** [Campaña original](../../campaigns/19-journeys-y-motor-de-campanas.md).

## Objetivo y contrato
Ejecutar workflows por FSM versionada con límites de reentrada.

**Invariante:** El LLM propone el grafo, el runtime decide transiciones y efectos.. **Dependencias:** MKT-C18. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/journeys.ts`.
- DTO/validación: `packages/contracts/src/19.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/19.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/019.test.ts` y fixtures `tests/fixtures/019/`.
- Evidencia: `docs/evidence/c19/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/journeys/`, `packages/campaign-state/`, `tests/journey-fsm.test.ts`.

## Patchsets y aceptación por tarea
### 019.01 — MKT-C19-T01
**Acción:** Definir steps/guards/actions nominadas, versiones y validación DAG/ciclos permitidos.

**Archivo primario:** `packages/domain/src/journeys.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No step HTTP/SQL/shell arbitrario.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 019.02 — MKT-C19-T02
**Acción:** Definir enrollment, ventanas, timezone y propósito por paso.

**Archivo primario:** `packages/domain/src/journeys.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Evento recibido no concede permiso de contacto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C19-T01.

### 019.03 — MKT-C19-T03
**Acción:** Implementar simulación local sin IO remoto o envío.

**Archivo primario:** `packages/domain/src/journeys.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Preview de journey no activa cron/provider.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C19-T02.

### 019.04 — MKT-C19-T04
**Acción:** Persistir run/step/subject/iteration con CAS e idempotencia.

**Archivo primario:** `packages/domain/src/journeys.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Replay/reentrada no duplican paso efectuado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C19-T03.

### 019.05 — MKT-C19-T05
**Acción:** Revalidar mandato, policy, elegibilidad y caps en cada paso.

**Archivo primario:** `packages/domain/src/journeys.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Permiso inicial no vale indefinidamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C19-T04.

### 019.06 — MKT-C19-T06
**Acción:** Definir pausa/cancel/timeout/handoff y estado de mensajes en vuelo.

**Archivo primario:** `packages/domain/src/journeys.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Pause requested no se anuncia como recall completado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C19-T05.

### 019.07 — MKT-C19-T07
**Acción:** Probar DST, reinicio, cambios de versión y ramas concurrentes.

**Archivo primario:** `packages/domain/src/journeys.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Historia original y nueva revisión se conservan sin efectos extra.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C19-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C19-G01 / NOT_EXECUTED:** Ciclo de nurture sin máximo de pasos/reentrada se rechaza.
- **MKT-C19-G02 / NOT_EXECUTED:** Baja en paso2 cancela siguientes efectos aunque run siga almacenado.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
