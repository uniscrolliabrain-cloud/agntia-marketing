# Auditoría integral y plan de ejecución autónoma de las 42 campañas

**Proyecto:** `uniscrolliabrain-cloud/agntia-marketing`  
**Fecha de esta revisión:** 13 de noviembre de 2026  
**Baseline revisada:** `c3d364e` en este repositorio; referencia documental del padre `agente`: `54b8d5407a8576459448c4d059a877297d18ca7a`.  
**Naturaleza de la entrega:** auditoría documental y propuesta de implementación; no aplicación implementada, ni certificación de seguridad, cumplimiento o viabilidad comercial.

---

## 1. Para qué sirve este documento y cómo leerlo

Este documento transforma el repositorio actual en una guía de decisión y ejecución para una futura persona responsable y un equipo de agentes de programación. No sustituye a las 42 campañas, al manifiesto ni a los contratos: los interpreta, identifica tensiones, propone una organización concreta de archivos y explica qué se debe construir, cómo comprobarlo y cuándo detenerse.

La palabra **campaña** tiene dos significados distintos en este proyecto:

- **MKT-C01 a MKT-C42** son 42 fases de ingeniería para construir la empresa SaaS de marketing. No son 42 campañas publicitarias que haya que enviar a clientes.
- Una **campaña de marketing** es una entidad de producto que una empresa podrá planificar, revisar y, solo cuando corresponda, activar bajo autorización.

Confundir ambas cosas llevaría a creer que el proyecto ya tiene 42 acciones comerciales listas para lanzar. No es así. Según el [índice de campañas](campaigns/README.md), las 42 fases están `NOT_STARTED`, sus 294 tareas son un plan y sus 84 escenarios de gate son `NOT_EXECUTED`. La validación existente, [document-validation.json](release/document-validation.json), corresponde a la entrega documental anterior y no prueba una app, una API, un proveedor o las funcionalidades previstas. Sus recuentos y hash se refieren a aquella entrega, no incluyen automáticamente este documento.

### Fuentes internas que deben leerse junto a esta guía

1. [README del proyecto](../README.md), [producto](01-producto-y-limites.md), [referentes y brechas](03-referentes-y-brechas.md).
2. [Arquitectura](architecture/01-arquitectura.md), [Supabase y twins](architecture/02-supabase-twins.md), [compatibilidad con el padre](architecture/03-compatibilidad-agente.md) y [runtime determinista](architecture/04-runtime-determinista.md).
3. [Contratos](contracts/01-contratos.md), [seguridad y privacidad](05-seguridad-privacidad.md), [medición](09-medicion-y-evaluacion.md), [operación](operations/RUNBOOK.md).
4. [Índice de las 42 campañas](campaigns/README.md) y [manifest completo](campaigns/campaign.json), con siete tareas y dos escenarios previstos por fase.
5. [Handoff](release/HANDOFF.md), [aceptación prevista](release/PILOT-ACCEPTANCE.md), [repositorios observados](research/repositories.json), [mapa selectivo del padre](research/parent-source-map.json) y [registro de fuentes](research/sources.json).

**Alcance de la revisión:** se revisó el contenido de arquitectura, producto, seguridad, contratos, medición, operación y las secciones específicas de las 42 fases. El padre y los proveedores se tratan según el mapa y los informes de investigación del repositorio: no se ha realizado en esta revisión una nueva auditoría de su código completo ni una prueba de sus APIs. Las recomendaciones de proveedores, licencias, normativa y precios son decisiones pendientes de validación, no garantías actuales. Los nombres de archivos nuevos de este documento son propuestas para una futura implementación autorizada; salvo las referencias que ya se enlazan, **no existen por el hecho de mencionarlos aquí**.

---

## 2. Resumen ejecutivo: el diagnóstico sin adornos

La idea es ambiciosa y coherente: una empresa de marketing especializada que trabaja con el sistema generalista `agente`, pero ofrece también una experiencia propia a clientes externos. Quiere unir investigación, estrategia, campañas, creatividades, audiencias, entrega, medición y explicación. La decisión más sólida del diseño es que el modelo **propone y explica**, mientras que un sistema determinista controla identidad, autorización, estados, límites, efectos y evidencia.

La situación actual es, sin embargo, anterior al boilerplate ejecutable. No existe en este repositorio una app TypeScript/Hono, un lockfile, una base de datos, un SDK, un runtime, una interfaz o tests de producto que esta auditoría pueda inspeccionar. Tampoco hay aquí conectores instalados o evidencia de que los proveedores estén funcionando. Lo que existe es un plan documental considerable. Por tanto, esta es una auditoría de su **diseño, orden y riesgos**, no una auditoría de código en producción.

### Mi evaluación por áreas

| Área | Lo que está bien encaminado | Brecha principal y recomendación |
|---|---|---|
| Producto | Relaciona encargo, estrategia, aprobación, ejecución y reporte; contempla clientes externos. | Hay demasiadas capacidades para un primer producto. Definir una vertical sintética y un usuario responsable antes de construir plataformas completas. |
| Autonomía | Distingue twin de agente canónico y separa propuesta de autorización. | Falta convertir esos límites en contratos y pruebas ejecutadas. Ningún prompt debe ser el guard de un efecto. |
| Aislamiento | JWT Supabase, scopes, RLS y separación entre origen y destino están explicitados. | Son requisitos, no controles verificados. Hay que probar todos los accesos, incluidos workers, cachés, búsqueda, archivos y exports. |
| Audiencia y aprobación | Congela máximo de audiencia, contenido y coste; reconoce bajas posteriores. | Falta definir y probar exactamente qué ocurre entre la última comprobación y la aceptación remota. Si el backend no permite cumplir, mantener despacho deshabilitado. |
| Entrega | Distingue intención, receipt y resultado incierto; evita prometer exactly-once. | C14 aparece antes de C20 y C22: no usar un sink con efectos como si todas las garantías finales ya estuvieran construidas. |
| Integraciones | Mapea licencias, ediciones y riesgos de Mautic, listmonk, analítica y ads. | La secuencia incluye alternativas como fases consecutivas; no instalar todo ni presentar una alternativa omitida como verificada. |
| Medición | Separa observación, atribución e inferencia causal; contempla cobertura y deduplicación. | La utilidad inicial no debe depender de MMM, experimentos potentes o integraciones de ads. Empezar por un reporte descriptivo trazable. |
| Operación | Incluye presupuesto, rollback, privacidad y restauración. | No hay costes, tiempos, SLAs, procedimientos o restore medidos. Los importes 30/70/300 € son hipótesis, no tarifas garantizadas. |
| Plan de trabajo | Las fases contienen alcance, siete tareas y escenarios. | Hay reiteración, dependencias estrictamente secuenciales y criterios compartidos algo genéricos. Añadir evidencia específica, responsables y condiciones de no aplicación. |
| Fuentes | Existen referencias, SHAs y limitaciones de lectura. | Un SHA observado o documentación selectiva no es pin de producción, revisión legal integral ni prueba de la API. Revalidar al implementar. |

### Recomendación principal

No construir una plataforma de marketing completa en una sola pasada de agentes. Construir primero un **camino vertical verificable**, limitado a dos tenants sintéticos y un operador: identidad y mandato → brief → elegibilidad → audiencia máxima → creativo con fuentes → preview → aprobación humana → envío exclusivo a sink de pruebas → receipt → reporte descriptivo. Mantener los conectores, Anam, anuncios, SEO avanzado, experimentación y MMM apagados o como propuestas mientras su propio gate no esté verificado.

Esto no elimina el resto de las 42 fases ni cambia su orden oficial. Es una manera de decidir qué debe poder demostrar cada fase y de no activar efectos antes de que exista la cadena completa de controles. La demostración vertical integral prevista pertenece a C40; antes se pueden construir y probar piezas aisladas, no anunciar el flujo completo como terminado.

---

## 3. Hallazgos priorizados y decisiones que propongo

### P0 — Resolver antes de cualquier efecto o acceso a datos reales

**P0.1. La identidad y la autoridad aún no existen en código.** Un token Supabase firmado no basta: verificar issuer, audience, algoritmo y vigencia, resolver membresía activa en servidor y comprobar scope por recurso y campo. `user_metadata`, el `tenantId` de un body y una respuesta de LLM no son permisos. Cada job reconstruye la autoridad vigente. Debe existir un mandato verificable que separe tenant de origen del operador y tenant objetivo. **Evidencia futura:** tests con dos tenants, revocación en cola y roles reales de DB, más salida sanitizada de cada caso.

**P0.2. Aprobar un texto no es aprobar una campaña sin límites.** La revisión humana inicial debe ligar el contenido final y sus variantes, derechos/claims, canal y cuenta, finalidad, audiencia máxima compuesta por miembros realmente congelados, versión de política, coste, ventana y caducidad. Una baja puede reducir esa población; una persona nueva no entra sin otra aprobación. Cambios materiales invalidan el vínculo. **Evidencia futura:** hash canónico de revisión y casos de cambio/revocación, sin publicar listas en el repo.

**P0.3. La salida al exterior no puede ser transaccional por magia.** La transacción local puede consolidar intent, audit e inbox/outbox, pero no garantiza exactamente una entrega HTTP remota. Tras timeout posterior a posible aceptación, marcar `outcome_unknown`, consultar referencias fiables y, si no se puede resolver, bloquear y escalar. Jamás reenviar por otro proveedor para quitar el bloqueo. La pausa no deshace mensajes o costes ya aceptados.

**P0.4. El aislamiento debe cubrir la cadena completa.** RLS y claves compuestas no bastan si un worker privilegiado, una URL firmada, un índice vectorial, un export, Realtime o una caché filtran datos. Probar con los roles de ejecución reales; `service_role` y `BYPASSRLS` no sustituyen la policy. No registrar listas, secretos, tokens, conversaciones ni PII en el repositorio o telemetría.

**P0.5. Las fuentes externas son contenido no confiable.** Una página, CSV, respuesta de una herramienta o creative puede contener prompt injection. El modelo puede leer evidencia acotada, pero no puede modificar sus capacidades, elegir SQL, shell, URL, proveedor o destinatarios. Los adaptadores deben usar bindings y allowlists de servidor, con restricciones de egress, MIME, tamaño y sanitización.

### P1 — Desbloquear valor y reducir complejidad

**P1.1. Elegir un único primer caso de uso.** Recomiendo estrategia y newsletter de prueba para un único proyecto por tenant, con una fuente sintética y un sink local. El cliente puede revisar un brief y un reporte; no necesita un motor omnicanal, ocho proveedores ni un modelo estadístico para validar la cadena. Esto es una priorización propuesta, no una reducción irrevocable del alcance.

**P1.2. Tratar proveedores como adaptadores opcionales, no como arquitectura.** El dominio decide elegibilidad, approvals e intents; Mautic o listmonk ejecutan solo capacidades demostradas. Se evalúa una ruta primero. Si un proveedor no puede restringir la audiencia aprobada o respetar supresión fresca, esa ruta queda deshabilitada. Una instalación aislada por tenant es una hipótesis de contención si el aislamiento compartido no se demuestra, no una garantía automática.

**P1.3. Separar entregables de marketing de permisos para ejecutarlos.** Un brief aceptado no autoriza envío; un contrato comercial no autoriza tracking, grabación ni gasto; una fuente pública o un lead aceptado no demuestra permiso comercial. `WorkOrder` y `AuthorityMap` deben indicar custodio, revisor, aprobador, ejecutor único y responsable de la evidencia.

