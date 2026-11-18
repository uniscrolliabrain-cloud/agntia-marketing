# META AUDIT · Agntia Redes · 14-11-2026

**Repositorio:** [uniscrolliabrain-cloud/agntia-redes](https://github.com/uniscrolliabrain-cloud/agntia-redes/tree/b841e28a7a32ba391e20fa604a439a9b868cb572)
**Referencia:** `b841e28a7a32ba391e20fa604a439a9b868cb572` · **Fecha de auditoría:** 14-11-2026
**Naturaleza:** meta auditoría documental. No acredita producto, licencia de proveedor ni cumplimiento.

## 1. Veredicto en una frase

Es el diseño más maduro de los tres repositorios sociales/comerciales pendientes —tiene matriz de proveedores, presupuesto y una docena de documentos propios— pero sigue siendo **solo documentación**, y su riesgo dominante es publicar algo irreversible en una cuenta ajena por un timeout mal interpretado.

## 2. Qué es y qué hay

Middleware social: convierte briefs aprobados en borradores, calendario, publicaciones trazables, atención de comunidad y reportes con fuentes. Setenta archivos, todos Markdown y JSON; sin runtime, sin conectores, sin cuentas conectadas y sin publicaciones.

| Componente | Estado observado |
|---|---|
| Documentación | 11 documentos raíz + 4 de arquitectura + contratos + 3 de research + 3 de compañías/papers/licencias |
| Campañas | 42 documentos (RDS-C01…C42), 294 tareas, 84 escenarios, `NOT_STARTED` |
| Manifest | `campaign.json`, 252 KB |
| Código, tests | **ninguno** |
| Proveedores | Postiz, Mastodon, Bluesky, Meta, LinkedIn, YouTube, TikTok, X, Pinterest, Buffer — todos como candidatos |

Detalle relevante y honesto: el README declara que el `SocialClient` del padre es un stub que falla con 503, y que declarar eventos sociales no demuestra publicación. Esa frase debería sobrevivir a cualquier reescritura del documento.

## 3. Hallazgos prioritarios

### P0.1 — Publicar es irreversible y el timeout es el enemigo

Cada canal externo tiene la misma trampa: la petición sale, el proveedor acepta, la respuesta se pierde. Un reintento publica dos veces ante la audiencia real de un cliente. El diseño lo trata con intent durable, idempotencia y reconciliación (C21, C24) y esa es la respuesta correcta, pero el gate debe ser explícito: **timeout tras envío = `outcome_unknown`, nunca reintento ciego, nunca cambio de proveedor para forzar un resultado**. Y como casi ninguna red social ofrece idempotencia real de publicación, la reconciliación es por referencia visible (ID de post, URL, listado de la cuenta), no por confianza.

Corolario que el documento no subraya: deshacer no existe. Un borrado posterior puede no propagarse a copias, cachés o terceros. "Retirar" una publicación es un efecto nuevo, no un rollback.

### P0.2 — La aprobación debe ser del texto exacto y de la cuenta exacta

El flujo es brief → borrador → revisión → publicación. La aprobación tiene que atar: contenido final con hash, variante por canal (un texto para LinkedIn no es el de TikTok), cuenta y organización destino, fecha y hora, presupuesto si hay promoción, y caducidad. Cambiar una palabra, una imagen o la cuenta invalida la aprobación. Sin esto, el sistema publica algo que nadie leyó, en el perfil equivocado, que es el error más frecuente y más caro del dominio.

### P0.3 — Derechos de los activos: el Content Passport no es un adorno

C17 plantea assets, derechos y un "Content Passport". Es la pieza que evita el problema real: una imagen sin licencia, una música con derechos, la cara de una persona sin autorización, un testimonio inventado. El pasaporte debe registrar origen, licencia, ámbito territorial, vigencia, restricciones de uso comercial, autorización de imagen cuando aplique y prohibición de suplantar reseñas o citas. Debe ser **bloqueante**: un activo sin derechos declarados no entra en un borrador publicable.

Debe además sobrevivir a la transformación: recortar, reencuadrar o reutilizar un activo no renueva sus derechos ni su vigencia.

### P0.4 — Métricas: atribución no es causalidad

C29 y C30 construyen modelo de métricas, snapshots y reportes con evidencia. El riesgo es conocido: sumar impresiones de plataformas distintas como si fueran personas, presentar correlación como efecto, o atribuir ventas a una publicación sin identificación. Los snapshots deben conservar la ventana, la definición exacta de cada métrica, la fuente y la fecha de extracción, y distinguir `missing`, `zero` y `stale`. Un alcance que bajó porque la plataforma cambió la definición no es una caída de rendimiento.

Regla práctica: ninguna métrica de plataforma se presenta como ventas únicas, y ninguna comparación entre canales se hace sin declarar que las definiciones no son equivalentes.

### P0.5 — Moderación y comunidad: contexto, no palabra clave

C26 y C27 cubren atención de comunidad y moderación contextual revisable. Ocultar, borrar o silenciar a un usuario es un efecto visible con consecuencias reputacionales. La decisión debe ser humana o estar limitada a supuestos estrechos y reversibles (spam evidente, contenido ilícito flagrante), con registro de quién decidió, por qué y con qué evidencia. Un clasificador es una señal, no un veredicto.

Y el contenido entrante es hostil por definición: una mención o un mensaje privado puede contener instrucciones dirigidas al agente. El sistema no debe ejecutar nada que venga de un comentario.

### P0.6 — OAuth y scopes: el permiso amplio que nadie revisó

Cada proveedor concede permisos distintos y los cambia. Un token con capacidad de publicar, leer mensajes directos y gestionar la página es mucho más de lo que necesita un borrador. El diseño debe registrar scope solicitado frente a scope concedido, detectar la degradación y deshabilitar la capacidad afectada. Los tokens viven en el servidor, nunca en el navegador ni en un log.

TikTok (C15) merece su propia regla por el requisito de consentimiento específico de publicación, y Meta (C12) por la diferencia entre perfil, página y Threads: son capacidades distintas aunque compartan proveedor.

## 4. Modelo de dominio

| Objeto | Conserva | No acredita |
|---|---|---|
| `WorkOrder` | alcance, marca, canales, fechas y responsable. | permiso para publicar. |
| `Asset` / `ContentPassport` | origen, licencia, ámbito y restricciones. | derecho vigente tras transformar o reutilizar. |
| `Brief` | objetivo, audiencia, mensajes y supuestos. | aprobación del resultado. |
| `DraftVariant` | texto por canal, versión y previsualización. | que el texto se haya revisado. |
| `ApprovalBinding` | hash, canal, cuenta, hora, coste y caducidad. | permiso si algo cambió. |
| `ScheduleSlot` | hora, zona y ventana del canal. | entrega garantizada. |
| `Publication` | referencia remota, estado y receipt. | que el contenido sea visible o correcto. |
| `MetricSnapshot` | definición, ventana, fuente y fecha. | causalidad ni comparabilidad entre canales. |
| `ModerationDecision` | regla, evidencia, actor y reversibilidad. | criterio correcto ni proporcionalidad. |

**Ejemplo sintético:** una marca programa un clip en tres canales. El texto de LinkedIn se aprueba; el de TikTok lleva una frase distinta y queda pendiente. A la hora prevista se publica solo LinkedIn; TikTok espera revisión. El primer intento en LinkedIn recibe timeout tras aceptación: el sistema marca `outcome_unknown`, consulta la cuenta por el identificador de la publicación y confirma una sola entrega. Nadie reintenta. La música del clip tenía licencia solo para web, así que el pasaporte bloqueó su uso en la variante social hasta sustituirla. Es un ejemplo conceptual.

## 5. Arquitectura y boilerplate previstos

Propuesta TypeScript/Hono/Supabase. Rutas sugeridas por esta auditoría, no existentes:

```text
apps/api/src/                # API nominada, policy y ACL
apps/worker/src/             # jobs, outbox, reconciliación y kill switch
apps/portal/                 # calendario, revisión, bandeja y reportes
packages/contracts/src/      # DTOs, errores y validación
packages/auth/src/           # JWT, membership y mandato
packages/assets/src/         # Content Passport y derechos
packages/briefs/src/         # work orders, briefs y variantes
packages/publish/src/        # comandos, scheduling y estados
packages/providers/src/      # adaptadores y capability report
packages/community/src/      # inbox, menciones y moderación
packages/analytics/src/      # snapshots semánticos y reportes
packages/events/src/         # inbox/outbox y ACK
migrations/                  # RLS, FK compuestas, pruebas de roles
```

**Estados:** `draft → in_review → approved → scheduled → queued → publishing → published → acknowledged`, con `failed`, `unknown`, `withdrawn` y `stale`. `unknown` es estado de primera clase.

## 6. Agentes y gates

Los agentes proponen borradores, variantes y calendario; no publican, no moderan y no cambian cuentas. Reparto: coordinación, seguridad, dominio, integración por proveedor, QA adversarial y un responsable editorial que aprueba contenido y voz de marca. Checkpoints tras C05, C10, C15, C20, C25, C30, C35, C40 y C42.

## 7. Plan de las 42 campañas

Fichas derivadas del índice del repositorio; todos los gates siguen `NOT_EXECUTED`.

### RDS-C01 — Baseline, alcance y cotejo del padre
Fijar SHAs, alcance y vertical sintética; registrar qué del padre se observó. **Gate:** entorno reproducible; sin modificar `agente`.

### RDS-C02 — Arquitectura de empresa SaaS y acuerdos de servicio
Definir servicio, responsable, cliente y autoridad por encargo. **Gate:** un solo dueño por efecto; conflicto bloquea.

### RDS-C03 — Identidad, tenancy y capacidades del servicio
JWT Supabase, membership y scope desde servidor. **Gate:** tenant ajeno no lee; sin fallback por defecto.

### RDS-C04 — Contratos versionados de dominio y errores
DTOs estrictos, IDs opacos, errores sanitizados y versionado. **Gate:** rechazo de extras; sin datos privados en mensajes.

### RDS-C05 — Persistencia, auditoría y migraciones
Tablas por tenant, FK compuestas, RLS y audit separado del payload. **Gate:** aislamiento probado con roles reales. Checkpoint.

### RDS-C06 — Licencias, catálogo comercial y discovery de capacidades
Catálogo por proveedor, licencia y capability report. **Gate:** `unknown` deshabilitado; sin coste no se oferta.

### RDS-C07 — Conexión OAuth y ciclo de credenciales
Scope solicitado frente a concedido; rotación y revocación. **Gate:** token fuera de logs y navegador; degradación detectada.

### RDS-C08 — Transporte robusto y puertos de proveedor
Reintentos acotados, circuit breaker y límites de tamaño. **Gate:** reintento solo donde es seguro; publicación no se reintenta a ciegas.

### RDS-C09 — Adaptador Postiz o backend social elegido
Un solo camino de piloto con versión y licencia verificadas. **Gate:** instalación real o `NOT_VERIFIED`; no se presenta fork como producto.

### RDS-C10 — Adaptador Mastodon de referencia
Publicación y borrado con referencia remota. **Gate:** borrado no se presenta como rollback; se registra como efecto nuevo.

### RDS-C11 — Adaptador Bluesky y referencias de registro
Identidad y registro de referencias sin mapear por nombre. **Gate:** IDs opacos; conflicto de identidad queda pendiente.

### RDS-C12 — Meta: Instagram, Facebook y Threads por capacidad
Separar página, perfil y Threads; permisos por activo. **Gate:** cuenta equivocada imposible; capacidad por activo declarada. Checkpoint.

### RDS-C13 — LinkedIn y ciclo de versiones
Versionado de contenido y límites del proveedor. **Gate:** variante distinta exige aprobación propia.

### RDS-C14 — YouTube y procesamiento de vídeo
Subida, metadatos y estado de procesamiento. **Gate:** procesamiento pendiente no es publicación confirmada.

### RDS-C15 — TikTok y consentimiento específico de publicación
Consentimiento y requisitos propios del canal. **Gate:** sin consentimiento específico no se publica. Checkpoint.

### RDS-C16 — Proveedores opcionales: X, Pinterest y Buffer
Evaluar coste, licencia y estabilidad. **Gate:** no se habilitan para aparentar cobertura.

### RDS-C17 — Assets, derechos y Content Passport
Origen, licencia, ámbito, vigencia y autorización de imagen. **Gate:** activo sin derechos no entra en publicación.

### RDS-C18 — Work orders, briefs y variantes editoriales
Brief con objetivo, audiencia y supuestos; variante por canal. **Gate:** brief sin aprobación no genera cola.

### RDS-C19 — Máquina de estados y aprobación vinculada
Aprobación con hash, canal, cuenta, hora y caducidad. **Gate:** cambio material invalida; `unknown` no avanza.

### RDS-C20 — Calendario y SOPs del especialista
Calendario con zona, ventanas y límites por canal. **Gate:** hora dudosa no se programa. Checkpoint.

### RDS-C21 — Outbox, workers, leases e inbox durable
Intent, lease, outbox y ACK tras commit. **Gate:** replay no duplica publicación.

### RDS-C22 — Presupuesto, entitlements, minutos y facturación del servicio
Cuota por tenant y reserva antes de gastar. **Gate:** sin presupuesto no hay promoción ni llamada de pago.

### RDS-C23 — Comandos de publicación y ejecución por canal
Comando nominado por canal con allowlist. **Gate:** sin URL ni método libres; error no se disfraza de éxito.

### RDS-C24 — Reconciliación, edición, retirada y kill switch
Reconciliar por referencia visible; retirada como efecto nuevo. **Gate:** `outcome_unknown` resuelto o bloqueado, nunca reintentado.

### RDS-C25 — Ingestión de inbox y webhooks autorizados
Firma, deduplicación y evidencia. **Gate:** webhook sin firma rechazado. Checkpoint.

### RDS-C26 — Atención de comunidad y servicio al cliente
Respuesta propuesta con revisión y SLA. **Gate:** sin aprobación no se responde en nombre de la marca.

### RDS-C27 — Moderación contextual revisable
Regla, evidencia, decisión y reversibilidad. **Gate:** clasificador no decide solo; ocultar exige registro.

### RDS-C28 — Escucha y contexto de mercado autorizado
Escucha con base, alcance y límites; sin perfilado sensible. **Gate:** sin base no se recoge; sin fuente no se concluye.

### RDS-C29 — Modelo de métricas y snapshots semánticos
Definición, ventana, fuente y frescura por métrica. **Gate:** `missing`/`zero`/`stale` distintos; sin sumar definiciones incompatibles.

### RDS-C30 — Reportes, atribución e infográficos con evidencia
Reporte con cobertura y límites; atribución declarada. **Gate:** sin identificación no se afirma causalidad. Checkpoint.

### RDS-C31 — Equipo agéntico especialista y modelos económicos
Reparto de agentes y coste por tarea. **Gate:** sin medición no se promete precio ni calidad.

### RDS-C32 — Visión multimodal y QA de piezas
Revisión de piezas con criterios declarados. **Gate:** QA no aprueba publicación ni sustituye revisión editorial.

### RDS-C33 — Visio Anam como atención del especialista
Presencia con scope y coste. **Gate:** el avatar no aprueba ni publica.

### RDS-C34 — SDK servidor, MCP y API Hono de negocio
SDK con tools nominadas y límites. **Gate:** sin capacidades de publicación libres para el modelo.

### RDS-C35 — Portal SaaS, dashboard y área de proyectos
Vista de calendario, revisión y estado real. **Gate:** estado `unknown` visible, nunca oculto como éxito. Checkpoint.

### RDS-C36 — Integración preferente con agente y cooperación entre servicios
WorkOrder, AuthorityMap y ACK entre servicios. **Gate:** sin ACK no hay handoff; sin permiso no hay datos.

### RDS-C37 — Privacidad, seguridad, legal y derechos del servicio
Base, retención, derechos y subencargados. **Gate:** export y supresión con revisión; restore no resucita permisos.

### RDS-C38 — Concurrencia, fallos distribuidos y propiedades
Dos workers, edición concurrente, caída a mitad. **Gate:** un solo efecto; propiedades verificadas, no argumentadas.

### RDS-C39 — Observabilidad, rendimiento y economía del servicio
Métricas sin PII, latencia y coste medidos. **Gate:** sin medición no hay SLA publicado.

### RDS-C40 — E2E: cliente integrado y externo con especialista en visio
Flujo completo en dos tenants con sink. **Gate:** cero fuga, cero publicación no aprobada, cero duplicado. Checkpoint.

### RDS-C41 — Empaquetado, Linux/Windows y operación segura
Instalación reproducible y runbook. **Gate:** instalación probada o `NOT_VERIFIED`; sin secretos en artefactos.

### RDS-C42 — Aceptación de servicio, informe founder y backlog 90 días
Inventario de evidencia, costes y pendientes. **Gate:** aceptación solo del alcance probado. Checkpoint final.

## 8. Pruebas previstas

Ninguna ejecutada. Casos clave: publicación duplicada por timeout; aprobación de versión anterior; cuenta equivocada; activo sin derechos; borrado que no propaga; webhook sin firma; métricas incompatibles sumadas; moderación automática sobre sátira; token con scope excesivo; restore con cola pendiente.

## 9. Decisiones pendientes

1. **Un canal primero.** Mastodon o Bluesky son los más verificables sin socio comercial; Meta y TikTok exigen cuenta y revisión.
2. **Postiz u propio.** Elegir uno; un adaptador propio sobre API oficial da control de idempotencia y auditoría.
3. **Voz de marca.** Quién aprueba, con qué guía y qué queda prohibido aunque el texto sea correcto.
4. **Derechos.** Fuente de licencias de imagen y música, y quién responde si falta.
5. **Promoción pagada.** Fuera del piloto mientras no haya presupuesto, cuenta publicitaria y control de gasto.

## 10. Resultado

Meta auditoría documental de 42 campañas, arquitectura, contratos y matriz de proveedores. **Sin código, sin conectores, sin publicaciones y sin cambios en el repositorio.** El diseño es sólido; su valor futuro depende de que el gate de publicación sea tan estricto como el de autorización.
