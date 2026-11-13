# Código padre observado y mapeo

Main cotejado en54b8d5407a8576459448c4d059a877297d18ca7a. [parent-source-map.json](../research/parent-source-map.json) conserva rutas/blob/alcance y distingue lectura heredada de turnos anteriores de nuevas lecturas de marketing. No auditoría integral, tests del padre ni modificación de archivos/configuración allí.

| Código | Hecho observado | Regla para el middleware |
|---|---|---|
| domain/actor.ts y auth/JWT | Tipos Actor y claims Supabase; roles/runtime | Mapping exacto, permiso desde principal verificado |
| tenant-principal/scope/db-tenant | Contexto y almacenamiento tenant-scoped, compatibilidad legacy | No copiar fallbacks como autorización del nuevo SaaS |
| domain/business.ts | provenance source/actor/updatedAt/confidence?, schemaVersion/version | Mantener semántica y versionado; confidence no es prueba |
| domain/agent.ts | assignedBy/To, evidence, artifactIds, requestId/parentTaskId/outcome | Conservar delegante/ejecutor y enlaces de tarea |
| engine/events/types.ts | SystemEvent schemaVersion string1.0, emittedAt, owner y source | Bridge probado; no enviar envelope nuevo como si ya fuera nativo |
| engine/leads.ts | LeadCandidate/LeadFicha, leadRef por tenant/placeId, origen y seguimiento/supresiones | Buscar no crea ficha; aceptar no concede consentimiento de marketing |
| leads-routes.ts | discover read-only; accept explícito, tenant scope y almacenamiento aislado | No lanzar captación o secuencias al leer candidatos |
| routes/analytics.ts | Overview de datos guardados con scanByPrefix y límites de consulta | No llamarlo motor de atribución/MMM; preservar cobertura/definiciones |
| integrations/resend.ts y meta-whatsapp.ts | Clientes reales de salida con resultados inciertos; no configuración comprobada | Autoridad única por envío; no retry ciego entre padre/backend |
| stubs/social.ts | Puerto social que no acredita proveedor conectado | Contrato pendiente; no presumir redes instalado |
| clientes/default/personas/marketing/persona.json | Plantilla de persona marketing | Binding/revisión explícitos, no prueba de twin vivo |

Nuevas lecturas incluyen primeros180 renglones de leads/analytics y plantilla de marketing. El resto del mapa contiene lecturas selectivas previas por el mismo SHA. No reproducir nombres/memorias/configuración privada de personas como datos de clientes de este repo público.

## Nomenclatura y linaje

Owner del host no se iguala automáticamente con tenantId, sub o actorId. Resolver por contrato de servidor. LeadFicha.ref/placeId/source no se sustituye por dominio de web; negocios con mismo dominio pueden ser distintos. Conservar source.provider/placeId/query/discoveredAt y acceptedAt/acceptedBy cuando se proyecte ese tipo, respetando licencia/custodia del dato. No renombrar esos campos nativos para que parezcan audience/contact consent.

Relationship/audience/campaign tienen IDs nuevos del servicio y mapping explícito a objetos externos. `requestId` no es obligatoriamente correlationId; conservar ambos y causalidad. Provenance nativa sigue `{source, actor, updatedAt, confidence?}`; extensiones nuevas incluyen sourceObjectRef/hash, mapperVersion, observedAt, evidenceRefs y revisión. Nunca atribuir al actor humano un borrador LLM como si lo hubiera afirmado directamente.

Eventos del middleware `marketing.*` son propuesta de dominio. El padre declara lead.created, opportunity.created, sales.activity.logged, post.* y otros tipos; no agregar un enum allí en esta tarea. Un bridge futuro puede mapear hechos confirmados a tipos existentes con schemaVersion1.0/emittedAt/owner/source.kind permitido. No emitir lead.created por mostrar un candidato ni ventas por un clic. Dedup y ACK de outbox/inbox/receipt conservan domainEventId.

## Integración sin escritura en el padre

SDK servidor/Hono/tools y puertos de approvals/budget/task/event se implementarán en este repo cuando se autorice código. El patch de wiring para agente será documentación propuesta. Si no existe servicio host real, registrar HOST_BRIDGE_NOT_VERIFIED y usar fixtures claramente marcados. No crear otro runtime empresarial o una aprobación ficticia para ocultar la ausencia del bridge. Cualquier cambio a claims, enums, rutas o configuración del padre requiere otro encargo explícito.
