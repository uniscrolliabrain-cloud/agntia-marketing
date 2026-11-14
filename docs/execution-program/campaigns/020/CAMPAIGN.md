# MKT-C20 · Preview y aprobación vinculada

**PROGRAMA PREVIO · NOT_STARTED · 20/42.** [Campaña original](../../campaigns/20-preview-y-aprobacion-vinculada.md).

## Objetivo y contrato
Congelar contenido, propósito, audiencia y coste antes del efecto.

**Invariante:** Proponente/twin no puede aprobarse ni ampliar el alcance autorizado.. **Dependencias:** MKT-C19. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/policy/src/approvals.ts`.
- DTO/validación: `packages/contracts/src/20.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/20.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/020.test.ts` y fixtures `tests/fixtures/020/`.
- Evidencia: `docs/evidence/c20/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/approvals/`, `packages/campaign-preview/`, `tests/approval-binding.test.ts`.

## Patchsets y aceptación por tarea
### 020.01 — MKT-C20-T01
**Acción:** Crear preview puro de payload/render/assets/links/variantes.

**Archivo primario:** `packages/policy/src/approvals.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin test-send/upload/cron/mutation remota.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 020.02 — MKT-C20-T02
**Acción:** Canonicalizar hashes de contenido, audienceMax, rights, claims y policy.

**Archivo primario:** `packages/policy/src/approvals.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cambio material invalida binding aunque campaignId sea igual.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C20-T01.

### 020.03 — MKT-C20-T03
**Acción:** Vincular approval a revisor humano verificado y tenant/proyecto.

**Archivo primario:** `packages/policy/src/approvals.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Nombre/voz/JSON approved no prueban autorización.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C20-T02.

### 020.04 — MKT-C20-T04
**Acción:** Agregar expiry, expectedVersion, purpose/channel y costCeiling.

**Archivo primario:** `packages/policy/src/approvals.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Approval genérica no autoriza otro canal/cuenta.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C20-T03.

### 020.05 — MKT-C20-T05
**Acción:** Integrar puerto local/host de aprobación con verificación de prueba.

**Archivo primario:** `packages/policy/src/approvals.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Si host no existe, no inventar approval ni editar padre.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C20-T04.

### 020.06 — MKT-C20-T06
**Acción:** Implementar commit con key/hash y revalidación de bajas.

**Archivo primario:** `packages/policy/src/approvals.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Repetición igual devuelve estado; nuevo payload da409.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C20-T05.

### 020.07 — MKT-C20-T07
**Acción:** Probar doble click, sesión expirada, voz y retirada.

**Archivo primario:** `packages/policy/src/approvals.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Aprobación sensible se confirma en UI autenticada del piloto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C20-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C20-G01 / NOT_EXECUTED:** ApprovalA con texto igual intenta usar audienciaB: scope/hash bloquean.
- **MKT-C20-G02 / NOT_EXECUTED:** Cambiar targeting, precio o creativo tras aprobar exige otra revisión.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/authority.ts
Tests ejecutados: 20 en `tests/campaigns/c11-c20.test.ts` (`npx vitest run tests/campaigns/c11-c20.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C20-G01 / PASS:** ApprovalA con texto igual intenta usar audienciaB: scope/hash bloquean.
- **MKT-C20-G02 / PASS:** Cambiar targeting, precio o creativo tras aprobar exige otra revisión.

Desviaciones y ajustes de diseño: La aprobación liga revisión, audiencia, finalidad, canal, coste y caducidad; no hay firma criptográfica del aprobador.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Añadir prueba criptográfica de aprobación si el compliance lo exige.
