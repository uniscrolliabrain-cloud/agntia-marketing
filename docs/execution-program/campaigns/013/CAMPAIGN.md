# MKT-C13 · Listmonk y newsletters como alternativa

**PROGRAMA PREVIO · NOT_STARTED · 13/42.** [Campaña original](../../campaigns/13-listmonk-y-newsletters-como-alternativa.md).

## Objetivo y contrato
Adaptar listas/campañas con aislamiento y pruebas de efecto.

**Invariante:** Endpoint test envía realmente; listas/permisos no prueban tenancy por sí solos.. **Dependencias:** MKT-C12. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/listmonk.ts`.
- DTO/validación: `packages/contracts/src/13.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/13.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/013.test.ts` y fixtures `tests/fixtures/013/`.
- Evidencia: `docs/evidence/c13/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/adapters/listmonk/`, `docs/adapters/listmonk.md`, `tests/integration/listmonk.test.ts`.

## Patchsets y aceptación por tarea
### 013.01 — MKT-C13-T01
**Acción:** Fijar versión/licencia e instancia/DB por tenant inicialmente si hace falta.

**Archivo primario:** `packages/adapters/src/listmonk.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Aislamiento demostrado con roles usados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 013.02 — MKT-C13-T02
**Acción:** Descubrir lectura/campos/permisos de listas/subscribers/campaigns.

**Archivo primario:** `packages/adapters/src/listmonk.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Usuario limitado no ve listas ajenas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C13-T01.

### 013.03 — MKT-C13-T03
**Acción:** Mapear estado/datos/identidad y no publicar archive automáticamente.

**Archivo primario:** `packages/adapters/src/listmonk.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Archivo web se trata como efecto independiente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C13-T02.

### 013.04 — MKT-C13-T04
**Acción:** Implementar preview local y draft remoto explícito en laboratorio.

**Archivo primario:** `packages/adapters/src/listmonk.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Test endpoint no se llama como previsualización.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C13-T03.

### 013.05 — MKT-C13-T05
**Acción:** Congelar destinatarios máximos y reconciliar supresiones frescas.

**Archivo primario:** `packages/adapters/src/listmonk.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Lista dinámica no amplía aprobados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C13-T04.

### 013.06 — MKT-C13-T06
**Acción:** Crear writeback controlado con ledger y búsqueda/reconciliación verificadas.

**Archivo primario:** `packages/adapters/src/listmonk.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cambiar status no se reintenta a ciegas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C13-T05.

### 013.07 — MKT-C13-T07
**Acción:** Probar envíos solo a sink/allowlist y pausa/cancel/replay.

**Archivo primario:** `packages/adapters/src/listmonk.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Historial distingue aceptado, enviado e incierto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C13-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C13-G01 / NOT_EXECUTED:** Tool intenta POST campaign/test a email libre: denegado por policy.
- **MKT-C13-G02 / NOT_EXECUTED:** Publicar archive con datos personales no sucede al crear newsletter.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