**P1.4. Diseñar para información insuficiente.** `missing`, `zero`, `stale` y no disponible son estados distintos. Una empresa pequeña puede recibir un reporte descriptivo sin que haya datos suficientes para un experimento o MMM. No sumar conversiones atribuidas de varias plataformas como ventas únicas, ni llamar causal a una atribución. El objetivo es utilidad con límites claros, no gráficas llenas.

**P1.5. Mantener la interfaz proporcional al piloto.** El portal debe permitir observar contexto, revisar evidencia, aprobar y ver incertidumbre. Anam es presencia opcional del twin, no identidad ni firma; si no está verificado, ofrecer texto. Accesibilidad y revisión humana forman parte del camino básico, pero la pantalla bonita no sustituye seguridad o receipt.

### P2 — Madurez posterior

- Medir costes reales por workload, operación y proveedor antes de prometer márgenes, planes o SLA. Separar consumo SaaS, medios y experimentación. Ninguna bolsa ilustrativa compra anuncios.
- Agregar experimentos y MMM únicamente con datos aptos, estimand, revisión, presupuesto y evaluación; no hacerlos obligatorios para un cliente sin datos.
- Mantener paid media en lectura/propuesta o test accounts conforme a capacidad comprobada; un escenario aprobado como informe no autoriza compra.
- Automatizar release, recuperación, retención y respuesta a incidentes con pruebas reales antes de abrir producción.

### Decisiones que necesita tomar el propietario en la futura implementación

1. Quién será el primer usuario revisor y quién acepta el entregable; horario y responsabilidad humana.
2. Qué caso sintético demuestra valor: objetivo, mensaje, criterio descriptivo y límites, no clientes reales.
3. Dónde se custodian memberships, permisos, preferencias, marca, coste y eventos para evitar dos fuentes de verdad.
4. Qué backend, edición y despliegue evaluar **primero**, tras comprobar aislamiento, licencias y funcionalidad; no comprar ni desplegar por defecto.
5. Qué entornos, cuentas sandbox y presupuestos están autorizados. Si faltan, registrar `BLOCKED`/`NOT_VERIFIED`, sin improvisar.
6. Qué datos pueden salir del servicio a modelos/proveedores y bajo qué contrato, región y retención.
7. Qué integraciones con `agente` y repos hermanos precisan autorización y cambios en otra tarea. Este repo no modifica al padre.

---

## 4. Arquitectura objetivo y boilerplate futuro

### 4.1. Una arquitectura, varias fronteras de confianza

El stack **propuesto por el repositorio** es TypeScript, Hono y pnpm; Postgres/Supabase, workers/outbox y adaptadores detrás de puertos. Python/R son candidatos aislados para estadística, no una obligación inicial. No hay todavía una selección ejecutada de versiones, framework frontend o infraestructura, así que no conviene generar una plataforma enorme antes de fijar contratos y baseline.

```text
Cliente autenticado / bridge autorizado
        │  JWT verificado + membership + scope + mandato
        ▼
API Hono / PEP ──► contratos tipados y validación
        │
        ├──► dominio: WorkOrder, brief, audiencia, creativo, approval
        ├──► policy + FSM + autoridad única + límites
        ├──► Postgres: RLS, FKs por tenant, audit, inbox/outbox
        └──► twin vinculado: propone y explica; no se autoautoriza
                         │
                         ▼
             worker con delegación y revalidación
                         │
             sink / adaptador autorizado y acotado
                         │
             receipt o outcome_unknown → reconciliación
                         │
             observaciones → snapshot de reporte
```

El twin no es una segunda plantilla de empleados ni un runtime canónico nuevo. Conserva `tenantId`, `runtimeId`, `roleId`, `personaId?`, `kernelTurnId?`, `provenance`, delegante y ejecutor según el contrato real del padre. El `TwinBinding` y el mandato son estructuras nuevas del servicio, no tipos nativos ya existentes. El mapa documental del padre indica una discrepancia entre índice 12 y catálogo base 16; resolverla con evidencia antes del binding, sin deducir runtimes activos ni copiar memorias a todos los clientes.

### 4.2. Árbol propuesto de archivos, no archivos existentes

El siguiente árbol es una propuesta concreta para la futura implementación. Las rutas generales son compatibles con las familias de artefactos previstas en las campañas; los nombres de archivos más específicos son recomendaciones de esta auditoría. Crear únicamente los que necesite la fase en curso y la tecnología finalmente elegida. No crear archivos vacíos para aparentar avance.

```text
agntia-marketing/
├── package.json                       # workspace y comandos explícitos
├── pnpm-workspace.yaml                # paquetes y apps
├── pnpm-lock.yaml                     # generado al fijar dependencias reales
├── tsconfig.base.json                 # compilación compartida
├── apps/
│   ├── api/src/index.ts               # composición Hono; sin decisiones de negocio
│   ├── api/src/routes/                # rutas nominadas, validación y PEP
│   ├── worker/src/index.ts            # composición de jobs y revalidación
│   └── portal/                        # solo cuando se implemente interfaz
├── packages/
│   ├── contracts/src/                 # DTOs/esquemas/errores versionados
│   ├── auth/src/                      # JWT, membership y principal verificado
│   ├── domain/                        # Actor/twin/mandato y entidades de negocio
│   ├── storage/src/                   # repositorios scoped y transacciones
│   ├── privacy/  eligibility/         # finalidad, supresión, elegibilidad
│   ├── integrations/  secrets/       # registry, credenciales y discovery
│   ├── customer-projections/ imports/ # fuentes, identidad y enlaces
│   ├── briefs/ strategy/              # encargo y propuestas con fuentes
│   ├── brand-policy/ assets/ claims/ # derechos y evidencia
│   ├── audiences/ segmentation/       # DSL cerrada y snapshot máximo
│   ├── campaign-state/ journeys/      # FSM y simulación
│   ├── approvals/ campaign-preview/   # revisión y approval binding
│   ├── frequency/ budget/            # límites y reservas separados
│   ├── jobs/ outbox/ reconcile/       # leases, intentos y estado incierto
│   ├── channels/email/               # sink y puerto de entrega
│   ├── adapters/                     # proveedores opcionales por capacidad
│   ├── measurement/ reporting/       # hechos, claims y snapshots
│   ├── sdk/ host-bridge/             # interoperabilidad futura acotada
│   └── presence/anam/                # presencia opcional, backend scoped
├── migrations/                        # schema versionado y roles/RLS
├── tests/
│   ├── security/ integration/         # JWT, RLS, adaptadores y aislamiento
│   ├── e2e/ evals/                   # trayectorias y fixtures sintéticos
│   └── fixtures/                     # A/B/P, sin PII ni secretos
├── docs/evidence/                     # referencias sanitizadas, no datos sensibles
└── docs/operations/                   # runbooks basados en comportamiento real
```

No es necesario crear un paquete npm por cada carpeta desde el primer día. La frontera conceptual importa más que la cantidad de `package.json`. El responsable técnico debe evitar dependencias cíclicas, abstracciones vacías, wrappers duplicados y un monorepo de decenas de paquetes sin código. Puede comenzar con pocos módulos internos y extraer paquetes cuando exista un consumidor o aislamiento real. Las rutas explícitas de cada campaña son el inventario de artefactos previsto; su materialización debe justificarse en el diff de la fase.

### 4.3. Reglas de dependencia del boilerplate

1. `contracts` no importa adaptadores ni interfaz; representa datos y errores, no credenciales ni autorización.
2. `domain`/policy/FSM no llama directamente a un proveedor; define puertos y decisiones deterministas.
3. API, workers, SDK y Anam pasan por el mismo PEP. No existe un proxy HTTP/SQL genérico para el LLM.
4. Los repositorios reciben contexto verificado; filtros de tenant no dependen de valores elegidos por el modelo. Las FKs y RLS actúan como defensa adicional.
5. Adaptadores implementan operaciones nominadas, con binding por tenant/cuenta/propiedad, límites, versión, licencia y `CapabilityReport`. `unknown`, `forbidden`, `not_configured` y `unsupported` no equivalen a healthy.
6. Un effect intent existe antes de una operación de salida; una aprobación, snapshot y reserva se enlazan por referencias y hashes. Un job no hereda indefinidamente un token humano.
7. Las observaciones y claims conservan fuente, definición, ventana, cobertura, frescura y versión. El frontend nunca transforma falta de datos en cero ni una atribución en causalidad.
8. Secretos residen en un gestor autorizado del entorno; en repositorio solo hay nombres de variables y ejemplos sin valores. No imprimirlos ni copiarlos al modelo.

### 4.4. Objetos y contratos que deben existir antes del proveedor

| Objeto | Para qué existe | Invariante que no puede perderse |
|---|---|---|
| `Principal` / `DelegationMandate` | Distinguir usuario, actor de origen, destino, recursos y capacidades. | Lo resuelve el servidor; vencimiento o revocación bloquean nuevos efectos. |
| `TwinBinding` | Referenciar runtime y rol canónicos desde el servicio. | Un nombre o persona no concede autoridad ni mezcla memoria entre clientes. |
| `ServiceAgreement` / `WorkOrder` / `AuthorityMap` | Delimitar encargo, datos, responsables y ejecutor. | Contratar servicio o aceptar brief no aprueba envío ni gasto. |
| `EligibilityDecision` / `AudienceSnapshot` | Registrar finalidad, prueba, exclusiones y miembros máximos. | El hash incluye la población congelada, no solo la regla. |
| `CreativeRevision` / `ClaimEvidence` | Hacer revisables contenido, derechos y afirmaciones. | Fuente desconocida o derechos caducados bloquean el uso nuevo. |
| `ApprovalBinding` | Unir revisor, versión y alcance exacto. | Cambios materiales o nuevas personas requieren revisión; baja reduce. |
| `OutboundIntent` / `Receipt` | Identificar el efecto y la evidencia de su resultado. | Timeout incierto no es éxito ni autorización de retry seguro. |
| `Observation` / `ConversionFact` / `MeasurementClaim` | Diferenciar hechos, ventas deduplicadas y afirmaciones. | Atribución no es causalidad; conservar valores ausentes y límites. |
| `BudgetReservation` / `BudgetScenario` | Controlar reserva y proponer opciones. | Coste SaaS no es presupuesto de medios; escenario no compra. |
| `ProviderConnection` / `CapabilityReport` | Enlazar tenant con cuenta/propiedad y operación comprobada. | Una credencial válida no autoriza otra cuenta ni implica capacidad verificada. |

El detalle de campos y rutas es el del [contrato v1](contracts/01-contratos.md). La propuesta de implementación debe validarse contra esa fuente y con un especialista cuando se trate de política legal o comercial; el pseudomodelo de este documento no es una API operativa.

---

## 5. Cómo organizar agentes autónomos sin perder control

### 5.1. Modelo de equipo recomendado

Estos son **roles de trabajo** para una futura ejecución, no agentes canónicos nuevos que deban registrarse en `agente`:

