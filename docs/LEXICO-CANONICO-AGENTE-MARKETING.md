# Léxico canónico de código — AgntiaPro ↔ Marketing

**v0.1 | 2026-11-13 | DRAFT; auditoría parcial del padre.** Este documento es lectura obligatoria para Freebuff, Codex y arquitecto. No inventar semántica a partir de palabras de marketing. El código observado del padre prevalece sobre los documentos antiguos; fijar SHA y confirmar firmas antes de implementar.

## Convenciones vinculantes
- `tenantId`: identificador opaco de empresa; nunca es igual por suposición a `owner`, `sub`, `userId`, `actorId` o `projectId`.
- `owner`: clave/propietario utilizado en interfaces del padre; no convertir automáticamente en principal humano.
- `Actor`: unión discriminada `kind: human | agent`, esquema Zod en `packages/domain/src/actor.ts`.
- `HumanActor`: `id`, `tenantId`, `userId`, `roles`, `profile`, `active`.
- `AgentActor`: `id=runtimeId`, `tenantId`, `roleId`, `personaId?`, `runtimeId`, `kernelTurnId?`, `roles`, `profile`, `active`. La función `agentActor(input)` usa `runtimeId ?? actorId` como fallback: no asumir que runtime efímero siempre existe.
- `AgentRole`: rol funcional, no identidad humana ni permiso absoluto.
- `AgentPersona`: perfil/persona, no runtime ejecutor ni permiso.
- `PersonaRegistry`: caché por tenant/persona; `canStartWork(tenantId, personaId, {owner,sopId?})` aplica activación, humano asignado y SOP permitida. La autorización final necesita también policy y membership.
- `TenantService`: resuelve tenant, membership y suspensión. `tenantIdFor(owner)` no sustituye `findMembership(userId,tenantId)` para autorización fresca.
- `TenantScopedStore`: aislamiento de claves de Store; no reemplaza pruebas RLS ni autorización HTTP.
- `currentTenantScope`/`runInTenantScope`: contexto request-scoped, no fuente independiente de privilegios.
- `SOP`: procedimiento autorizado, pasos durables; no equivale a prompt ni job genérico.
- `Task`: unidad de trabajo empresarial canónica; no confundir con job técnico.
- `ActionProposal`: propuesta de efecto; el adapter de approvals reconoce `awaiting_review`, `scheduled`, `executing`, `succeeded`, `failed`, `outcome_unknown`, `denied`, `cancelled`, `expired`. No inventar `approved` como estado nativo sin revisar contrato.
- `Assignment`: abstracción de asignación; `ApprovalAssignment` es proyección y el adapter actual `applyAssignment` devuelve el record sin mutar.
- `SystemEvent`: evento canónico del padre, verificar tipo, `schemaVersion`, `emittedAt`, `owner`, `source` y correlación en el schema real antes de bridge.
- `requestId`, `correlationId`, `causationId`, `idempotencyKey`: cuatro conceptos distintos. No renombrar por comodidad.
- `outcome_unknown`: resultado remoto ambiguo; reconciliar antes de reintentar.
- `LeadCandidate` y `LeadFicha`: descubrimiento y aceptación comercial; **no** contacto autorizado para email.
- `MarketingWorkOrder`, `TwinBinding`, `CampaignBrief`, `AudienceSnapshot`, `OutboundIntent`, `EffectReceipt`, `MeasurementClaim`: **nombres propuestos en Marketing**, no contratos existentes del padre.

## Reglas de nomenclatura
1. `*Id` identifica; `*Ref` apunta a recurso externo; `*Version` es versión de contrato o entidad; `*Hash` liga contenido inmutable; `*At` es timestamp ISO UTC. Evitar nombres ambiguos como `ownerId` sin contexto.
2. Preferir tipos discriminados Zod en fronteras, y tipos inferidos. No duplicar schemas de padre en Marketing sin versión de adaptación.
3. Sufijos: `Proposal` no ejecuta; `Intent` solicita efecto; `Attempt` representa intento; `Receipt` prueba respuesta; `Observation` no demuestra causalidad; `Decision` indica resolución de política.
4. Nombres de APIs/eventos externos se versionan y mapean; nunca cambiar enum del padre desde Marketing sin PR independiente.
5. `approved`, `sent`, `delivered`, `converted` y `attributed` nunca son sinónimos.
6. `tenantId` de origen y tenant objetivo se guardan por separado en mandatos cross-service.
7. Si un término del padre no está verificado, usar etiqueta `PROPOSED`/`UNVERIFIED` y crear tarea de comprobación antes de escribir código.
8. Los nombres de ficheros aquí no acreditan que todos existan en el SHA futuro.

## Matriz de fuentes
| Concepto | Fuente del padre | Evidencia |
|---|---|---|
| Actor | `packages/domain/src/actor.ts` | Código leído |
| Persona y activación | `apps/server/src/engine/agents/personas/registry.ts` | Código leído |
| Tenancy | `apps/server/src/engine/tenant.ts`, `apps/server/src/app.ts` | Lectura parcial |
| Approval | `apps/server/src/engine/assignments/adapters/approval-adapter.ts` | Código leído |
| Event bus | `apps/server/src/engine/events/types.ts` | Mapeo documental existente; confirmar código |
| SOP/Task | `apps/server/src/engine/sop-executor.ts`, `engine/service.ts` | Auditoría pendiente |
| RLS/Auth | `apps/server/src/db-rls.ts`, `tenant-principal.ts` | Auditoría pendiente |

## Antipatrones prohibidos
`tenantId = userId`; `personaId = runtimeId`; `LLM response = authorization`; `proposal = execution`; `timeout = failure safe to retry`; `lead = opted-in contact`; `open = human engagement`; `click = sale`; `README = tested implementation`.

## Checklist del revisor semántico
Comprobar cada DTO, enum, ruta y evento contra SHA fijo; listar divergencias, adaptadores y tests de compatibilidad. Un contrato sin evidencia se bloquea o se etiqueta propuesto. Actualizar léxico tras cambios del padre, conservando changelog y decisiones ADR.
