# Auditoría integral de Agntia Branding y plan de sus 42 campañas

**Repositorio:** [uniscrolliabrain-cloud/agntia-branding](https://github.com/uniscrolliabrain-cloud/agntia-branding/tree/57f30db99ad84643be1e4f62c600c35356a603fe)  
**Referencia revisada:** `57f30db99ad84643be1e4f62c600c35356a603fe` · **Fecha:** 13-11-2026  
**Naturaleza:** auditoría documental y guía para implementación futura; no certifica derechos, calidad de marca ni seguridad.

## 1. Resumen para el propietario

Agntia Branding se plantea como un SaaS especializado que transforma un brief en identidad verbal y visual, materiales editables, tokens y un brandbook. Se integra con `agente`, donde vive la identidad canónica; el servicio opera un twin bajo mandato y presta servicio también a clientes externos.

La arquitectura conceptual tiene una virtud importante: **un resultado bonito no equivale a un entregable válido**. El repositorio exige conservar el editable, fuentes de texto, versiones y derechos; relacionar los renders con el archivo de origen; y revisar riesgos como SVG ejecutable, tipografías sustituidas o claims fabricados. El modelo propone; la autorización, el cálculo y la revisión viven fuera del prompt.

El punto de partida es exclusivamente documental. El README declara que no hay app, SDK, proveedor conectado ni tests de producto, y que las **42 campañas son fases de implementación NOT_STARTED, con pruebas NOT_EXECUTED**. El plan contiene 294 tareas y 84 escenarios previstos, no pruebas ejecutadas. Una campaña de ingeniería no es una campaña publicitaria ni una marca ya terminada.

**Mi recomendación:** no construir un editor universal ni conectar todas las herramientas a la vez. Priorizar un caso sintético: brief → fuente de investigación autorizada → concepto → documento vectorial editable → rights y texto revisados → aprobación humana → export sandbox → brandbook y manifiesto de hashes. Penpot, Fabric/SVG, Style Dictionary y otros adaptadores se evalúan por capacidad; no son todos requisitos simultáneos.

### Diagnóstico

| Área | Acierto del plan | Lo que falta demostrar |
|---|---|---|
| Estrategia y naming | Distingue propuesta, investigación y clearance preliminar. | Un nombre propuesto no está libre ni es registrable; revisión especializada y jurisdicciones siguen pendientes. |
| Derechos | AssetRights y FontLicense vinculan fuente, uso, caducidad y prueba. | Falta validar las licencias por activo, familia, medio y distribución; procedencia no es permiso. |
| Diseño editable | DesignDocument separado del render, con nodos y constraints. | Hay que elegir modelo canónico y probar edición, export, round-trip y conflictos. |
| Fidelidad | Texto, geometría, contraste, fuentes y pixel diff tienen criterios distintos. | El render reproducible depende del motor, versión, tipografía y entorno; no basta una imagen atractiva. |
| Seguridad | JWT/membership/ACL, SVG controlado y aprobación vinculada. | No hay controles ejecutados sobre proyectos, archivos, renderer, cachés o exports. |
| Integración | Se investigaron Penpot, Fabric, SVG-Edit y Style Dictionary. | README y SHA no prueban API, edición, ACL, licencia de dependencias ni runtime. |
| Operación | Estados, outbox, revisión y límites de coste están diseñados. | No hay restore, costes, latencia, SLAs o flujos de entrega medidos. |

## 2. Alcance, referencias y límites

Se revisaron el árbol remoto, README, instrucciones del repo, contratos, runtime, adaptadores, evaluación, handoff y extractos del manifest. Las 42 secciones se apoyan en el índice y nombres de los archivos, en contratos, escenarios de evaluación y los extractos accesibles del manifest. **La extracción del manifest se truncó; no se afirma una lectura exhaustiva de sus 294 tareas.** Cada agente deberá leer su ficha completa antes de implementarla.

Fuentes fijadas a la referencia revisada: [índice de campañas](https://github.com/uniscrolliabrain-cloud/agntia-branding/blob/57f30db99ad84643be1e4f62c600c35356a603fe/docs/campaigns/README.md) · [manifest](https://github.com/uniscrolliabrain-cloud/agntia-branding/blob/57f30db99ad84643be1e4f62c600c35356a603fe/docs/campaigns/campaign.json) · [contratos](https://github.com/uniscrolliabrain-cloud/agntia-branding/blob/57f30db99ad84643be1e4f62c600c35356a603fe/docs/contracts/01-contratos.md) · [evaluación](https://github.com/uniscrolliabrain-cloud/agntia-branding/blob/57f30db99ad84643be1e4f62c600c35356a603fe/docs/09-evaluacion.md) · [handoff](https://github.com/uniscrolliabrain-cloud/agntia-branding/blob/57f30db99ad84643be1e4f62c600c35356a603fe/docs/release/HANDOFF.md) · [fuentes y repos](https://github.com/uniscrolliabrain-cloud/agntia-branding/tree/57f30db99ad84643be1e4f62c600c35356a603fe/docs/research).

El padre figura en el mapa documental con SHA `54b8d5407a8576459448c4d059a877297d18ca7a`; no se ha auditado de nuevo ni ejecutado su suite. No se han instalado herramientas, consultado una cuenta Penpot ni realizado un dictamen sobre licencias, marcas o propiedad intelectual. Este informe está en el espacio de trabajo de la conversación, **no en el repo remoto de branding**; no se ha modificado ni publicado ningún repositorio externo.

## 3. Hallazgos priorizados

### P0 — Derechos y autorización antes de belleza

1. **Naming no es clearance.** Una búsqueda parcial debe mostrar fuente, clases, territorios, fecha y cobertura, con conflictos y revisión profesional pendiente. No llamar «disponible» o «exclusivo» a un nombre por no encontrar una coincidencia. Registrar una marca es un efecto fuera del piloto.
2. **Un moodboard no concede derechos.** Separar referencia visual, creación propia y activo que puede redistribuirse. Registrar titular, licencia, finalidad, territorio, duración, restricciones y prueba; una IA no certifica autoría o exclusividad. Si derechos faltan o se revocan, bloquear nuevos exports/publicaciones afectados.
3. **Fuentes tipográficas por familia y uso.** La licencia de Google Fonts no es una licencia única para todo el repo. Verificar embedding, subsetting, redistribución y versiones de cada familia. Ausencia de fuente no puede generar una sustitución silenciosa que cambie diseño o derechos.
4. **SVG y documentos son no confiables.** Sanitizar con allowlist de nodos/atributos; bloquear scripts, event handlers, referencias remotas y entradas peligrosas. Limitar XML, MIME, dimensiones, profundidad y recursos; aislar rendering y evitar SSRF/DNS/redirect y ejecución de contenido cargado. No aceptar shell/HTTP/DOM arbitrarios del modelo.
5. **Conservar editable y original.** Definir la fuente canónica por proyecto: documento estructurado local o backend elegido, nunca dos editores que se sobreescriben sin autoridad. Cada revisión requiere CAS/expectedVersion, diff y restauración; export PNG/PDF no demuestra que exista un editable íntegro.
6. **Aprobación humana vinculada al objeto.** Un `ApprovalBinding` debe ligar tenant, responsable humano, revisión, editable/render, texto, activos y rights, policy, destinatario, alcance, coste y expiración. Un cambio material de logo, fuente, texto o derechos invalida el uso afectado. Una confirmación de voz o la propia IA no aprueban.
7. **Aislamiento extremo a extremo.** Verificar JWT Supabase (firma, issuer, audience y tiempos), membership y ACL de proyecto/recurso/campo en servidor. Aplicar scopes a DB/RLS, workers, archivos, URLs firmadas, caché, vectores, Realtime y export. `service_role` no prueba que se aplique RLS. Un nombre de workspace o avatar no concede permiso.

### P1 — Entregable útil y reproducible

- Versionar `DesignDocument` como árbol de nodos, constraints, fuentes de texto y referencias a recursos. Definir representación de geometría, unidades y orden de lectura; evitar que el texto exista solo en una imagen.
- Registrar motor y versión, configuración, fuentes y hashes para reproducir un render. El resultado reproducible debe probarse en un entorno concretamente fijado: no prometer igualdad de píxeles en cualquier sistema. Si es necesaria tolerancia, declararla y comprobar también texto/estructura.
- Separar QA geométrica, texto/idioma, derechos, accesibilidad y revisión visual. OCR o juez de visión son señales, no prueba suficiente de exactitud, accesibilidad, propiedad o aceptación humana.
- El `ExportManifest` debe ligar revisión aprobada, editable, recursos, versiones, licencias, perfil de color, dimensiones y hashes. Un archivo fuente ausente o licencia de embedding insuficiente bloquea la entrega aplicable.
- Crear un catálogo de estados `missing`, `stale`, `conflict`, `unverified`, `unsupported`; no rellenar con hipótesis del modelo para obtener un brandbook completo.
- Elegir un solo flujo de edición inicial y una sola vía de export controlada. Un adaptador opcional no verificado permanece deshabilitado aunque su fase haya sido analizada.

### P2 — Escala y servicios hermanos

El trabajo con marketing/redes requiere un `AuthorityMap`: quién custodia el original, quién recibe qué licencia, quién revisa un claim y qué servicio publica. Un evento emitido no es ACK; un brief aceptado no autoriza publicación, compra de tipografía o despliegue. La rota empresarial sigue en el padre; no se crea otro scheduler de empleados.

Los sobres de 30/70/300 € mencionados en la familia del proyecto son hipótesis, no precios ni volúmenes garantizados. Medir rendering, almacenamiento, licencias, inferencia, AV y revisión humana antes de ofertar. No mover archivos privados a un proveedor no aprobado por ser más barato.

## 4. Arquitectura y boilerplate previstos

El repo propone TypeScript/Hono/pnpm, Postgres/Supabase, workers/outbox y adaptadores. No existe todavía lockfile ni implementación en la referencia revisada. Los siguientes nombres de archivos son **propuestas de esta auditoría, no archivos existentes ni un mandato de crearlos todos**. Las fichas proponen por fase `docs/implementation/cNN/README.md`, `EVIDENCE.md`, `TESTS.md` y `RISKS.md`.

```text
apps/api/src/               # rutas nominadas y PEP
apps/worker/src/            # revalidación, intent y reconciliación
apps/portal/                # revisión por rol, si se autoriza su implementación
packages/contracts/src/     # DTO, schemas, errores, versiones
packages/auth/src/          # JWT, membership, scopes y mandato
packages/domain/src/        # BrandBrief, DesignDocument, FSM, AuthorityMap
packages/rights/src/        # AssetRights, FontLicense y vigencia
packages/design/src/        # nodos, constraints, diff, CAS y texto fuente
packages/render/src/        # motor/configuración/versión y manifest de render
packages/tokens/src/        # tipos, aliases y validación DAG
packages/qa/src/            # texto, geometría, contraste, evidencia
packages/export/src/        # preflight y ExportManifest
packages/adapters/          # Penpot, canvas/tokens solo si se seleccionan
packages/jobs/              # inbox/outbox, idempotencia y outcome_unknown
packages/sdk/ host-bridge/  # interfaz nominada y mapping al padre
migrations/                 # FKs, RLS, roles y versiones
 tests/security/ integration/ e2e/  # fixtures A/B/P y pruebas autorizadas
```

Reglas: contratos no importan adaptadores; dominio no decide identidad por JSON del LLM; PEP único para API, SDK, MCP y Anam; secretos fuera de código y modelos; un worker revalida mandato, scope, revisión, rights y presupuesto. `Actor.tenantId` de origen y targetTenant no se mezclan. Conservar `runtimeId`, `roleId`, `personaId?`, `kernelTurnId?`, provenance y delegante/ejecutor según el host; los DTO nuevos se declaran nuevos. Un bridge fake no es conexión instalada, y `SystemEvent` nativo `schemaVersion: "1.0"` no se modifica ni se inventan enums.

**Flujo futuro:** principal verificado → brief y fuentes → propuesta/modelo → documento editable versionado → preview local → QA/rights → revisión humana → intent local/outbox → export o entrega autorizada → receipt o incertidumbre → reporte y brandbook. Un preview no publica ni genera una escritura remota. Tras timeout de posible aceptación no se reintenta por otro proveedor ni se promete exactly-once HTTP; se reconcilia o bloquea.

## 5. Método de ejecución con agentes autónomos

Los roles de coordinador, arquitectura, implementador, seguridad, diseñador/revisor humano e integraciones son funciones de trabajo, no nuevos agentes canónicos. Un único escritor por contrato o migración y revisión independiente cuando esté disponible. El coordinador no puede aprobarse, modificar `agente`, gastar o afirmar PASS sin evidencia.

En cada fase: (1) leer instrucciones, ficha completa y manifest al SHA fijado; (2) comprobar gate anterior y autorización; (3) enumerar diff y archivos nuevos con motivo; (4) construir bajo deny-by-default y fixtures A/B/P; (5) ejecutar pruebas pertinentes con versión/entorno/estado y exit; (6) revisar derechos, QA y aislamiento; (7) registrar `PASS`, `BLOCKED`, `NOT_VERIFIED` o `NOT_STARTED`, y capacidades apagadas. Sin Docker, red, cuenta o licencia no se fuerza PASS con una demo ajena o mock.

**Checkpoints:** C05/C10/C15/C20/C25/C30/C35/C40/C42. Cada informe recoge SHA/diff/PR si existe, fases y capacidades, comandos realmente ejecutados/pasados/fallidos/omitidos, fixtures, motor y fuentes, evidencia y receipts sanitizados, costes medidos o desconocidos, riesgos y siguiente gate.

**Tensión de secuencia:** Penpot C18, Fabric/SVG C19 y Style Dictionary C23 aparecen en la secuencia, pero el handoff indica elegir un camino y no instalar todo. Registrar selección y estado no verificado, mantener cada capacidad opcional apagada y pedir una decisión explícita del gate antes de continuar por dependencias afectadas. Si hace falta cambiar la dependencia formal, proponer ADR y cambio del manifest en una tarea autorizada; nunca declarar PASS a un proveedor omitido.

## 6. Guía fase por fase

Las fichas originales contienen las tareas y gates oficiales; los archivos específicos de código citados aquí son propuestas. Todos los escenarios mencionados son **pruebas futuras**, no resultados de esta auditoría.

### BRD-C01 — Baseline, fuentes y alcance

Congelar SHA propio/padre, instrucciones, fuentes, licencias y perímetro; registrar entorno y discrepancias del catálogo sin suponer runtimes activos. **Archivos:** `docs/implementation/c01/` y, si hace falta, `docs/baseline.md`. **Gate:** si cambia el padre, volver a cotejar contratos; ausencia de herramientas queda NOT_VERIFIED. No modificar `agente`.

### BRD-C02 — Autoridad por dominio y contrato SaaS

Definir operador P, tenants A/B, marca, proyecto, custodios y un responsable por efecto; permitir solapamiento sin duplicar publicación o entrega. **Archivos propuestos:** `docs/authority-map.md`, `packages/domain/src/work-order.ts` y evidencia C02. **Gate:** dos servicios que reciben el mismo encargo no ejecutan dos veces y un colaborador no accede a otro proyecto.

### BRD-C03 — Supabase JWT y principal

Verificar firma/issuer/audience/exp/nbf y resolver membership, ACL y capacidades por servidor; no `user_metadata`, owner por defecto ni identidad elegida por LLM. **Archivos:** `packages/auth/src/`, `tests/security/jwt.test.ts`, evidencia C03. **Gate:** token A no revela recurso B; revocación impide el siguiente efecto en cola.

### BRD-C04 — Twins y nomenclatura canónica

Vincular runtime canónico y twin con mandato vigente, origen y target separados, preservando provenance y delegación. **Archivos:** `packages/domain/src/twin-binding.ts`, `tests/security/twin.test.ts`, evidencia C04. **Gate:** revisión obsoleta o mandato revocado bloquean un nuevo efecto; nombres/avatares no son permisos.

### BRD-C05 — DTOs, esquemas y errores

Definir IDs opacos, `EvidenceRef`, `DesignDocument`, revisions, rights, Money decimal y errores discriminados con límites y rechazo de campos extra. **Archivos:** `packages/contracts/src/`, `tests/contracts.test.ts`, evidencia C05. **Gate:** fechas inválidas, NaN y campos extra se rechazan; schema propio no sustituye SystemEvent `"1.0"`. **Checkpoint 5.**

### BRD-C06 — Persistencia, RLS y migraciones

Diseñar FKs/índices por tenant, ACL de proyecto/recurso, revisiones CAS y transacción local de estado/audit/outbox. **Archivos:** `migrations/`, `packages/storage/src/`, `tests/integration/storage.test.ts`, evidencia C06. **Gate:** una FK cross-tenant falla con roles API/worker reales y una caída no deja intent parcial.

### BRD-C07 — Mandatos, finalidad y aprobaciones

El preview congela revisión, derechos, destinatario, coste y alcance; un humano autorizado aprueba el contenido exacto. **Archivos:** `packages/domain/src/approval.ts`, `tests/approval-binding.test.ts`, evidencia C07. **Gate:** cambios materiales invalidan aprobación; proponente y avatar no se autoaprueban.

### BRD-C08 — Secretos, discovery y aislamiento remoto

Mantener conexiones por tenant/proyecto y `CapabilityReport` con versión, edición, rol y expiry. **Archivos:** `packages/integrations/src/`, `packages/secrets/`, `tests/security/egress.test.ts`, evidencia C08. **Gate:** credencial B no actúa bajo binding A; sin permiso no hay fallback admin, URL libre o scraping.

### BRD-C09 — Brief y estrategia

Registrar propósito, audiencia declarada, entregables, restricciones y criterio de aceptación con fuentes. **Archivos:** `packages/briefs/src/`, `tests/brand-brief.test.ts`, evidencia C09. **Gate:** un cambio de objetivo crea nueva revisión; no inferir preferencias sensibles ni hacer pasar hipótesis por hechos del cliente.

### BRD-C10 — Investigación de marca

Separar observaciones, inferencias y referencias visuales; guardar fuente, fecha, derechos y límites. **Archivos:** `packages/research/src/`, `tests/research-boundary.test.ts`, evidencia C10. **Gate:** un sitio competidor hostil no ordena exportar archivos ni autoriza copiar su identidad. **Checkpoint 10.**

### BRD-C11 — Naming y opciones

Proponer nombres con idioma, contexto, justificación e incertidumbre, incluyendo posibles conflictos lingüísticos para revisión. **Archivos:** `packages/naming/src/`, `tests/naming.test.ts`, evidencia C11. **Gate:** coincidencia o significado dudoso queda pendiente; el nombre sugerido no se anuncia legalmente disponible.

### BRD-C12 — Clearance preliminar

Registrar fuentes de registros, territorio, clase, fecha y cobertura; diferenciar búsqueda preliminar de dictamen legal. **Archivos:** `packages/clearance/src/`, `docs/clearance-boundary.md`, evidencia C12. **Gate:** consulta incompleta no produce «cleared universal»; no registrar ni prometer exclusividad.

### BRD-C13 — Identidad verbal

Versionar tono, léxico, reglas de locale y ejemplos con referencias a claims. **Archivos:** `packages/brand-policy/src/voice.ts`, `tests/verbal-identity.test.ts`, evidencia C13. **Gate:** traducción conserva límites, cifras y nombres; no se inventan testimonios o casos de éxito.

### BRD-C14 — Direcciones visuales

Proponer conceptos y razonamiento sin confundir moodboard y activos redistribuibles. **Archivos:** `packages/design/src/concepts.ts`, `tests/concept-rights.test.ts`, evidencia C14. **Gate:** referencia de tercero no entra al paquete final sin derechos específicos; diseño generado no prueba originalidad jurídica.

### BRD-C15 — Ledger de activos y derechos

Guardar `assetHash`, titular, licencia, propósito, territorio, expiración y prueba para cada uso. **Archivos:** `packages/rights/src/asset-rights.ts`, `tests/rights-revocation.test.ts`, evidencia C15. **Gate:** revocar licencia bloquea nuevos exports/publicaciones sin borrar historia. **Checkpoint 15.**

### BRD-C16 — Tipografía y fuentes

Fijar hash de fuente, licencia de familia, embedding/subsetting y política de fallback por formato. **Archivos:** `packages/rights/src/font-license.ts`, `packages/render/src/fonts.ts`, evidencia C16. **Gate:** fuente ausente no se sustituye silenciosamente; licencia insuficiente bloquea embedding o requiere alternativa revisada.

### BRD-C17 — Documento vectorial

Definir nodos, constraints, texto fuente, revisiones y relación con render; conservar editable como artefacto principal de la opción elegida. **Archivos:** `packages/design/src/document.ts`, `patch.ts`, `tests/design-cas.test.ts`, evidencia C17. **Gate:** ediciones concurrentes producen conflicto CAS, sin pérdida de originales o sobrescritura silenciosa.

### BRD-C18 — Adaptador Penpot

Si se elige, verificar release, licencia, team/project/file binding, rol y operaciones reales en laboratorio. **Archivos:** `packages/adapters/penpot/src/`, `tests/integration/penpot.test.ts`, evidencia C18. **Gate:** archivo B no se abre con binding A aunque nombre coincida; sin cuenta/entorno real el adaptador queda NOT_VERIFIED.

### BRD-C19 — Canvas Fabric/SVG

Definir un schema de nodos y atributos seguros y aislar parsing/render. **Archivos:** `packages/design/src/safe-svg.ts`, `packages/adapters/canvas/`, `tests/security/svg.test.ts`, evidencia C19. **Gate:** scripts, event handlers y referencias o data URLs maliciosas se rechazan; no ejecutar XML/HTML arbitrarios.

### BRD-C20 — Logotipo y variantes

Versionar geometría, texto, tamaño mínimo y variantes con sus fuentes y derechos. **Archivos:** `packages/design/src/logo.ts`, `tests/logo-revisions.test.ts`, evidencia C20. **Gate:** edición posterior invalida el paquete aprobado afectado; semejanza o falta de conflicto no es garantía legal. **Checkpoint 20.**

### BRD-C21 — Paleta y accesibilidad

Modelar roles de color, espacio y pares de contraste con criterio explícito para el uso concreto. **Archivos:** `packages/qa/src/contrast.ts`, `tests/contrast.test.ts`, evidencia C21. **Gate:** texto pequeño con contraste insuficiente requiere revisión; una valoración visual del LLM no certifica accesibilidad integral.

### BRD-C22 — Design tokens

Crear un conjunto tipado, versionado y trazable de roles y aliases. **Archivos:** `packages/tokens/src/schema.ts`, `resolve.ts`, `tests/token-graph.test.ts`, evidencia C22. **Gate:** alias cíclicos o tipos inválidos no exportan; un cambio semántico muestra impacto sobre componentes dependientes.

### BRD-C23 — Style Dictionary

Si se selecciona, fijar versión de engine, inputHash, formatos y transformaciones allowlist. **Archivos:** `packages/adapters/style-dictionary/`, `tests/token-build.test.ts`, evidencia C23. **Gate:** build reproducible en entorno fijado sin secretos/red ni transformaciones arbitrarias del agente; licencia del engine no cubre assets.

### BRD-C24 — Plantillas y componentes

Definir slots editables, restricciones, nodos protegidos, locales y revisión de versión. **Archivos:** `packages/design/src/templates.ts`, `tests/template-constraints.test.ts`, evidencia C24. **Gate:** una variante no elimina mensajes obligatorios, restricciones o derechos; modificar un slot no autoriza publicar.

### BRD-C25 — Layouts responsive

Definir breakpoints, constraints, orden de lectura y reglas de overflow para variantes e idiomas. **Archivos:** `packages/design/src/layout.ts`, `tests/layout-overflow.test.ts`, evidencia C25. **Gate:** texto francés largo no se recorta sin aviso; una captura desktop no demuestra móvil ni accesibilidad. **Checkpoint 25.**

### BRD-C26 — Composición y edición

Aplicar patches nominados con operationKey, diff, expectedVersion y reversión que preserve historia. **Archivos:** `packages/design/src/compose.ts`, `tests/edit-replay.test.ts`, evidencia C26. **Gate:** doble edición no destruye el original; el modelo no recibe shell, DOM o URL arbitrarios.

### BRD-C27 — QA de texto

Comparar texto fuente aprobado y resultado renderizado, incluyendo nombres, números, caracteres e idioma. **Archivos:** `packages/qa/src/text.ts`, `tests/text-fidelity.test.ts`, evidencia C27. **Gate:** un nombre o cifra erróneos bloquean entrega; OCR es señal complementaria, no prueba única.

### BRD-C28 — QA visual y revisión

Combinar geometría, constraints, contraste y revisión humana con percepción automática limitada. **Archivos:** `packages/qa/src/visual.ts`, `packages/review/src/decision.ts`, evidencia C28. **Gate:** un diseño atractivo con texto incorrecto o rights faltantes falla; un juez de visión no otorga licencia o aceptación.

### BRD-C29 — Brandbook y reglas

Crear un snapshot de política, usos permitidos/prohibidos, activos aprobados y referencias de fuente. **Archivos:** `packages/brandbook/src/snapshot.ts`, `tests/brandbook-version.test.ts`, evidencia C29. **Gate:** regla obsoleta o recurso revocado no se presenta como vigente; aprobación comercial no concede publicación externa.

### BRD-C30 — Export y preflight

Vincular editableHash, renderHash, tipografías, recursos, perfil de color, dimensiones y versiones en `ExportManifest`. **Archivos:** `packages/export/src/preflight.ts`, `manifest.ts`, `tests/export-roundtrip.test.ts`, evidencia C30. **Gate:** editable faltante o fuente no embebible bloquea entrega aplicable; PNG/PDF no prueban fidelidad por sí solos. **Checkpoint 30.**

### BRD-C31 — Entrega y publicación

Separar preparar paquete, compartir con receptor y publicar/desplegar; cada efecto tiene scope y aprobación. **Archivos:** `packages/delivery/src/`, `tests/delivery-acl.test.ts`, evidencia C31. **Gate:** receptor sin ACL no obtiene URL firmada; exportar no autoriza publicar ni modificar un sitio.

### BRD-C32 — Aprendizaje y librería

Registrar propuestas de procedimiento y componentes reutilizables con ámbito de cliente y derechos. **Archivos:** `packages/library/src/`, `tests/procedure-replay.test.ts`, evidencia C32. **Gate:** SOP propuesto pasa replay y revisión antes de activarse; estilos y memorias privadas no se comparten por defecto.

### BRD-C33 — Reportes, dashboard e infografías

Mostrar estado, fuentes, revisión, rights, cobertura y versiones sin inventar cifras. **Archivos:** `packages/reporting/src/`, `tests/report-acl.test.ts`, evidencia C33. **Gate:** un dato tardío crea revisión; informe A no expone recursos B o previews de otro cliente.

### BRD-C34 — Portal responsive, chat y Anam

Dar al owner/revisor/colaborador vistas scoped para editar, contrastar versiones y aprobar; AV es presencia, no identidad. **Archivos:** `apps/portal/`, `packages/presence/anam/`, evidencia C34. **Gate:** cambio de tenant cierra sesión, cachés y URLs previas; fallback texto y grabación off si no existe política aprobada.

### BRD-C35 — SDK TypeScript, Hono y tools

Exponer capacidades nominadas de lectura/propuesta con PEP único, allowlist exacta, DTOs y errores sanitizados. **Archivos:** `packages/sdk/src/`, `apps/api/src/routes/`, `tests/sdk-contract.test.ts`, evidencia C35. **Gate:** tool de SQL/HTTP/execute genérico rechazada; no exponer approve o export_all por defecto. **Checkpoint 35.**

### BRD-C36 — Bridge de agente y eventos

Mapear hechos confirmados a tipos nativos compatibles `SystemEvent` con `owner`, `emittedAt` y source permitido. **Archivos:** `packages/host-bridge/`, `docs/host-patch-proposal.md`, evidencia C36. **Gate:** evento branding no se inventa como enum del padre; fake no acredita bridge real y no se modifica `agente`.

### BRD-C37 — Cooperación y handoff empresarial

Definir offered/ACK/working/completed/returned, propósito y responsables entre branding, marketing y otros servicios. **Archivos:** `packages/handoffs/`, `docs/sibling-contracts.md`, evidencia C37. **Gate:** un hermano ausente deja tarea pendiente; emitir evento no prueba recepción ni autoriza compartir assets.

### BRD-C38 — Modelos, coste y observabilidad

Medir tokens, rendering, AV, almacenamiento y revisión con reservas por tenant y logs sin material sensible. **Archivos:** `packages/usage/`, `packages/observability/`, `docs/cost-workloads.md`, evidencia C38. **Gate:** coste o retención no aprobados bloquean fallback; ninguna bolsa hipotética equivale a tarifa contratada.

### BRD-C39 — Privacidad y pruebas adversariales

Ensayar BOLA, prompt injection, SVG/XML hostil, SSRF, contenido de otro tenant y exposición en export. **Archivos:** `tests/security/`, `docs/threat-model.md`, evidencia C39. **Gate:** archivo B no llega al contexto A; fuga, secreto, bypass o doble efecto detienen rollout.

### BRD-C40 — Vertical E2E y fallos distribuidos

Ensayar el flujo sintético completo y casos A–I de aislamiento, revocación, cambios, timeout, handoff y restore. **Archivos:** `tests/e2e/`, `tests/evals/`, `docs/e2e-evidence.md`, evidencia C40. **Gate:** trayectoria con acción prohibida falla aunque el render final sea correcto; mock no acredita proveedor real. **Checkpoint 40.**

### BRD-C41 — Operaciones, CI, backup y release

Preparar CI, runbooks, versiones fijadas y recuperación; mantener producción fuera de este encargo. **Archivos:** `.github/workflows/ci.yml`, `docs/operations/`, `infra/` si una implementación autorizada los necesita; evidencia C41. **Gate:** restore reaplica restricciones y no reenvía efectos; rollback conserva editables, audit y receipts.

### BRD-C42 — Aceptación, evidencia y handoff final

Consolidar estados, versiones, entorno, resultados, derechos y capacidades realmente verificadas; entregar demo sintética y backlog. **Archivos:** `docs/release/final-report.md`, `acceptance.md`, `handoff-next.md`, evidencia C42. **Gate:** fallo crítico bloquea aceptación; no afirmar registro legal, paridad mundial o producción. **Checkpoint 42.**

## 7. Vertical sintética sugerida

1. Preparar tenants A/B y operador P con marcas ficticias, assets propios y fuentes licenciadas; ningún material privado real.
2. Un responsable de A crea un brief versionado y el twin propone conceptos con fuentes; un sitio de B no puede entrar en la investigación de A.
3. Un humano revisa un nombre con estado de clearance **pendiente**, sin afirmar disponibilidad legal.
4. Crear un documento editable con texto exacto, nodos y constraints; vincular cada imagen y fuente a derechos vigentes y hash.
5. Generar render en entorno fijado, validar seguridad SVG, contraste, overflow y texto. Una fuente ausente produce bloqueo o cambio revisado, no sustitución oculta.
6. El revisor aprueba la revisión y derechos exactos. Cambiar un logo, tipografía o destinatario después invalida la autorización afectada.
7. Generar un export sandbox con `ExportManifest`: versión editable, recursos, motor, formatos, licencias y hashes. Probar que el archivo puede abrirse y editarse bajo la configuración declarada.
8. Crear brandbook y reporte con lo aprobado, lo pendiente y el alcance de derechos. Nadie publica, compra una fuente o registra una marca por completar el flujo.
9. Probar conflicto CAS, revocación, extracción A→B y timeout de una entrega simulada. Si el proveedor pudo aceptar, reconciliar o mantener incertidumbre, sin retry ciego.

## 8. Pruebas y evidencias que deberían existir

| Frontera | Prueba futura exigible | No basta |
|---|---|---|
| Aislamiento | A/B en API, DB con roles reales, archivo, vector, caché, Realtime, export y worker. | Filtrar un listado en frontend. |
| Derechos | Licencia por recurso/finalidad y revocación entre preview y export. | Una imagen pública o un `license=true` generado. |
| Fuentes | Hash, versión y permisos de embedding; fallback explícito. | Una captura que parece correcta. |
| Editable/render | Round-trip y comparación de nodos/texto; motor y entorno fijados. | Solo PNG atractivo o diff de píxeles. |
| SVG | Archivo adversarial no ejecuta script ni recupera red privada. | Un prompt al modelo indicando que no lo haga. |
| Approval | Revisor humano y hashes de versión, rights y destinatario; invalidación material. | Voz, nombre de avatar o `approved=true`. |
| Proveedor | Release/edición/rol y operación en laboratorio aislado. | Documentación o un mock. |
| Recuperación | Intent, receipt y manejo de `outcome_unknown`; restore sin reenviar. | Borrar historia o asumir exactly-once remoto. |

No se han ejecutado estas pruebas. Las condiciones críticas del repo incluyen cero fugas, secretos centinela, aprobaciones fabricadas, duplicados de replay y efectos fuera de alcance. La revisión legal de marca y derechos requiere competencia humana y alcance real, no un score del modelo.

## 9. Decisiones concretas del owner

- Definir primer cliente y caso **sintético**, rol de revisión y formato editable mínimo.
- Decidir custodio del original y si Penpot es una opción a evaluar o si basta un formato local; no instalar todas las alternativas.
- Definir quién verifica licencias y cómo se registran fuente, territorio, fecha, uso y expiración.
- Elegir formatos de export con preflight demostrable y criterios de fidelidad, accesibilidad y aprobación humana.
- Delimitar qué recibe marketing/redes y quién tiene autoridad de publicación.
- Autorizar por separado cualquier prueba con proveedor, datos reales, contratación, registro o despliegue.

## 10. Diseño detallado de la primera implementación

### 10.1. Modelo de documento y edición

La fuente canónica debe escogerse antes de construir adaptadores. Si se escoge un documento interno, conviene registrar `documentId`, tenant, proyecto, revisión, dimensiones, unidades, orden de nodos, referencias de texto y recursos, y una lista cerrada de operaciones como añadir, mover, modificar o eliminar nodo. Cada operación requiere versión esperada, actor derivado de servidor y clave de idempotencia. Eliminar un nodo en un borrador no significa borrar su versión histórica o el archivo original; política de retención y derechos gobiernan su custodia. El diff debe poder expresar tanto geometría como texto, fuentes y referencias de licencia.

Si se escoge un editor externo como custodio, el identificador de archivo remoto y su revisión deben guardarse mediante un `ExternalLink` tenant-scoped. Las modificaciones remotas concurrentes no se resuelven por nombre de archivo ni por «último en escribir» sin revisión. Es necesario demostrar qué operaciones permite la versión instalada; un adaptador de lectura no se convierte en editor por implementar un DTO local. Una edición remota incompatible deja conflicto revisable y no reescribe un export aceptado.

### 10.2. Reproducibilidad, texto y tipografías

El hash del diseño no es suficiente para reproducir un PDF o un PNG. Guardar el motor de render, versión, configuración, plataforma cuando sea relevante, familias y archivos de fuente con hash, resoluciones, perfil de color, assets y referencias. Declarar qué se compara: árbol editable, texto, geometría, salida vectorial, imagen y propiedades de export. Un diff de píxeles con tolerancia detecta ciertos cambios, pero no garantiza legibilidad ni derechos. Una diferencia antialiasing puede ser aceptable y un nombre incorrecto puede ser crítico aun con pocos píxeles distintos.

El texto aprobado se conserva como texto estructurado y locale, no solo como un fragmento rasterizado. Si la tipografía elegida no está disponible, si el embedding está prohibido o faltan glifos, el renderer debe producir un resultado bloqueado o una variante explícita para revisión, nunca cambiar silenciosamente el diseño. Cuando los textos se conviertan a trazados para un formato de entrega, documentar pérdida de editabilidad y conservar el original editable si la licencia y el encargo lo permiten.

### 10.3. Rights, naming y decisión humana

Para un asset, el registro debe responder: quién lo entregó, qué se permite, para qué cliente y finalidad, territorio, medio, plazo, posibilidad de modificación, redistribución, sublicencia, prueba, revisor y fecha de próxima verificación. Una licencia de uso de una imagen en una propuesta interna puede no autorizarla en publicidad o en una biblioteca compartida. Una referencia de competidor se separa físicamente y lógicamente de los assets exportables. Un cambio de finalidad o de receptor debe reevaluar los derechos, aunque el hash sea igual.

Para naming, la búsqueda preliminar debe incluir lo que se consultó y lo que no, fecha, territorio, clase y posibles variantes. Un cero resultados en una sola fuente no es libertad para operar, exclusividad o opinión jurídica. El informe debe permitir al owner identificar una opción pendiente de revisión y evitar lenguaje de certeza. Las consultas y procedimientos legales reales exigen alcance y responsable adecuados.

### 10.4. Evaluación de calidad sin una nota única

Separar al menos seis dimensiones, cada una con responsable y evidencia: correspondencia con el brief, integridad editable, texto exacto, licencia vigente, accesibilidad por uso y aceptación estética humana. El modelo de visión puede producir alertas de alineación o jerarquía, pero no resolver una licencia ni demostrar ausencia de confusión de marcas. Un diseño puede recibir una evaluación estética alta y fallar por una cifra incorrecta, un contraste inadecuado o un activo sin permiso.

Los escenarios de QA deberían incluir texto ES/EN/FR, caracteres faltantes, líneas largas, render pequeño, variantes monocromas y componentes con restricciones. Registrar versiones y fixture; cualquier claim de accesibilidad requiere más que una prueba automática de contraste. Se deben diferenciar tests de reglas deterministas, comprobación de salida y revisión cualitativa; una opinión humana no sustituye pruebas de SVG hostil y estas no sustituyen la revisión de diseño.

## 11. Contratos entre branding, marketing y otros servicios

Un `BrandPolicySnapshot` que se comparta debe incluir tenant/proyecto, revisión, recursos concretos permitidos, fuentes de claims, fecha, custodio y límites de uso. Marketing puede solicitar una propuesta de creatividad y consumir un snapshot autorizado, pero no debe recibir toda la biblioteca privada ni asumir que una aprobación de marca autoriza una campaña, audiencia, canal o gasto. Redes puede recibir un artefacto concreto para publicar solo si su `WorkOrder` lo contempla; una oferta sin ACK no es publicación completada.

Recomiendo documentar por cada handoff: recurso y versión, finalidad, campos mínimos, derechos para el receptor, condición de revocación, expiración, responsable del efecto, identificador de deduplicación y receipt. Una revocación debe invalidar nuevos usos autorizados cuando corresponda y generar una tarea de revisión para sistemas receptores; no afirmar que puede retirar automáticamente copias ya distribuidas. Mantener el original y la historia bajo política de retención, no destruirlos para simular reversión.

## 12. Riesgos de ejecución y plan de pruebas detallado

| Riesgo | Caso sintético que debe ensayarse | Respuesta esperada |
|---|---|---|
| Reutilización de marca ajena | Moodboard con imagen solo para referencia y otro asset con licencia de export. | El primero nunca se incluye en el paquete redistribuible. |
| Fallo de fuente | Falta la fuente aprobada o no cubre el idioma. | Fallback explícito sujeto a revisión o export bloqueado. |
| Cambios concurrentes | Dos editores modifican el mismo nodo desde una revisión. | CAS detecta conflicto; ambas versiones y original se conservan. |
| SVG hostil | Script, event handler, referencia externa, XML de tamaño excesivo. | Parser/render aislado lo rechaza o pone en cuarentena; sin llamada a red privada. |
| Fuga por export | Revisor A solicita URL de archivo o job de B. | Rechazo sin revelar contenido ni metadatos innecesarios. |
| Derechos revocados | Licencia se retira entre aprobación y export. | Revalidación bloquea nuevo uso; no se afirma recall de copias existentes. |
| Texto alterado | Traducción cambia una cifra o el nombre exacto de la marca. | QA o revisión detiene entrega aunque el layout resulte atractivo. |
| Timeout de entrega | Destinatario de laboratorio acepta y se pierde respuesta. | `outcome_unknown`, consulta si existe referencia y sin retry por otro proveedor. |
| Restore | Backup anterior a una revocación se restaura. | Restricción se reaplica antes de activar workers o enlaces. |

Los casos anteriores no se han ejecutado. El documento de fase debe anotar comando/procedimiento real, SHA, versión de renderer, licencia/rol, fixture, before/after, resultado y responsable, con datos sanitizados. Para cada integración distinguir contrato local, fake, sandbox y versión/edición real. No convertir la ausencia de una cuenta Penpot o una fuente con licencia en un PASS por modificar la prueba.

## 13. Ejemplo de reparto de trabajo autónomo

Para C17, un agente de contratos propone estructura de `DesignDocument` y límites; otro revisa derechos y seguridad del parser; un implementador desarrolla solo el diff autorizado; un verificador independiente revisa CAS, serialización y preservación de texto. El coordinador consolida evidencia y declara el estado con su causa. Ninguno puede aprobar diseños finales o publicar archivos. Si hay discrepancia entre estructura local y API del editor escogido, se conserva el conflicto y se suspende la capacidad, no se inventa compatibilidad.

Para C30, el agente de export registra versiones de motor, fuente y perfil; un agente de QA prepara casos de fuente ausente, texto largo y archivo editable faltante; un humano acepta el paquete solamente tras revisar el alcance. La etapa no autoriza envío, publicación o registro de marca. La salida de cada agente se integra únicamente después de revisar que no haya alterado las garantías previas de aislamiento y derechos.

## 14. Decisión final

La prioridad es un sistema que pueda reconstruir fuente → derechos → editable → versión → revisión humana → export. Hasta ejecutar gates reales, las capacidades son diseño y sus 42 fases siguen sin iniciar. Este informe no ha modificado branding ni el padre.