| Rol | Puede hacer | No puede decidir por sí solo |
|---|---|---|
| Coordinador | Leer instrucciones, asignar una fase, controlar dependencias y consolidar evidencias. | Declarar PASS sin resultados, saltar un bloqueo crítico o ampliar alcance. |
| Arquitectura y contratos | Proponer DTO, límites, migración y compatibilidad con el padre. | Alterar el padre, inventar símbolos nativos o establecer autoridad desde claims no comprobados. |
| Implementación | Trabajar en archivos autorizados de una fase y ejecutar comprobaciones permitidas. | Usar producción, datos reales, secretos o nuevas herramientas externas sin autorización. |
| Seguridad y privacidad | Revisar amenaza, scopes, PEP/RLS, retención y escenarios negativos. | Dar un dictamen legal universal o resolver un fallo crítico con un mock. |
| Integraciones | Revisar edición, licencia, API y pruebas de laboratorio del proveedor elegido. | Instalar todos los backends, enviar listas reales o usar una cuenta distinta para forzar un gate. |
| Medición | Evaluar definiciones, dedup, cobertura, experimentos y límites. | Presentar atribución como causalidad o fabricar datos para completar informes. |
| Verificación independiente | Reproducir el cambio de la fase, contrastar evidencia y clasificar el estado. | Aceptar una salida de texto como prueba de un efecto o una integración real. |
| Responsable humano | Define encargo, aprueba prioridades y efectúa la revisión requerida. | Delegar aprobación sensible al propio modelo o asumir que voz/avatar es firma. |

Una persona o un agente puede cubrir varias funciones si el entorno no permite separación, pero el resultado debe mostrar qué revisión independiente se hizo o no. Para reducir conflictos, un único escritor por superficie y revisión separada antes de integrar; los demás pueden inspeccionar o preparar propuestas de archivos disjuntos. Los agentes no deben hacer cambios concurrentes sobre migraciones, contratos compartidos o el mismo manifest sin coordinación.

### 5.2. Protocolo de ejecución de una fase

1. **Abrir:** leer instrucciones vigentes, fase completa, tareas y gates del [manifest](campaigns/campaign.json); registrar SHA propio, padre/upstream si se consultan, alcance autorizado, herramientas y capacidad de red/Docker/cuentas.
2. **Comprobar el gate anterior:** si es crítico y no está resuelto, detener el camino dependiente. Una característica opcional puede quedar deshabilitada con su causa; no transformarla en PASS. La secuencia oficial sigue siendo C01→C42; la clasificación de no aplicación debe ser una decisión explícita del responsable y no habilita dependencias de la capacidad omitida.
3. **Diseñar el diff:** enumerar archivos concretos, contratos públicos, datos, permisos y efectos. Cada ruta nueva debe tener razón de existir y asociarse a tareas de la fase. Si contradice un contrato ya aceptado, registrar decisión y resolver antes de escribir.
4. **Implementar bajo el perímetro autorizado:** cambios solo en este repo; no tocar `agente`, repos hermanos, producción, listas reales ni publicidad. Mantener default deny y capacidades externas deshabilitadas hasta su gate.
5. **Verificar:** correr los comandos reales pertinentes con exit status, fixture y entorno. Distinguir test unitario, contrato, fake, sandbox y proveedor/rol real. No contar como ejecutado un escenario de documentación ni tratar un mock como API real.
6. **Revisión de seguridad y negocio:** evaluar fallos, diferencias con aceptación, privacidad, costes y efectos. Corregir la causa; no debilitar assertions para conseguir verde.
7. **Cerrar:** clasificar fase y cada capacidad: `PASS` solo con evidencia suficiente; `BLOCKED` si falta precondición necesaria; `NOT_VERIFIED` si se implementó algo pero falta prueba relevante; `NOT_STARTED` si no se trabajó. Registrar limitaciones y no habilitar dependientes de una capacidad crítica no comprobada.
8. **Checkpoints:** entregar informe tras C05, C10, C15, C20, C25, C30, C35, C40 y C42, tal como indica el handoff. Un informe no implica despliegue ni autorización de la etapa siguiente.

**Sobre la aparente contradicción opcional/secuencial:** las fichas declaran dependencia lineal, por ejemplo C13 depende de C12 aunque listmonk se plantea como alternativa. No cambiar el manifest unilateralmente ni llamar PASS a una integración sin probar. Si Mautic no se selecciona, documentar qué tareas de C11–C12 se completan como evaluación y cuáles quedan no aplicables o `NOT_VERIFIED`, mantener la integración deshabilitada y solicitar decisión explícita sobre el gate antes de avanzar a una capacidad que dependa de ella. En ningún caso se habilita la capacidad dependiente por haber rellenado un informe. Si el bloqueo es crítico para el camino elegido, se detiene.

### 5.3. Qué debe contener cada encargo a un agente

```text
ENCARGO: MKT-Cxx — [nombre y objetivo]
FUENTES: fase completa, manifest, contratos y baseline por SHA.
AUTORIZACIÓN: archivos de este repo y operaciones locales permitidas.
DEPENDENCIAS: estado y evidencia de los gates precedentes.
ENTRADA: fixtures sintéticos y versiones fijadas; sin datos reales.
SALIDA: diff acotado, archivos con motivo, resultados de comandos y evidencias sanitizadas.
INVARIANTES: JWT/membership/scope; mandato; máxima audiencia; aprobación humana;
  supresión; presupuesto; efecto único; ausencia de secretos; estado incierto explícito.
PROHIBIDO: editar agente, comprar, desplegar, enviar campañas reales,
  inventar hechos, aprobarse o pasar un proveedor por probado con un mock.
FINAL: PASS/BLOCKED/NOT_VERIFIED/NOT_STARTED, riesgos, siguiente gate y responsable.
```

El coordinador no debe mandar «haz las 42 campañas y sigue hasta que todo esté verde» sin límites: eso incentiva saltarse seguridad, fabricar capacidades y ocultar dependencias. Es preferible un encargo por fase, con contexto acotado y un reporte que otro agente pueda verificar.

### 5.4. Plantilla de checkpoint

```text
Checkpoint: C01–C05 / SHA / fecha / responsable
Alcance y autorización: …
Fase | estado | capacidad habilitada/deshabilitada | evidencia | riesgo
Comandos reales: comando / entorno / exit / duración / passed / failed / skipped
Proveedor: fake/sandbox/real; versión, edición, rol y operación comprobada
Seguridad: tenants, scope, revocaciones, efectos y pruebas negativas
Coste: medido o desconocido; gasto autorizado y observado por separado
Cambios: diff/commit/PR si existen; archivos y migraciones
Incidentes y datos sensibles: referencias mínimas, sin payload ni credenciales
Bloqueos: causa / propietario / acción permitida para resolver / siguiente gate
```

Si no hay Docker, red, credenciales, licencia o entorno apto, señalarlo. Nunca introducir un secreto en un comando, repositorio, informe o prompt para que un agente «pueda seguir». Los resultados sanitizados no deben revelar direcciones de destinatarios o contenido privado.

---

## 6. Secuencia y riesgos temporales de las 42 fases

El manifiesto establece una secuencia de 42 fases, con C01 sin dependencia y cada fase posterior dependiente de la anterior. Respetar ese orden evita avanzar por intuición, pero no equivale a que una capacidad sensible ya esté lista cuando aparece una primera pieza:

- **C01–C10:** perímetro, autoridad, JWT, twin, contratos, persistencia, privacidad, integraciones, datos y taxonomía. Aquí se construye la base; no hay autorización para campañas reales.
- **C11–C15:** adaptadores de email, sink y formularios. Trabajar con efectos deshabilitados o restringidos a sandbox autorizado. En C14 puede probarse un componente de sink solo con sus controles de laboratorio, pero la cadena de aprobación completa de C20, límites de C21, reconciliación de C22 y E2E de C40 aún no están terminados. No anunciar desde C14 un despacho de campaña seguro o listo para producción.
- **C16–C22:** marca, investigación, segmentación, journeys, preview, approvals, presupuestos y recuperación. El gate de C20 no se vuelve un producto integrado de portal hasta que exista la interfaz posterior; un adaptador fake o una revisión sintética no prueban el bridge real del padre.
- **C23–C30:** lectura analítica, SEO/AEO, experimentos y ads de prueba. Son capacidades separadas. No activar tracking por conectar analítica ni cambiar presupuestos por leer datos.
- **C31–C34:** afirmaciones, MMM optativo, escenarios y reportes. Un proveedor o fase opcional bloqueada no se declara probada; el reporte descriptivo puede ser útil sin un modelo causal siempre que la dependencia y el alcance sean resueltos explícitamente.
- **C35–C42:** SDK/bridge, portal/Anam, coordinación, observabilidad, privacidad, E2E, operación y aceptación. Una prueba de host fake no conecta el padre; publicación y wiring requieren otra autorización. E2E final no sustituye gates previos ni repara un conector no verificado.

### Estados útiles para seguir el trabajo

Además del estado general de fase, conviene mantener una matriz por capacidad y entorno: **planeada**, **implementada sin verificar**, **verificada con fake**, **verificada en sandbox**, **verificada en proveedor/rol concreto** y **habilitada para alcance expresamente autorizado**. Son etiquetas de detalle propuestas para el informe; no reemplazan `PASS`, `BLOCKED`, `NOT_VERIFIED` o `NOT_STARTED` del plan. Ninguna implica producción automáticamente.

---

## 7. Las 42 campañas explicadas para construirlas con agentes

Las fichas originales son la fuente de verdad para sus siete tareas, dos escenarios y referencias. A continuación se explica cómo abordarlas y qué archivos crear o ampliar. Cuando un directorio está indicado, sus nombres internos son propuestas y deben ajustarse al diseño validado; no se afirma que existan ya.

### C01 — Baseline y perímetro autorizado

[Ficha completa C01](campaigns/01-baseline-y-perimetro-autorizado.md) · Dependencia: ninguna.

**Qué resuelve.** Evita que el equipo programe contra una versión imaginada del padre o confunda el estado documental con producto. Registrar alcance de lectura y escritura, SHAs, herramientas, instrucciones aplicables, referencias selectivas y discrepancias conocidas, incluido el catálogo 12/16.

**Archivos futuros.** `docs/baseline.md`, `docs/parent-diff.md`, `docs/evidence/c01/`. El primero registra versiones y entorno; el segundo compara solo los contratos necesarios con referencias a blobs; la carpeta guarda metadatos sanitizados, no copias de datos sensibles.

**Trabajo del agente.** Inventariar contratos Actor/JWT/provenance/tasks/events, comprobar qué se puede ejecutar y anotar cambios previos. El revisor debe verificar que descubrir o aceptar un lead no se convierte en permiso comercial. Si el SHA del padre cambia entre lecturas, detener el mapping y volver a cotejar.

**Gate.** Baseline reproducible y autorización explícita. Sin herramientas, entorno o permisos, el aspecto correspondiente es `BLOCKED` o `NOT_VERIFIED`; no se manda nada para «probar» el baseline.

### C02 — Dominio, autoridad y modelo SaaS

[Ficha completa C02](campaigns/02-dominio-autoridad-y-modelo-saas.md) · Dependencia: C01.

**Qué resuelve.** Separar operador P, clientes A/B, proyecto, marca, usuario, contacto y miembro de una audiencia. Dos empresas con el mismo dominio no comparten datos; una persona importada no se convierte en usuario de Supabase.

**Archivos futuros.** `docs/domain-model.md`, `docs/authority-map.md`, `docs/adr/002-boundaries.md`. Describir quién custodia cada dato, quién revisa, quién acepta y qué sistema es dueño de cada efecto. Definir `ServiceAgreement` y `WorkOrder` sin convertir el contrato comercial en permiso técnico.

**Trabajo del agente.** Preparar fixtures de delegación, colaborador de proyecto compartido y dos emisores que compiten por el mismo mensaje. El coordinador debe identificar la frontera entre marketing, clientes, redes, ventas, branding y finanzas sin suponer que los hermanos existen.

