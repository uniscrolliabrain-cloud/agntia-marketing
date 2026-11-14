# MKT-C08 · Registro, OAuth, secretos y discovery

**PROGRAMA PREVIO · NOT_STARTED · 8/42.** [Campaña original](../../campaigns/08-registro-oauth-secretos-y-discovery.md).

## Objetivo y contrato
Conectar solo endpoints/admin y capacidades comprobadas por despliegue.

**Invariante:** El modelo no elige URL, token, cuenta o método remoto.. **Dependencias:** MKT-C07. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/providers/src/registry.ts`.
- DTO/validación: `packages/contracts/src/08.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/08.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/008.test.ts` y fixtures `tests/fixtures/008/`.
- Evidencia: `docs/evidence/c08/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/integrations/registry/`, `packages/secrets/`, `tests/discovery-egress.test.ts`.

## Patchsets y aceptación por tarea
### 008.01 — MKT-C08-T01
**Acción:** Crear conexiones tenant-scoped con endpointRef/secretRef y bindings.

**Archivo primario:** `packages/providers/src/registry.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No URL libre del owner final o del LLM.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 008.02 — MKT-C08-T02
**Acción:** Aplicar TLS/host/puerto allowlist, DNS/IP y bloqueo de redirects.

**Archivo primario:** `packages/providers/src/registry.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Metadata/private no aprobado/credenciales en URL se rechazan.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C08-T01.

### 008.03 — MKT-C08-T03
**Acción:** Implementar OAuth state/PKCE y callback ligado a tenant/proyecto.

**Archivo primario:** `packages/providers/src/registry.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** SesiónB no conecta credencial aA.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C08-T02.

### 008.04 — MKT-C08-T04
**Acción:** Usar cuenta bot de mínimo privilegio y rotación sin perder links.

**Archivo primario:** `packages/providers/src/registry.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Permiso faltante no hace fallback admin.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C08-T03.

### 008.05 — MKT-C08-T05
**Acción:** Descubrir versión/edición/schema/campos y capacidades por operación.

**Archivo primario:** `packages/providers/src/registry.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** 200 con HTML o schema erróneo no cuenta como healthy.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C08-T04.

### 008.06 — MKT-C08-T06
**Acción:** Guardar CapabilityReport con evidencia, expiry y causa sanitizada.

**Archivo primario:** `packages/providers/src/registry.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Unknown/forbidden/not_configured deshabilitan operación.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C08-T05.

### 008.07 — MKT-C08-T07
**Acción:** Probar tamaño/timeout/errores y centinelas secretos.

**Archivo primario:** `packages/providers/src/registry.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Token/DSN/PII no salen en logs, eventos o frontend.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C08-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C08-G01 / NOT_EXECUTED:** ConexiónA usa site/accountB válido: binding bloquea antes de leer.
- **MKT-C08-G02 / NOT_EXECUTED:** Cambio de edición/rol invalida report de capacidad antes del write.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
