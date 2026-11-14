# MKT-C40 · Evaluación de agentes y vertical E2E

**PROGRAMA PREVIO · NOT_STARTED · 40/42.** [Campaña original](../../campaigns/40-evaluacion-de-agentes-y-vertical-e2e.md).

## Objetivo y contrato
Verificar trayectoria, datos, efectos y medición con fixtures reproducibles.

**Invariante:** Texto convincente o mock verde no compensan efecto incorrecto o conector sin probar.. **Dependencias:** MKT-C39. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `tests/e2e/marketing-vertical.test.ts`.
- DTO/validación: `packages/contracts/src/40.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/40.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/040.test.ts` y fixtures `tests/fixtures/040/`.
- Evidencia: `docs/evidence/c40/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `tests/e2e/`, `tests/evals/`, `docs/e2e-evidence.md`.

## Patchsets y aceptación por tarea
### 040.01 — MKT-C40-T01
**Acción:** Crear fixtures propios A/B/P y dataset con endogeneidad/efecto conocido.

**Archivo primario:** `tests/e2e/marketing-vertical.test.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin datos reales ni material sin licencia incorporado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 040.02 — MKT-C40-T02
**Acción:** Ejecutar E2E A–I, reseteando entorno y seeds por caso.

**Archivo primario:** `tests/e2e/marketing-vertical.test.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Estado inicial/final y protected state registrados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C40-T01.

### 040.03 — MKT-C40-T03
**Acción:** Combinar assertions deterministas de tools/estado con juez de lenguaje.

**Archivo primario:** `tests/e2e/marketing-vertical.test.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No dar PASS a cifra falsa por tono profesional.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C40-T02.

### 040.04 — MKT-C40-T04
**Acción:** Repetir ES/EN/FR y cambios concurrentes de audiencia/policy/claims.

**Archivo primario:** `tests/e2e/marketing-vertical.test.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No extrapolar un idioma o configuración al resto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C40-T03.

### 040.05 — MKT-C40-T05
**Acción:** Inyectar caída DB/proveedor/worker y revocación en cola.

**Archivo primario:** `tests/e2e/marketing-vertical.test.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin doble envío, pérdida de audit o permiso residual.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C40-T04.

### 040.06 — MKT-C40-T06
**Acción:** Medir calidad/coste/latencia/cobertura y conclusiones causales falsas.

**Archivo primario:** `tests/e2e/marketing-vertical.test.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Resultados con métodos/versions; sin scores de autores heredados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C40-T05.

### 040.07 — MKT-C40-T07
**Acción:** Distinguir real/sandbox/fake y publicar matriz de capacidades.

**Archivo primario:** `tests/e2e/marketing-vertical.test.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Conector sin laboratorio NOT_VERIFIED y disabled, no producto completo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C40-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C40-G01 / NOT_EXECUTED:** Buen fit MMM con recuperación causal mala no pasa gate científico.
- **MKT-C40-G02 / NOT_EXECUTED:** Respuesta final correcta con acción prohibida intermedia falla la evaluación.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