**Gate.** Una intención tiene un ejecutor o produce conflicto; un colaborador de un proyecto no ve otro. No implementar un scheduler empresarial paralelo.

### C03 — Supabase JWT y principal verificado

[Ficha completa C03](campaigns/03-supabase-jwt-y-principal-verificado.md) · Dependencia: C02.

**Qué resuelve.** Definir una frontera confiable para todos los modos empresariales: firma, algoritmo, issuer, audience, `exp`/`nbf`, rotación y JWKS configurados por servidor, seguidos de membership activa y ACL de proyecto/recurso/campo.

**Archivos futuros.** `packages/auth/`, `tests/security/jwt.test.ts`, `docs/auth-contract.md`. Separar verificación criptográfica, resolución de principal y autorización; el token no decide el host de claves. Intake público y webhooks tienen rutas/capacidades específicas y no se convierten en acceso empresarial.

**Trabajo del agente.** Construir fixtures de proyectos y tenants distintos, claims manipulados, suspensión y worker con mandato originado en un principal. No crear membership con `user_metadata`, no asignar owner por fallback y no guardar JWT humano indefinidamente.

**Gate.** Rechazar JWT de otro proyecto y acceso A→B; la revocación con job en cola impide el siguiente efecto. Si no se puede probar contra el entorno de identidad aplicable, la verificación real queda pendiente.

### C04 — Twins y nomenclatura de procedencia

[Ficha completa C04](campaigns/04-twins-y-nomenclatura-de-procedencia.md) · Dependencia: C03.

**Qué resuelve.** Enlazar el twin local con el runtime canónico sin inventar una organización o identidad independiente. Mantener origen del actor separado de `targetTenantId` y de las capacidades del mandato.

**Archivos futuros.** `packages/domain/twin-binding.ts`, `docs/native-lineage-map.md`, `tests/twins.test.ts`. Mapear los nombres nativos observados; el propio binding es una estructura nueva y versionada. Preservar `provenance`, `assignedBy`/`assignedTo`, request y causalidad sin atribuir texto del modelo al humano.

**Trabajo del agente.** Documentar vínculo canónico, revisión, scope, finalidad, presupuesto, caducidad y revocación. Probar memorias separadas entre clientes, cambio de revisión y expiración de lease.

**Gate.** Un twin con nombre de marketing pero sin capability no obtiene autoridad; una sesión activa no mantiene nuevos efectos después de vencer mandato. Resolver discrepancia 12/16 antes de establecer un binding real.

### C05 — Contratos tipados y validación de frontera

[Ficha completa C05](campaigns/05-contratos-tipados-y-validacion-de-frontera.md) · Dependencia: C04. **Checkpoint 5.**

**Qué resuelve.** Crear los contratos de intercambio antes de acoplarse a proveedores. IDs opacos, dinero decimal string con moneda, fechas válidas, límites de tamaño, discriminantes explícitos y rechazo de campos desconocidos.

**Archivos futuros.** `packages/contracts/`, `docs/api-design.md`, `tests/contracts.test.ts`. Incluir brief, creativo/claims, elegibilidad/audiencia, approval/intent, observación/conversión y estados inciertos, con JSON Schema y fixtures sin secretos cuando se autorice implementación.

**Trabajo del agente.** Separar DTO nuevo de tipo nativo del host; `schemaVersion` propio no sustituye `SystemEvent` con string `1.0`. Probar ida/vuelta y comportamiento coherente entre API y SDK.

**Gate.** Rechazar SQL, método o URL libre y scope arbitrario; un valor atribuido no se serializa como venta causal. El checkpoint debe relacionar cada contrato con evidencia real, no solo con su texto.

### C06 — Postgres, RLS y persistencia transaccional

[Ficha completa C06](campaigns/06-postgres-rls-y-persistencia-transaccional.md) · Dependencia: C05.

**Qué resuelve.** Persistir datos aislados y trazables, con FKs e índices compuestos por tenant, versiones, auditoría, CAS, inbox/outbox y recuperación. La transacción local incluye estado, key y outbox; no incluye al proveedor HTTP.

**Archivos futuros.** `packages/storage/`, `migrations/`, `tests/integration/storage.test.ts`. Migraciones con roles API/worker concretos, políticas `USING`/`WITH CHECK` y pruebas de owner/BYPASSRLS; separar contenido con retención limitada de referencias de audit.

**Trabajo del agente.** Probar instalación inicial, upgrade, colisión de IDs externos, concurrencia, fallo de migración y restore de datos sintéticos. Los repositorios reciben un principal y scope verificados, no filtran después de leer todos los tenants con admin.

**Gate.** FK cross-tenant rechazada por API y DB, y caída de transacción sin approval/intent parcial visible. Sin Postgres y roles reales de laboratorio, el gate de integración sigue sin verificar.

### C07 — Bases de tratamiento, supresión y preferencias

[Ficha completa C07](campaigns/07-bases-de-tratamiento-supresion-y-preferencias.md) · Dependencia: C06.

**Qué resuelve.** Separar finalidad de contacto, tracking, grabación y otros usos; reconstruir preferencias, retiradas y restricciones a partir de evidencia y versiones. Una dirección, lead aceptado o dato público no prueba permiso.

**Archivos futuros.** `packages/privacy/`, `packages/eligibility/`, `tests/consent.test.ts`. Definir estados `eligible`, `blocked`, `unknown` y política de frescura; guardar el mínimo de evidencia necesario con revisión humana contextual.

**Trabajo del agente.** Simular retirada entre approval y envío, finalidad distinta y propagación tardía. Definir qué custodio proporciona la supresión y qué hacer cuando no responde: bloquear, no asumir permiso. Una señal de Consent Mode o un sistema cookie-free no certifica cumplimiento.

**Gate.** La baja impide nuevos efectos; consentimiento AV no autoriza newsletter ni audience upload. Las decisiones legales finales requieren revisión competente por territorio y uso.

### C08 — Registro, OAuth, secretos y discovery

[Ficha completa C08](campaigns/08-registro-oauth-secretos-y-discovery.md) · Dependencia: C07.

**Qué resuelve.** Crear conexiones por tenant y proyecto que referencien endpoints y secretos aprobados sin exponer valores. Verificar versión, edición, permisos y capacidades por operación, no solo si el servidor devuelve 200.

**Archivos futuros.** `packages/integrations/registry/`, `packages/secrets/`, `tests/discovery-egress.test.ts`. Controlar TLS, host/puerto, DNS/IP, redirects, timeout, tamaños, OAuth state/PKCE y callback ligado a tenant. `CapabilityReport` debe tener fecha, expiración y causa sanitizada.

**Trabajo del agente.** Ensayar tokens de cuentas A/B, roles mínimos, permisos retirados, rotación, schema inesperado y respuestas HTML. No elegir una URL o método a partir de texto del modelo ni intentar con admin cuando falte permiso.

**Gate.** Una cuenta B no se enlaza a tenant A; cambio de edición o rol invalida el reporte anterior. Sin proveedor/credenciales autorizadas, reportar capacidad `NOT_VERIFIED`.

### C09 — Datos propios y puente de relación

[Ficha completa C09](campaigns/09-datos-propios-y-puente-de-relacion.md) · Dependencia: C08.

**Qué resuelve.** Ingerir datos mínimos con custodia y procedencia, sin crear permisos ni fusionar identidades por coincidencia de email o dominio. La fuente del padre conserva referencias como `placeId` y `leadRef` cuando correspondan.

**Archivos futuros.** `packages/customer-projections/`, `packages/imports/`, `tests/contact-sync.test.ts`. Staging revisable, `ExternalLink`, hash, versión de mapper, cursor y watermark solo tras commit; saneado de CSV y límites de tamaño.

**Trabajo del agente.** Probar al menos el volumen sintético previsto por la ficha, homónimos, buzones compartidos, duplicados, baja y fallos de lote. Una propuesta de fusión debe revisarse; un import no crea memberships ni hace enroll en un journey.

**Gate.** Un CSV con `tenant_id`, owner o `consent=true` sin prueba no concede autoridad; un candidato descubierto no entra automáticamente en campaña.

### C10 — Taxonomía y contrato de medición de eventos

[Ficha completa C10](campaigns/10-taxonomia-y-contrato-de-medicion-de-eventos.md) · Dependencia: C09. **Checkpoint 10.**

**Qué resuelve.** Definir hechos y observaciones con finalidad, fuente, unidad, ventana, hora de ocurrencia y recepción, configuración y dedup. Un evento no es necesariamente una persona, una venta ni un efecto causal.

**Archivos futuros.** `packages/measurement/events/`, `docs/event-taxonomy.md`, `tests/event-ingestion.test.ts`. Definir eventos y propiedades permitidas sin PII o secretos en URLs/UTM ni bus; separar `ConversionFact` de crédito atribuido.

**Trabajo del agente.** Probar duplicados, eventos tardíos, bots, diferencias horarias y permiso retirado. Una revisión tardía crea nueva versión de reporte, no cambia silenciosamente una aprobada.

**Gate.** Dos plataformas que atribuyen una misma orden no crean dos ventas; tracking server-side no suplanta una retirada. El checkpoint debe mostrar definiciones y cobertura, no un KPI inventado.

### C11 — Mautic lectura y mapeo

[Ficha completa C11](campaigns/11-mautic-lectura-y-mapeo.md) · Dependencia: C10.

**Qué resuelve.** Evaluar Mautic como backend opcional de lectura sin inferir aislamiento por tener API. La documentación del repositorio advierte una versión de portada inconsistente y un SHA observado que no es pin de producción.

**Archivos futuros.** `packages/adapters/mautic/read.ts`, `docs/adapters/mautic.md`, `tests/integration/mautic-read.test.ts`. Solo crearlos si se evalúa la ruta, con release/edición/licencia y binding de tenant a instancia/rol documentados.

**Trabajo del agente.** Descubrir campos y permisos; leer listas paginadas con fields allowlist, mapear `do-not-contact` y mantener conflictos. Probar dos contextos y el volumen sintético previsto; si el aislamiento compartido no se demuestra, evaluar instancia dedicada sin darla por segura automáticamente.

**Gate.** Token de B no lista datos bajo conexión A; API deshabilitada produce `unsupported`, no scraping ni fallback admin. Mock no verifica la instancia.

### C12 — Mautic borradores y autoridad de ejecución

[Ficha completa C12](campaigns/12-mautic-borradores-y-autoridad-de-ejecucion.md) · Dependencia: C11.

**Qué resuelve.** Aislar borradores y evitar que crear contactos o modificar segmentos dispare workflows, cron o plugins. Preview es local; incluso un draft remoto es una escritura que necesita un laboratorio autorizado.

**Archivos futuros.** `packages/adapters/mautic/write.ts`, `docs/mautic-execution-boundary.md`, `tests/mautic-drafts.test.ts`. Registrar operaciones nominadas, estados desactivados, mapping e idempotencia con sus límites reales.

**Trabajo del agente.** Inventariar triggers; probar ausencia de envíos colaterales, conflictos, timeout y recuperación. Evaluar si el backend puede hacer cumplir población máxima y supresión por destinatario justo antes del efecto.

**Gate.** Si un cron podría enviar por añadir un contacto, bloquear; si no hay lookup fiable tras timeout, no retry automático. El despacho permanece deshabilitado si no se demuestra el control de audiencia.

### C13 — Listmonk y newsletters como alternativa

[Ficha completa C13](campaigns/13-listmonk-y-newsletters-como-alternativa.md) · Dependencia declarada: C12.

