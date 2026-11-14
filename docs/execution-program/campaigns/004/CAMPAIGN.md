# MKT-C04 · Twins y nomenclatura de procedencia

**PROGRAMA PREVIO · NOT_STARTED · 4/42.** [Campaña original](../../campaigns/04-twins-y-nomenclatura-de-procedencia.md).

## Objetivo y contrato
Vincular ejecución local al agente canónico y preservar delegación/linaje.

**Invariante:** Persona, rol, runtime y mandato no son identidades intercambiables.. **Dependencias:** MKT-C03. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/agents/src/twin-binding.ts`.
- DTO/validación: `packages/contracts/src/04.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/04.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/004.test.ts` y fixtures `tests/fixtures/004/`.
- Evidencia: `docs/evidence/c04/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/domain/twin-binding.ts`, `docs/native-lineage-map.md`, `tests/twins.test.ts`.

## Patchsets y aceptación por tarea
### 004.01 — MKT-C04-T01
**Acción:** Mapear Actor.kind/id/tenantId y roleId/runtimeId/personaId/kernelTurnId según tipo.

**Archivo primario:** `packages/agents/src/twin-binding.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** AgentActor.id conserva runtimeId sin nuevo canonicalAgentId supuesto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 004.02 — MKT-C04-T02
**Acción:** Definir TwinBinding como DTO nuevo versionado del servicio.

**Archivo primario:** `packages/agents/src/twin-binding.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Referencias canónicas, instancia local y configuración recuperables.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C04-T01.

### 004.03 — MKT-C04-T03
**Acción:** Definir mandato entre tenant de origen y targetTenantId.

**Archivo primario:** `packages/agents/src/twin-binding.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No reescribir Actor.tenantId para simular membresía del cliente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C04-T02.

### 004.04 — MKT-C04-T04
**Acción:** Aplicar capability/resource/purpose/budget/expiry/revocación al twin.

**Archivo primario:** `packages/agents/src/twin-binding.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Caducar mandato bloquea efectos y conserva historial.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C04-T03.

### 004.05 — MKT-C04-T05
**Acción:** Preservar provenance.source/actor/updatedAt/confidence y extensiones explícitas.

**Archivo primario:** `packages/agents/src/twin-binding.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Modelo no fabrica evidencia ni atribuye su texto al humano.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C04-T04.

### 004.06 — MKT-C04-T06
**Acción:** Vincular assignedBy/assignedTo, requestId, tareas, artefactos y causalidad.

**Archivo primario:** `packages/agents/src/twin-binding.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Delegante/ejecutor y fuente original reconstruibles.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C04-T05.

### 004.07 — MKT-C04-T07
**Acción:** Probar revisión canónica obsoleta y separación de memorias por cliente.

**Archivo primario:** `packages/agents/src/twin-binding.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Misma persona no comparte contexto privado entre tenants.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C04-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C04-G01 / NOT_EXECUTED:** Twin con nombre marketing pero sin capability no prepara envío autorizado.
- **MKT-C04-G02 / NOT_EXECUTED:** Sesión AV mantiene mandato vencido: PEP bloquea efectos nuevos.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/authority.ts
Tests ejecutados: 26 en `tests/campaigns/c01-c10.test.ts` (`npx vitest run tests/campaigns/c01-c10.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C04-G01 / PASS:** Twin con nombre marketing pero sin capability no prepara envío autorizado.
- **MKT-C04-G02 / PASS:** Sesión AV mantiene mandato vencido: PEP bloquea efectos nuevos.

Desviaciones y ajustes de diseño: El registro de twins vive en memoria; la persistencia Postgres del twin no se ejecutó.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Migrar el registro a tabla con FK al SHA canónico y prueba de revocación.