**Qué resuelve.** Evaluar un backend alternativo de newsletter sin considerarlo requisito simultáneo con Mautic. La API de test envía realmente y publicar el archivo web es un efecto distinto.

**Archivos futuros.** `packages/adapters/listmonk/`, `docs/adapters/listmonk.md`, `tests/integration/listmonk.test.ts`. Validar versión/licencia y aislamiento de instancia/DB/roles en lugar de asumir que listas y permisos proporcionan multitenancy.

**Trabajo del agente.** Implementar preview local, draft de laboratorio y mapeo de estados; restringir test-send al sink/allowlist autorizado y comprobar snapshot máximo, supresión y reconciliación. No habilitar publicación de archive por crear una newsletter.

**Gate.** Destinatario libre denegado y archivo privado no publicado. Si esta alternativa no se selecciona, registrar la decisión y conservar su estado pendiente; no fabricarla como validada.

### C14 — Entrega email de sandbox y reputación

[Ficha completa C14](campaigns/14-entrega-email-de-sandbox-y-reputacion.md) · Dependencia: C13.

**Qué resuelve.** Definir el primer componente de entrega a un sink, con un ejecutor por intent, destinatarios autorizados, validación de headers/HTML y estados `accepted`, `sent`, `delivered`, bounce y desconocido con semánticas distintas.

**Archivos futuros.** `packages/channels/email/`, `docs/email-sandbox.md`, `tests/email-delivery.test.ts`. Documentar que una dirección personal del owner no es automáticamente un destinatario sandbox aprobado. No prometer reputación de producción por un sink.

**Trabajo del agente.** Probar destino fuera de allowlist, pérdida de ACK y caída tras aceptación; no cambiar de transporte o invocar el padre como fallback. Esta fase puede preparar controles locales, pero el flujo completo espera C20–C22 y el E2E final.

**Gate.** Solo efectos a destinos de prueba autorizados; timeout incierto no produce segundo envío. No presentar como probada la entregabilidad real ni la cadena final de approvals.

### C15 — Formularios y landings controladas

[Ficha completa C15](campaigns/15-formularios-y-landings-controladas.md) · Dependencia: C14. **Checkpoint 15.**

**Qué resuelve.** Crear propuestas de landing e intake mínimo sin confundir guardar, publicar y activar tracking. El binding dominio/proyecto/tenant se provisiona en servidor, nunca mediante un campo oculto confiado al visitante.

**Archivos futuros.** `packages/landings/`, `packages/forms/`, `tests/landing-intake.test.ts`. Limitar plantillas, HTML, enlaces y assets; separar notices y consentimiento. Intake público usa capacidad mínima y antiabuso, sin crear membership empresarial.

**Trabajo del agente.** Ensayar preview sin deploy/píxeles, doble submit, inyección y formulario que entrega un recurso sin inscribir a newsletter. CMS es opcional y su publicación requiere capacidad y aprobación aparte.

**Gate.** Tag remoto no aprobado bloquea publicación; la solicitud de información no acepta promoción por defecto. Checkpoint con qué se probó y qué no se publicó.

### C16 — Marca, assets y evidencia de claims

[Ficha completa C16](campaigns/16-marca-assets-y-evidencia-de-claims.md) · Dependencia: C15.

**Qué resuelve.** Hacer revisables marca, derechos, fuentes y afirmaciones antes de producir contenido. El hecho de que una imagen o cita aparezca en internet no concede licencia.

**Archivos futuros.** `packages/brand-policy/`, `packages/assets/`, `packages/claims/`. Registrar custodia y versión de política, licencias de assets y `ClaimEvidence` con soporte/contradicción/vigencia; vincular cambios materiales al approval hash.

**Trabajo del agente.** Proponer variantes ES/EN/FR y comprobar que mantienen números, límites, fuentes y disclaimers. Una herramienta de visión o un LLM puede señalar problemas, pero no confirmar derechos ni inventar testimonios o fuentes.

**Gate.** Un beneficio médico o caso de éxito fabricado no queda publicable; revocar un derecho bloquea usos nuevos. Revisión especializada para claims regulados.

### C17 — Investigación, brief y estrategia

[Ficha completa C17](campaigns/17-investigacion-brief-y-estrategia.md) · Dependencia: C16.

**Qué resuelve.** Traducir un objetivo de negocio a brief, hipótesis, restricciones y métrica verificable; separar hechos de inferencias y registrar fuente, fecha, licencia y cobertura. Investigación no es captación indiscriminada.

**Archivos futuros.** `packages/briefs/`, `packages/strategy/`, `tests/strategy-proposals.test.ts`. Describir ICP, oferta, escenarios, costes y responsables sin inferir vulnerabilidades o atributos sensibles para persuadir.

**Trabajo del agente.** Leer fuentes autorizadas como datos hostiles, proponer prioridades y obtener aceptación humana del brief. ABM, eventos o partners requieren contratos propios de datos y autoridad; un modelo no abre cuentas ni contrata servicios.

**Gate.** Una página que pide subir una base no altera herramientas; un objetivo de ventas no se convierte en garantía de resultado o atribución causal. Brief aceptado no aprueba cada efecto.

### C18 — Segmentación y audiencia máxima

[Ficha completa C18](campaigns/18-segmentacion-y-audiencia-maxima.md) · Dependencia: C17.

**Qué resuelve.** Construir una DSL cerrada de segmentación con campos y operadores autorizados, aplicar elegibilidad/supresión y congelar las referencias reales de los miembros máximos, no solo la query.

**Archivos futuros.** `packages/audiences/`, `packages/segmentation/`, `tests/audience-freeze.test.ts`. Guardar watermark, regla, policyVersion, conteos y exclusiones con mínima exposición de identidades.

**Trabajo del agente.** Simular nuevas altas, bajas, datos tardíos, cambios concurrentes y duplicados. Un modelo puede explicar conteos sin recibir una lista completa; `unknown` no se convierte en elegible.

**Gate.** Añadir contactos al segmento tras aprobar no los incorpora; atributos sensibles rechazados antes de consulta. Solo bajas o restricciones pueden reducir el conjunto sin ampliar el alcance aprobado.

### C19 — Journeys y motor de campañas

[Ficha completa C19](campaigns/19-journeys-y-motor-de-campanas.md) · Dependencia: C18.

**Qué resuelve.** Versionar un grafo de pasos, condiciones, ventanas, zona horaria, reentrada y límites. El modelo propone el grafo; el runtime valida y decide cada transición.

**Archivos futuros.** `packages/journeys/`, `packages/campaign-state/`, `tests/journey-fsm.test.ts`. Definir estados y simulador sin IO remoto, más identidad de run/paso/sujeto/iteración y control de concurrencia.

**Trabajo del agente.** Probar ciclos acotados, cambio horario/DST, reinicio, ramas simultáneas y revocación en el paso intermedio. No aceptar steps de shell, SQL o HTTP arbitrarios; una pausa debe distinguir orden, ACK y efectos en vuelo.

**Gate.** Ciclo sin máximo rechazado y baja en paso 2 impide efectos posteriores. El preview no inicia cron ni inscribe por la mera llegada de un evento.

### C20 — Preview y aprobación vinculada

[Ficha completa C20](campaigns/20-preview-y-aprobacion-vinculada.md) · Dependencia: C19. **Checkpoint 20.**

**Qué resuelve.** Convertir la revisión en una decisión humana verificable sobre el resultado exacto, no en un booleano genérico. La preview muestra material, variantes, audiencia máxima, propósito, canal, cuenta, costes y ventana sin enviar ni mutar remoto.

**Archivos futuros.** `packages/approvals/`, `packages/campaign-preview/`, `tests/approval-binding.test.ts`. Canonicalizar hashes de revisión, miembros máximos, assets, claims y políticas; registrar aprobador verificado, expiración y expectedVersion.

**Trabajo del agente.** Probar doble click, expiración, cambio de contenido, audiencia y coste, y retirada. El puerto del host requiere prueba; si está ausente, no fabricar aprobación equivalente ni editar el padre. La aprobación sensible del piloto se confirma en UI autenticada cuando esta exista; voz o avatar no son firma.

**Gate.** Approval de A no sirve para audiencia B; un cambio material exige nueva revisión. Repetición con misma key/payload devuelve estado y payload distinto genera conflicto. Checkpoint distingue pruebas locales de UI/host aún no verificados.

### C21 — Frecuencia, presupuestos y límites de contacto

[Ficha completa C21](campaigns/21-frecuencia-presupuestos-y-limites-de-contacto.md) · Dependencia: C20.

**Qué resuelve.** Separar límite de frecuencia, permiso de contacto, presupuesto SaaS, medios y análisis. Una tasa API no es consentimiento y una bolsa de servicio no permite comprar anuncios.

**Archivos futuros.** `packages/frequency/`, `packages/budget/`, `tests/caps-concurrency.test.ts`. Reservas transaccionales por operación/moneda; consumo, liberación y ajustes tardíos explícitos.

**Trabajo del agente.** Probar dos workers disputando el último slot o saldo, coste desconocido y fuentes autorizadas de caps compartidos. Si padre y hermanos no ofrecen autoridad común demostrada, no prometer un cap global exacto.

**Gate.** Solo uno obtiene el último slot bajo las reglas aplicables; presupuesto de tokens no se usa como gasto de medios. Un override humano no elimina aislamiento ni consentimiento.

### C22 — Outbox, jobs y reconciliación

[Ficha completa C22](campaigns/22-outbox-jobs-y-reconciliacion.md) · Dependencia: C21.

**Qué resuelve.** Coordinar trabajos durables y recuperar fallos sin convertir un timeout en retry seguro. El lease y fencing protegen confirmaciones locales, no prueban exactly-once remoto.

**Archivos futuros.** `packages/jobs/`, `packages/outbox/`, `packages/reconcile/`. Persistir key/hash/intent/audit/outbox en transacción; definir attempts, DLQ, revalidación, consultas remotas por proveedor y escalado humano.

**Trabajo del agente.** Inyectar caída antes y después de HTTP/ACK, takeover de lease, tenant suspendido y pausa sin ACK. Si no hay forma fiable de consultar el resultado, mantener `outcome_unknown` y bloquear nuevos despachos relacionados.

**Gate.** Una aceptación remota seguida de crash no provoca envío por backend alternativo; tenant suspendido no realiza HTTP por tener lease libre. Mantener evidencia y distinguir lo que ya está en vuelo.

### C23 — Matomo lectura y binding de propiedades

[Ficha completa C23](campaigns/23-matomo-lectura-y-binding-de-propiedades.md) · Dependencia: C22.

**Qué resuelve.** Leer métricas de una propiedad ligada al proyecto autorizado, con versión, edición, permisos, cobertura y definiciones. `siteId` remoto no es automáticamente `tenantId`.

**Archivos futuros.** `packages/adapters/matomo/`, `docs/adapters/matomo.md`, `tests/integration/matomo.test.ts`. Permitir métodos y filtros nominados; preservar unidad, agregación, zona y configuración de privacidad.

**Trabajo del agente.** Verificar roles, plugins disponibles, paginación, revocación y site ajeno en laboratorio. Un snapshot se versiona ante datos tardíos y un reporte aceptado no se reescribe en silencio.

**Gate.** Site B rechazado antes de invocar API desde A; ausencia de datos no se convierte en cero ventas ni ROI. Un plugin premium no se declara disponible por leer documentación.

### C24 — Plausible y PostHog como alternativas

[Ficha completa C24](campaigns/24-plausible-y-posthog-como-alternativas.md) · Dependencia declarada: C23.

**Qué resuelve.** Evaluar alternativas analíticas sin instalarlas todas ni asumir que privacidad comercial, licencia base o nombre de un proyecto prueban aislamiento. Diferenciar edición Cloud/CE y carpetas Enterprise.

**Archivos futuros.** `packages/adapters/plausible/`, `packages/adapters/posthog/`, `tests/analytics-alternatives.test.ts`, solo para la opción sometida a evaluación. Bindings explícitos y consultas cerradas; no HogQL/SQL libre, export masivo o admin tools para LLM.

**Trabajo del agente.** Probar scopes de dos proyectos, función ausente, límites y métricas observadas/modeladas. Replay y captura PII permanecen apagados salvo política y aprobación específicas; leer analítica no activa tracking nuevo.

**Gate.** Función Cloud ausente en CE produce `unsupported`, no scraping. Replay que captura PII bloquea habilitación. Alternativa no probada permanece deshabilitada.

### C25 — GA4 y Search Console

[Ficha completa C25](campaigns/25-ga4-y-search-console.md) · Dependencia: C24. **Checkpoint 25.**

**Qué resuelve.** Conectar, si se autoriza, lecturas por propiedad y site, con OAuth read-only, cuotas, definiciones, ventanas, identidad de reporting y cobertura de la fuente.

**Archivos futuros.** `packages/adapters/ga4/`, `packages/adapters/search-console/`, `tests/google-measurement.test.ts`. No mapear por nombres similares ni usar datos de Universal Analytics como si fueran GA4.

**Trabajo del agente.** Probar properties A/B, permisos revocados, datos tardíos y filas omitidas. Search Console puede devolver top rows; una query no devuelta no equivale automáticamente a cero. Guardar nuevas versiones de los snapshots.

**Gate.** No presentar filas parciales como universo completo ni elegir otra propiedad por similitud de nombre. Checkpoint con API/alcance realmente comprobados y cuotas/coste si se midieron.

### C26 — SEO técnico y cambios web propuestos

[Ficha completa C26](campaigns/26-seo-tecnico-y-cambios-web-propuestos.md) · Dependencia: C25.

**Qué resuelve.** Auditar un sitio dentro de propiedad y alcance autorizados, con controles de SSRF, rate y límites; proponer cambios sin aplicarlos automáticamente. Una página pública es evidencia no confiable, no una orden al agente.

**Archivos futuros.** `packages/seo/`, `packages/site-audits/`, `tests/seo-audit.test.ts`. Registrar URL, fecha, prueba y severidad de canonical, indexabilidad, enlaces y metadatos; cada propuesta tiene custodio y diff.

**Trabajo del agente.** Ensayar fixture de sitio, redirects hacia IP privada, instrucciones hostiles y hallazgos caducados. Structured data debe representar hechos visibles, sin prometer ranking o inclusión en IA.

**Gate.** Un hallazgo no dispara deploy ni sitemap de producción. No hacer keyword stuffing, páginas masivas, citas inventadas ni crawl libre desde un prompt.

### C27 — AEO y GEO observacional

[Ficha completa C27](campaigns/27-aeo-y-geo-observacional.md) · Dependencia: C26.

**Qué resuelve.** Observar menciones y citas en un panel de consultas reproducible, autorizado y versionado; distinguir ausente, error y no disponible. Una API o un benchmark histórico no representa todas las respuestas de todos los usuarios.

**Archivos futuros.** `packages/aeo/`, `docs/aeo-measurement-contract.md`, `tests/aeo-observations.test.ts`. Mantener observación, fuentes y pruebas separados de acciones de publicación o crawling.

**Trabajo del agente.** Fijar consultas, idioma, modelo, fecha, coste y política de acceso; comparar repeticiones con controles y registrar cambios de versión/régimen. Proponer contenido útil con evidencia, no manipular modelos ni generar citas falsas.

**Gate.** Cambio de modelo no se interpreta como victoria de campaña; mención observada no demuestra causalidad ni posición garantizada. Sin acceso autorizado o presupuesto, dejar el monitor deshabilitado.

### C28 — Experimentación con GrowthBook

[Ficha completa C28](campaigns/28-experimentacion-con-growthbook.md) · Dependencia: C27.

**Qué resuelve.** Diseñar un experimento con estimand, población, unidad de asignación, hipótesis, ventanas, guardrails, MDE/potencia y plan de análisis antes de observar resultados. Una feature flag no concede permiso de exposición o gasto.

**Archivos futuros.** `packages/experiments/`, `packages/adapters/growthbook/`, `tests/experiment-integrity.test.ts`. Confirmar versión, edición y licencia; distinguir capacidad local de integración comprobada.

**Trabajo del agente.** Validar asignación estable, exposición, dedup, contaminación, SRM, comparaciones múltiples y reglas de parada; probar A/A, nulo y efecto conocido con datos sintéticos. Activación de configuración requiere preview y aprobación separados.

**Gate.** SRM o contaminación impiden una conclusión firme; el LLM no activa un flag global. Un p-value favorable por sí solo no basta.

### C29 — Paid media lectura y descubrimiento

[Ficha completa C29](campaigns/29-paid-media-lectura-y-descubrimiento.md) · Dependencia: C28.

**Qué resuelve.** Leer rendimiento de cuentas publicitarias autorizadas y preparar propuestas locales sin habilitar compras, billing, customer-match ni upload de conversiones.

**Archivos futuros.** `packages/adapters/google-ads/read.ts`, `packages/adapters/meta-ads/read.ts`, `docs/ads-capabilities.md`. Mapear cuenta, moneda, zona, ventana y métricas por propiedad; consultas nominadas, no GAQL o métodos arbitrarios del modelo.

**Trabajo del agente.** Revisar scopes, cuota, data lag y credenciales autorizadas. La investigación previa registró un 429 en Meta, por lo que la API concreta sigue pendiente hasta una verificación nueva; no inventar datasets de campañas reales a partir de fixtures.

**Gate.** Capability de lectura no permite mutate/billing; atribuciones de varias plataformas no se suman como ingreso único. Falta de acceso produce estado honesto.

### C30 — Ads en test accounts y borradores controlados

[Ficha completa C30](campaigns/30-ads-en-test-accounts-y-borradores-controlados.md) · Dependencia: C29. **Checkpoint 30.**

**Qué resuelve.** Validar propuestas solo en cuentas y operaciones de prueba verificadas, sin activar anuncios reales ni comprometer gasto. `validate_only` se usa únicamente donde la API concreta lo soporte.

**Archivos futuros.** `packages/ads-test/`, `docs/paid-activation-boundary.md`, `tests/integration/ads-sandbox.test.ts`. Mantener allowlist de cuentas test, tokens separados, preview y restricciones explícitas.

**Trabajo del agente.** Probar estados borrador/pausado y atomicidad solo cuando estén documentados y verificados; registrar errores parciales y resultados desconocidos. La aprobación de validación de prueba no es autorización de compra.

**Gate.** Una cuenta real se rechaza antes de mutar; timeout de creación no se reintenta con key nueva. Test accounts no prueban performance, overdelivery ni billing de producción.

### C31 — Atribución e incrementalidad admisible

[Ficha completa C31](campaigns/31-atribucion-e-incrementalidad-admisible.md) · Dependencia: C30.

**Qué resuelve.** Mantener tres niveles: descripción, atribución y afirmación causal. Cada cifra debe conservar fuente, definición, cobertura, supuestos y límites; una correlación no es incremento.

**Archivos futuros.** `packages/measurement/claims/`, `docs/identification-contract.md`, `tests/measurement-claims.test.ts`. Deduplicar `ConversionFact` por hecho de negocio y aplicar cancelaciones/devoluciones; no inventar margen o beneficio sin fuentes.

**Trabajo del agente.** Definir estimand y controles, analizar intervenciones y confusión, probar placebos y datos sintéticos con efecto conocido. Cuando no sea apto, conservar reporte descriptivo con estado `insufficient` o `blocked`.

**Gate.** Buen ajuste que atribuye ventas preexistentes no certifica causalidad; si no hay IDs de negocio se explica el límite de dedup. Un número de plataforma no se transforma en venta única por etiquetarlo ROI.

### C32 — MMM Meridian y Robyn optativos

[Ficha completa C32](campaigns/32-mmm-meridian-y-robyn-optativos.md) · Dependencia: C31.

**Qué resuelve.** Evaluar un motor MMM solo para datos y recursos aptos. Instalar Meridian o Robyn no produce identificación causal; la rama observada de Robyn no se considera release estable por defecto.

**Archivos futuros.** `packages/model-jobs/`, `workers/measurement/`, `tests/mmm-admissibility.test.ts`. Contrato de dataset agregado, controles, priors, seed, versiones, presupuesto y artefactos; worker aislado sin permisos de canales.

**Trabajo del agente.** Examinar missing, colinealidad, cambios de régimen y sensibilidad; calibrar contra evidencia experimental si existe. Fixtures sintéticos prueban metodología, no completan la historia de un cliente real ni convierten resultados en aptos.

**Gate.** Serie insuficiente queda bloqueada o necesita revisión; cómputo superior a la reserva no se ejecuta. No elegir modelo solo por R² o una gráfica atractiva. Si la capacidad no se selecciona, permanece deshabilitada y con estado explícito.

### C33 — Escenarios de mix y presupuesto

[Ficha completa C33](campaigns/33-escenarios-de-mix-y-presupuesto.md) · Dependencia: C32.

**Qué resuelve.** Preparar escenarios comparables, con restricciones, intervalos y sensibilidad, sin comprometer caja ni ejecutar reasignaciones. Un resultado puede ser inviable o insuficiente.

**Archivos futuros.** `packages/planning/`, `docs/budget-scenarios.md`, `tests/planning.test.ts`. Separar bolsa de servicio y medios; usar `MeasurementClaim` y `ModelRun` con validez y cobertura trazables.

**Trabajo del agente.** Proponer escenario base y alternativas, riesgos de extrapolación/saturación y, si procede, el coste de un experimento futuro. No convertir datos stale o atribuidos en un óptimo causal ni ejecutar el experimento.

**Gate.** El optimizador carece de capability de mutate; aceptar informe no autoriza compra. Plan imposible se explica sin inventar saldo o ROI.

### C34 — Dashboard, infografías y briefing

[Ficha completa C34](campaigns/34-dashboard-infografias-y-briefing.md) · Dependencia: C33.

**Qué resuelve.** Presentar trabajo y resultados con definiciones, cobertura, frescura y fuentes recuperables. Un número ausente no es cero y un texto atractivo no sustituye evidencia.

**Archivos futuros.** `packages/reporting/`, `apps/portal/reports/`, `docs/metrics-catalog.md`. Snapshot con dataset, versión, filtros, hash y ACL; catálogo con denominadores y exclusiones. Export sujeto a revisión y permisos.

**Trabajo del agente.** Construir tablas y narrativa distinguibles como descriptivo/atribuido/causal; mostrar bloqueos, approvals, receipts y cambios de revisión. Probar cifras tardías, null, cero y límites de idioma con datos sintéticos.

**Gate.** Sin datos suficientes no se afirma ROI ni fracaso; informe A no expone listas, links o agregados identificables de B. Una nueva revisión no altera silenciosamente un informe anterior.

### C35 — SDK Hono, tools y bridge del padre

[Ficha completa C35](campaigns/35-sdk-hono-tools-y-bridge-del-padre.md) · Dependencia: C34. **Checkpoint 35.**

**Qué resuelve.** Exponer interfaces nominadas para el host sin editarlo. El SDK, tools, MCP y futuras sesiones Anam deben recorrer el mismo PEP y recibir identidad/mandato del servidor.

**Archivos futuros.** `packages/sdk/`, `packages/host-bridge/`, `docs/host-patch-proposal.md`. Cliente con DTOs, errores y timeouts; allowlist exacta de método/ruta/tamaño, no passthrough genérico por prefijo.

**Trabajo del agente.** Mapear únicamente eventos compatibles con `SystemEvent` nativo `1.0`, `owner`, `emittedAt` y `source` permitidos; usar inbox/outbox/receipt y ACK tras commit. Documentar patch de wiring para una autorización posterior, sin aplicarlo en `agente`.

**Gate.** Tool de SQL/HTTP libre rechazada; host approval adapter ausente no fabrica aprobación. API↔SDK↔host fake solo demuestra contrato del fake: bridge real queda `HOST_BRIDGE_NOT_VERIFIED` hasta comprobarlo.

### C36 — Portal responsive y sesiones Anam

[Ficha completa C36](campaigns/36-portal-responsive-y-sesiones-anam.md) · Dependencia: C35.

**Qué resuelve.** Dar al cliente externo e integrado una interfaz para ver contexto, editar, revisar, aprobar y consultar fuentes con scope visible. Anam aporta presencia al twin; no establece identidad ni autorización.

**Archivos futuros.** `apps/portal/`, `packages/presence/anam/`, `tests/browser/portal-anam.test.ts`. El backend crea tokens breves AV ligados a principal/twin/mandato/campaña; la API key nunca llega al navegador. Grabación off hasta política aprobada.

**Trabajo del agente.** Implementar roles, cambio de tenant que invalide caché/Realtime/contexto, chat lateral y fallback de texto. Probar en la futura implementación sesión expirada, dos pestañas, revocación, accesibilidad y ES/EN/FR; no se certifica WCAG solo por planearlo.

**Gate.** Sesión de A no lee audiencia B; cambio de tenant durante aprobación obliga a revalidar. Un sí hablado no lanza campaña ni compra medios. Si Anam no se verifica, mantenerlo apagado y conservar texto útil.

### C37 — Cooperación SaaS, handoffs y rotas

[Ficha completa C37](campaigns/37-cooperacion-saas-handoffs-y-rotas.md) · Dependencia: C36.

**Qué resuelve.** Coordinar servicios que pueden solaparse sin compartir datos automáticamente ni duplicar efectos. Handoff tiene estados ofrecido, reconocido, en curso, completado o devuelto; emitir un evento no prueba que se haya hecho trabajo.

**Archivos futuros.** `packages/service-agreements/`, `packages/handoffs/`, `docs/sibling-contracts.md`. Registrar finalidad de datos, `WorkOrder`, dueño de efecto, revisión y receipt por servicio.

**Trabajo del agente.** Probar hermano ausente, ACK tardío, conflicto entre marketing/redes y export sin contrato. La rota empresarial corresponde al padre; jobs técnicos locales no crean otro sistema de dirección empresarial.

**Gate.** Un solo `EffectOwner` controla un publicable; no exportar datos a un hermano sin permiso aunque comparta propietario. Donde falte otro servicio, usar tarea local autorizada o informar bloqueo sin inventar dictamen o saldo.

### C38 — Coste de servicio y observabilidad operacional

[Ficha completa C38](campaigns/38-coste-de-servicio-y-observabilidad-operacional.md) · Dependencia: C37.

**Qué resuelve.** Medir coste y fiabilidad por operación y tenant antes de prometer tarifa o SLA. Las bolsas 30/70/300 € son hipótesis internas del repo, no precios actuales ni presupuestos de ads.

**Archivos futuros.** `packages/observability/`, `packages/usage/`, `docs/cost-workloads.md`. Instrumentar tokens, AV, email, compute, almacenamiento y egress con reservas y receipts; logs y traces sin secretos ni PII.

**Trabajo del agente.** Comprobar tarifas y condiciones vigentes de opciones autorizadas, medir workload representativo, p50/p95 y cobertura; probar agotamiento, backpressure y aislamiento de carga. Fallback de modelo no puede mover datos a proveedor no aprobado.

**Gate.** Si AV no cabe en una bolsa, no se activa cargo automático; otro tenant mantiene límites y aislamiento bajo carga. Un cálculo hipotético no es un SLA medido.

### C39 — Privacidad, derechos y pruebas adversariales

[Ficha completa C39](campaigns/39-privacidad-derechos-y-pruebas-adversariales.md) · Dependencia: C38.

**Qué resuelve.** Revisar fuga por cada superficie y ciclo de vida de datos antes de aceptar el piloto. Cubrir API, campos, jobs, archivos, búsqueda, caché, Realtime, export, memoria y backups.

**Archivos futuros.** `tests/security/`, `packages/privacy/requests/`, `docs/threat-model.md`. Solicitudes de derechos con identidad, alcance y revisión; propagar supresión a proyecciones, proveedores e índices con estados y ACK cuando proceda.

**Trabajo del agente.** Ensayar BOLA, prompt injection en documentos y tool results, SSRF/DNS/redirect, CSV/HTML, OAuth/webhook replay y restore anterior a una baja. Centinelas sintéticos, nunca secretos reales en evidencias.

**Gate.** Una instrucción hostil no consigue export de B; restore aplica supresión antes de activar workers. Fuga, bypass, secreto o efecto no autorizado detienen el rollout. Revisión jurídica por caso; no certificación universal.

### C40 — Evaluación de agentes y vertical E2E

[Ficha completa C40](campaigns/40-evaluacion-de-agentes-y-vertical-e2e.md) · Dependencia: C39. **Checkpoint 40.**

**Qué resuelve.** Verificar la trayectoria completa, no solo el texto final: A/B/P y twin → brief → audiencia autorizada → creativo → approval → sink → receipt → medición; más aislamiento, revocación, crash, coste y estados inciertos.

**Archivos futuros.** `tests/e2e/`, `tests/evals/`, `docs/e2e-evidence.md`. Los escenarios A–I están definidos en [medición](09-medicion-y-evaluacion.md): ejecutar con fixtures propios, estado inicial/final y seeds, no con datos reales.

**Trabajo del agente.** Combinar assertions deterministas sobre tools y estado protegido con evaluación lingüística calibrada; repetir idiomas y fallos pertinentes. Medir calidad, latencia, coste y cobertura bajo workload documentado; un juez no perdona una acción prohibida.

**Gate.** Cero fugas, secretos, approvals fabricadas, bypass de supresión, duplicados de replay o gasto no autorizado en las pruebas aplicables; si faltan laboratorio o bridge, esa parte sigue `NOT_VERIFIED`. Buen fit con recuperación causal mala no pasa gate científico.

### C41 — Operaciones, CI y release reversible

[Ficha completa C41](campaigns/41-operaciones-ci-y-release-reversible.md) · Dependencia: C40.

**Qué resuelve.** Convertir la implementación comprobada en una candidata operable: CI, versiones/lockfiles, runbooks, backup/restore, control de flags y evidencia de rollback, sin desplegar producción automáticamente.

**Archivos futuros.** `docs/operations/`, `.github/workflows/ci.yml`, `infra/`, si el entorno y la autorización futura lo requieren. Las instrucciones deben contener señal, responsable, acción y verificación; skips críticos visibles.

**Trabajo del agente.** Ensayar restore de supresiones, outbox, receipts y permisos; rollback que detenga nuevos efectos sin borrar historia; rotación y DLQ. Evaluar cambios de prompt/modelo/journey antes de habilitarlos y no invalidar silenciosamente approvals.

**Gate.** Pausa remota sin ACK sigue incierta; restore no reenvía outbox confirmada ni reactiva campañas antiguas. Un build instalable de este repo no instala ni modifica el padre.

### C42 — Aceptación, informe y entrega

[Ficha completa C42](campaigns/42-aceptacion-informe-y-entrega.md) · Dependencia: C41. **Checkpoint final.**

**Qué resuelve.** Entregar al owner una matriz verificable de las 42 fases y capacidades, con límites conocidos, costes observados, evidencias y decisiones pendientes; no convertir documentos en producto aceptado.

**Archivos futuros.** `docs/release/final-report.md`, `docs/release/acceptance.md`, `docs/release/handoff-next.md`. Registrar commits/PR si existen, entorno, versiones, tests realmente pasados/fallidos/omitidos y fuente de cada conclusión.

**Trabajo del agente.** Demostrar con fixture el recorrido hasta receipt y `MeasurementClaim`; enumerar capacidades deshabilitadas, revisiones humanas, licencias, restore y límites de proveedor. Preparar un backlog de expansión sin prometer resultados de negocio.

**Gate.** Conector crítico sin laboratorio probado impide declarar PASS a esa ruta; owner debe poder rastrear actor, fuente, aprobación, efecto y reporte. El fin de C42 no autoriza producción, gasto real ni cambios en `agente`.

---

## 8. Matriz práctica de evidencias por frontera

| Frontera | Evidencia que debería existir al cerrar el gate | No cuenta como evidencia suficiente |
|---|---|---|
| JWT y membresía | Test con firma/issuer/audience/tiempo, roles y revocación en entorno aplicable. | Decodificar un token o comprobar que el frontend oculta botones. |
| Tenant/ACL | Tests A/B por API, DB con roles reales, workers, archivos, cache, Realtime, búsqueda y export según superficie implementada. | Un `WHERE tenant_id` aislado o pasar una prueba con usuario administrador. |
| Twin/mandato | Actor de origen, target, capabilities, caducidad y prueba de revocación; mapping del contrato nativo revisado. | Coincidencia de nombre de persona o existencia de una plantilla. |
| Audiencia | Snapshot de miembros máximos, hash, finalidad y versión, más prueba de bajas y nuevas altas. | Hash de la query o tamaño estimado de lista dinámica. |
| Approval | Vínculo verificable de humano, revisión y alcance con prueba de invalidación material. | Texto del LLM que diga «aprobado», voz o aceptación genérica del brief. |
| Entrega | Intent, key/hash, aprobación, resultado y receipt o incertidumbre; test de crash/timeout. | Un cron verde, una petición HTTP sin verificar o la promesa de exactly-once. |
| Proveedor | Release/edición/rol, operación concreta, binding, licencia y prueba en entorno indicado. | README, un 200 HTML, un fake o una credencial con acceso a otra cuenta. |
| Medición | Definición, fuente, cobertura, versión, dedup, estado de datos y nivel de claim. | Cifra del modelo sin fuente o suma de conversiones atribuidas. |
| Restore | Ensayo de backup restaurado con bajas reaplicadas y workers aún deshabilitados hasta comprobar. | Tener una copia o prometer que la cola no reenviará. |
| Seguridad del agente | Traza de herramientas y assertions sobre estado protegido con entradas adversariales. | Una respuesta final convincente después de una acción intermedia prohibida. |

---

## 9. Riesgos concretos del plan y cómo mejorarlo

### 9.1. Riesgo de planificación: 42 fases, demasiadas promesas

**Observación.** El plan incluye marketing automation, SEO, AEO/GEO, varios motores analíticos, experimentos, dos MMM, ads, portal, avatar, SDK y operación completa. La existencia de todos esos capítulos no demuestra que una sola persona o agente pueda ofrecerlos simultáneamente.

**Mejora.** Mantener las 42 fases, pero usar una matriz de capacidad y una única vertical demostrable; registrar qué proveedor y qué métrica se eligieron primero. Los módulos opcionales quedan deshabilitados si no se comprueban. No prometer fechas de entrega, 24/7 humano o costes de producción sin medir esfuerzo y operación.

### 9.2. Riesgo de gate genérico

**Observación.** Las fichas contienen escenarios específicos, pero también repiten una cláusula general de laboratorio, evidencia y rollback. Si un agente copia la misma nota en los 42 informes, será difícil saber qué pasó realmente.

**Mejora.** Para cada gate registrar precondición exacta, comando/entorno o procedimiento, fixture, resultado esperado y observado, exit status, versión y evidencia sanitizada. Identificar explícitamente quién revisa y qué capacidad queda apagada ante fallo. Mantener los 84 escenarios como plan hasta ejecutarlos.

### 9.3. Riesgo de integración temprana y side effects

**Observación.** C11–C14 proponen lectura, drafts y sink antes de terminar C20–C22. Importar un contacto o invocar un endpoint test puede provocar correo o cambios remotos.

**Mejora.** Trabajar con inventario de triggers y cuentas aisladas; preview estrictamente local; no afirmar que el flujo seguro está terminado antes de construir aprobación, caps y reconciliación. Un sandbox también necesita autorización de efecto y destinatarios. No se permite convertir una prueba de laboratorio en tráfico real.

### 9.4. Riesgo de secuencia lineal frente a alternativas

**Observación.** El manifiesto encadena fases que describen alternativas: Mautic/listmonk y varios backends analíticos; también MMM es opcional. Si se interpreta «PASS obligatorio» como «instalar todos», el proyecto aumenta coste y superficie de ataque sin valor demostrable.

**Mejora.** Antes de una alternativa, registrar selección/no selección y alcance de evaluación. Continuar solo conforme a una decisión explícita sobre el gate secuencial; `NOT_VERIFIED` no es PASS y una capacidad que depende de una integración omitida no se habilita. Si la secuencia necesita cambiarse, proponer un ADR y obtener autorización antes de alterar el manifest, no reescribirlo silenciosamente.

### 9.5. Riesgo de transferencia de autoridad entre servicios

**Observación.** Operador, tenant cliente, agente canónico, twin, usuario externo, proveedor y hermanos pueden tener identidades distintas. Una pertenencia a un tenant no autoriza implícitamente otro, aunque compartan owner o marca.

**Mejora.** Representar mandato origen→destino, propósito, recursos, capacidades, vencimiento y revocación en un contrato verificable. Conservar provenance nativa, autoría real y `requestId`/correlación diferenciados. `Actor.tenantId` no se reescribe para simular una membership.

### 9.6. Riesgo de datos jurídicamente insuficientes

**Observación.** Un CRM puede tener un campo `consent=true` sin prueba, una dirección compartida o preferencias desactualizadas. No existe una base universal válida para cualquier canal y finalidad.

**Mejora.** Guardar estado y procedencia de elegibilidad, caducidad/frescura y motivos; bloquear `unknown`. Revisión jurídica de los flujos reales, no certificación genérica por elegir un proveedor. Diseñar retirada, derechos y propagación antes de campañas reales.

### 9.7. Riesgo de resultados de marketing inventados

**Observación.** Métricas de plataforma, aperturas y atribuciones tienen límites, bots, retrasos o duplicación. MMM puede ajustar bien y fallar en estimar la consecuencia de cambiar presupuesto.

**Mejora.** Catálogo de definiciones, negocio como fuente de ventas, dedup y ajustes, cobertura y freshness, claims tipados y escenarios con supuestos. Si faltan datos o identificación, decirlo y ofrecer observación descriptiva útil. No prometer ranking ni incrementos.

### 9.8. Riesgo de investigación y licencias obsoletas

**Observación.** El repositorio registra consultas selectivas, SHAs de referencia y diferencias de edición; algunos upstream son ramas de desarrollo y Meta devolvió 429. Las bolsas de coste no son cotizaciones verificadas.

**Mejora.** Al seleccionar una integración, cotejar release/imagen/digest, archivos y licencia concreta, edición, DPA, región y operación requerida; registrar fecha y alcance. No copiar código, datasets o funciones Enterprise sin revisar derechos. Un SHA observado es punto de investigación, no aprobación de producción.

---

## 10. Plan de pruebas futuro: de unidad a producto

No se han ejecutado estas pruebas en esta auditoría. Esta sección especifica qué debería pedirse cuando exista código y autorización:

1. **Contrato y policy:** serialización/validación de campos, errores, principal no confiado, reglas DSL, approval hash y transiciones FSM; valores extremos y campos inesperados.
2. **Persistencia y concurrencia:** migración inicial/upgrade/rollback, FK compuesta, RLS con roles reales, CAS, outbox y reservas, locks, dos workers y crash. No usar `service_role` como única prueba.
3. **Privacidad e identidad:** JWT de otro issuer/audience, token caducado, membership suspendida, mandato caducado, `user_metadata` manipulado, A→B en cada superficie, baja entre aprobación y dispatch.
4. **Audiencia y creatividad:** miembros añadidos después de congelar, supresiones, fuente caducada, revocación de derechos, locales, cambios materiales y claves idempotentes.
5. **Efectos:** destinatario fuera de sandbox, doble click, pérdida de ACK, aceptación remota con timeout, reconciliación, pausa sin ACK, cambio de ejecutor y bloqueo ante incertidumbre.
6. **Proveedor:** capability discovery, versión, cuenta A/B, rol limitado, campos omitidos, paginación, cuota, edición y licencia; fake y laboratorio real se informan por separado.
7. **Medición:** evento duplicado/tardío, ventas atribuidas por varios canales, devolución, null/cero/stale, cobertura parcial, experimento con SRM y datos sintéticos con endogeneidad.
8. **Agente:** prompt injection en fuentes y tools, intento de SQL/HTTP libre, falsa aprobación, respuesta correcta tras una acción prohibida, memoria entre tenants y explicación con fuentes.
9. **Operación:** retención, restore, revocación, DLQ, manejo de secretos, coste y carga representativa. Los resultados de un laboratorio no son SLA ni producción verificada.

Los [escenarios A–I](09-medicion-y-evaluacion.md) y [aceptación del piloto](release/PILOT-ACCEPTANCE.md) son la lista de referencia para el E2E futuro. Un único fallo crítico de fuga, autorización, duplicación, secreto o gasto no autorizado detiene aceptación del camino afectado aunque el resto pase.

---

## 11. Ejemplo de primera vertical sintética y cómo reconstruirla

**No es una ejecución actual; es una guía para el futuro.**

1. Crear fixtures originales: operador P, tenants A y B, usuarios, proyectos, un twin por binding válido y personas de prueba con dominios `.example`. No copiar memorias de la persona default ni datos de clientes reales.
2. El humano autorizado crea un `WorkOrder` con objetivo descriptivo, destinatarios de sandbox, finalidad, canal, ejecutor y coste máximo de prueba. El twin propone un brief con fuentes de fixture y sin claims inventados.
3. El servicio verifica JWT, membership, scope y mandato. Una petición con IDs de B bajo A se rechaza sin filtrar metadatos.
4. El motor calcula elegibilidad y congela los miembros máximos de A; una persona sin permiso o con estado desconocido queda excluida. El modelo ve un resumen mínimo, no una lista completa.
5. Se redacta una revisión de contenido con derechos y evidencia; el preview muestra exactamente la versión, canal, ventana, audiencia y coste. No hace HTTP de envío.
6. El revisor humano autenticado aprueba la revisión exacta. Se registra `ApprovalBinding` con hash y expiración. Un cambio posterior material requiere otra aprobación; retirar a una persona reduce la población.
7. La transacción local escribe intent, idempotency key, audit y outbox. Un worker reconstruye autoridad, mandato, elegibilidad, supresión, límite y presupuesto; usa exclusivamente el sink autorizado.
8. Si el sink confirma, se conserva un receipt con alcance mínimo. Si hay timeout tras posible aceptación, aparece `outcome_unknown`; no se reintenta por otro transporte.
9. El reporte descriptivo indica qué fue aceptado por el sink y qué se desconoce, con fuente y ventana. No afirma entrega humana, venta o ROI por tener un receipt.
10. Un revisor reconstruye la cadena desde actor/mandato → brief → snapshot → revisión → aprobación → intent → receipt → claim. La prueba de acceso de A a B y la baja durante cola deben seguir fallando de forma segura.

Esta vertical será útil como demo cuando las piezas y gates necesarios se hayan ejecutado realmente. Si falta la UI, un mecanismo de revisión humana de laboratorio debe estar explícitamente autorizado y probado; no se permite inventar aprobación para completar la demo. Si falta el bridge real, el vínculo fake se identifica como tal.

---

## 12. Qué no debe hacer el equipo de agentes

- No convertir la documentación en una afirmación de que existe un SaaS o que 42 fases ya están hechas.
- No editar `agente` ni otros repositorios desde este encargo; un futuro patch de integración se documenta y requiere autorización separada.
- No crear agentes canónicos nuevos, copiar personas o memorias de clientes ni atribuir autoridad por el nombre de un rol.
- No usar un LLM como fuente de identidad, tenant, permiso, SQL, destinatario, URL de proveedor, aprobación o gasto.
- No enviar a listas reales, comprar ads, subir audiencias, activar tracking, publicar landings o desplegar producción por terminar una fase de ingeniería.
- No tratar `POST test` de un proveedor como simulación si produce un envío, ni probarlo con destinatarios fuera de una allowlist expresamente autorizada.
- No importar listas compradas, hacer scraping indiscriminado, inventar testimonios/citas, inferir atributos sensibles o explotar vulnerabilidad personal.
- No saltar gates críticos, rebajar tests, ocultar skips, etiquetar un fake como proveedor real ni usar datos sintéticos como hechos de un cliente.
- No prometer exactamente una vez por HTTP; no cambiar de backend después de un timeout incierto, ni afirmar que pausa/cancel recupera lo ya enviado o elimina costes tardíos.
- No sumar ventas atribuidas de plataformas ni convertir automáticamente fit estadístico o un ranking observado en causalidad o garantía.
- No tratar cookies, hashing, tracking server-side o una etiqueta privacy-first como prueba autónoma de cumplimiento.
- No introducir secretos, JWT, listas de destinatarios, conversaciones o PII en el repositorio, logs, modelos o evidencias públicas.

---

## 13. Decisión recomendada al owner

**Construir sí, pero por una ruta estrecha y verificable.** El diseño tiene una base conceptual fuerte: multitenancy explícito, identidad canónica, approvals vinculadas, outbox y medición honesta. Su mayor riesgo no es la falta de ideas, sino intentar ejecutar demasiadas a la vez y confundir cada documento con una capacidad que ya funciona.

Mi recomendación es autorizar por separado, cuando lo decidas, una implementación de la secuencia que empiece en C01 y produzca evidencia real por checkpoints. El criterio de éxito inicial no debería ser «instalamos todos los proveedores» o «el avatar habla», sino: **dos clientes sintéticos aislados, un encargo reconstruible, una audiencia correctamente restringida, una revisión humana auténtica, un único efecto de prueba o una incertidumbre bloqueada y un reporte que no inventa resultados**.

Las 42 fichas ya ofrecen un desglose; esta auditoría añade la disciplina para ejecutarlas con agentes sin perder control. Su estado actual sigue siendo documental: nada de lo descrito aquí activa campañas, modifica el repositorio padre, envía correos, compra anuncios o despliega una aplicación.
