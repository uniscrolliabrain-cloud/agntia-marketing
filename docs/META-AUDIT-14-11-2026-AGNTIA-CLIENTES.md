# META AUDIT · Agntia Clientes · 14-11-2026

**Repositorio:** [uniscrolliabrain-cloud/agntia-clientes](https://github.com/uniscrolliabrain-cloud/agntia-clientes/tree/570b2abd0334af1ad7e8ec17c31638607289076e)
**Referencia:** `570b2abd0334af1ad7e8ec17c31638607289076e` · **Fecha de auditoría:** 14-11-2026
**Naturaleza:** meta auditoría documental. No es asesoramiento jurídico, certificación de seguridad ni acreditación de producto.

## 1. Veredicto en una frase

Diseño coherente y honesto sobre quién manda en una relación con clientes, pero **cero código**: todo lo que promete atender, medir o resolver está declarado `NOT_STARTED`, y el riesgo real no es que falle la máquina sino que un mensaje generado se envíe a un cliente real sin que nadie lo haya aprobado.

## 2. Qué es y qué hay

Empresa SaaS especialista en relación con clientes, atención multicanal y customer success, con twin vinculado a `agente`. El [README](https://github.com/uniscrolliabrain-cloud/agntia-clientes/blob/570b2abd0334af1ad7e8ec17c31638607289076e/README.md) declara `DOCUMENTATION_ONLY`: sin app, SDK, contenedores ni proveedores conectados. Sesenta y nueve archivos, todos Markdown salvo el manifest.

| Componente | Estado observado |
|---|---|
| Documentación (producto, arquitectura, seguridad, servicio, costes) | 9 documentos + 4 de arquitectura + contratos + runbook |
| Campañas | 42 documentos, 294 tareas, 84 escenarios, `NOT_STARTED` |
| Manifest | `campaign.json`, 196 KB |
| Código, tests, contenedores | **ninguno** |
| Proveedores conectados | **ninguno** (Chatwoot, Twenty, Frappe, Zammad solo como candidatos) |

Proveedores previstos: Chatwoot para bandeja, Twenty o Frappe CRM como alternativa, Frappe Helpdesk o Zammad para tickets, más puertos propios para no depender de ninguno. Correo transaccional, WhatsApp oficial, canal web y RAG versionado aparecen como fases, no como capacidades.

## 3. Hallazgos prioritarios

### P0.1 — Un contacto importado no es un permiso de contacto

La tentación del dominio es directa: importar contactos y conversaciones, deducir quién es cliente, y escribir. La importación debe conservar procedencia, finalidad y base de cada dirección, y un contacto existente no autoriza comunicaciones comerciales ni atención fuera del canal por el que se obtuvo. La fase C07 lo plantea como "finalidades, preferencias y permisos de comunicación"; el gate debe exigir que una preferencia retirada bloquee el envío **antes** de encolar, y otra vez inmediatamente antes del efecto, porque entre ambos momentos puede llegar una baja.

El repositorio acierta al separar atención de marketing, pero el documento no fija todavía cuánto sobrevive una baja a una restauración de copia ni cómo se propaga a índices, caché y colas. Eso debe ser requisito de C38, no una nota al pie.

### P0.2 — La respuesta propuesta puede llegar al cliente sin revisión

Todo el diseño gira sobre "propuesta → revisión → envío". El riesgo es que el camino corto exista: un `auto_send` para casos "simples", un botón que envía mientras el modelo sigue escribiendo, o una aprobación que sobrevive a un cambio del texto. La aprobación debe ir atada a hash del contenido final, versión del conocimiento usado, destinatario, canal, finalidad y caducidad; cualquier cambio material la invalida. Sin aprobación vinculada, el envío no es una capacidad del piloto.

Esto es especialmente delicado con IA: el documento promete "propuestas IA, idiomas y verificación" (C25). La verificación debe comprobar que la respuesta no afirma hechos que el conocimiento autorizado no sostiene, y debe dejar visible la frase sin respaldo en vez de reescribirla con seguridad.

### P0.3 — SLA sobre calendario equivocado

Un SLA es aritmética con consecuencias contractuales. Requiere calendario versionado, zona horaria, festivos por territorio, horas de cobertura y política de pausa (espera de cliente, dependencia de tercero). Si falta cualquiera, el vencimiento es una propuesta, no un compromiso. El cálculo debe ser determinista y reproducible, con el mismo motor usado en informes y en el routing, para que no haya dos relojes.

Riesgo concreto y frecuente: medir el SLA en horas naturales cuando el contrato dice laborables, o al contrario. El sistema debe mostrar explícitamente qué calendario aplicó y marcar `unknown` si el contrato es ambiguo, en lugar de elegir el más favorable.

### P0.4 — RAG sin aislamiento es una fuga con buena redacción

El conocimiento versionado y el RAG autorizado (C24) son la superficie más peligrosa después del envío. La recuperación debe aplicar el mismo filtro de tenant y de recurso que la API, antes y después de buscar: filtrar después de recuperar ya ha leído lo ajeno. Un artículo de ayuda de un cliente no puede aparecer en la respuesta de otro, ni en un resumen, ni en una métrica agregada, ni en el prompt del modelo.

Los documentos internos son además datos no fiables: un PDF de cliente puede contener instrucciones dirigidas al agente. El diseño lo dice para documentos en general; debe aplicarse explícitamente a la base de conocimiento, que es donde más se relaja la vigilancia.

### P0.5 — Señales de customer success presentadas como hechos

"Riesgo de relación" y "customer success y señales explicables" (C30) son donde un modelo de lenguaje produce frases plausibles y difíciles de refutar: *el cliente está molesto, va a irse, valora el precio*. Sin una definición operacional —qué señal, con qué fuente, en qué ventana, con qué umbral— eso es opinión con formato de panel. Cada señal debe declarar su cálculo, su cobertura y su incertidumbre, y nunca convertirse en acción automática sobre la cuenta (rebaja, prioridad, escalado) sin decisión humana.

### P0.6 — Canales con capacidad no confirmada

WhatsApp oficial (C20) y el writeback a Chatwoot (C14) son los dos puntos donde el sistema puede creer que tiene una capacidad que no tiene: número no verificado, plantilla no aprobada, ventana de 24 horas cerrada, token sin el scope necesario. El `CapabilityReport` por versión y rol es el control correcto, pero debe **bloquear** el envío cuando el estado es `unknown`, no degradar a un aviso.

El writeback merece regla propia: escribir en la bandeja del proveedor es un efecto externo visible para agentes humanos. Un timeout tras la escritura deja incertidumbre; reconciliar por referencia, no reintentar a ciegas ni escribir por otra vía.

### P1 — Operación, coste y pruebas

- El correo transaccional y el threading (C19) fallan de formas silenciosas: respuestas que se agrupan mal, duplicados por reintento, hilos partidos por cambio de asunto. Probar con rebotes, auto-respuestas y bucles.
- Las cuotas y el backpressure (C37) deben impedir que un pico de conversaciones consuma el presupuesto del tenant sin aviso.
- El portal (C33) y la presencia Anam (C32) muestran estado; no deben presentar al avatar como agente humano ni como responsable del caso.
- El handoff humano (C28) necesita ACK: una conversación "transferida" sin confirmación es una conversación abandonada.

## 4. Modelo de dominio: qué conserva cada objeto

| Objeto | Conserva | No acredita |
|---|---|---|
| `ContactRecord` | identidad, procedencia, canal de origen, finalidad. | permiso para escribir por otro canal ni consentimiento comercial. |
| `Conversation` | mensajes, canal, participantes, estado y evidencias. | que el interlocutor sea el titular de la cuenta. |
| `Ticket` | caso, prioridad, SLA aplicado y responsable. | resolución ni conformidad del cliente. |
| `SlaClock` | calendario, zona, festivos, pausas y vencimiento calculado. | compromiso contractual si el contrato es ambiguo. |
| `KnowledgeArticle` | versión, autor, vigencia y ámbito. | aplicabilidad a un caso concreto. |
| `ResponseProposal` | texto, fuentes citadas, idioma y advertencias. | aprobación ni envío. |
| `ApprovalBinding` | hash del contenido, destinatario, canal, caducidad. | permiso si el contenido cambió después. |
| `RelationshipSignal` | definición, fuente, ventana, valor y confianza. | predicción de fuga ni motivo real. |

**Ejemplo sintético:** entra una consulta de un contacto importado desde un CSV de hace dos años. El sistema muestra la procedencia, no encuentra base para responder por correo y propone contestar por el canal de origen. El SLA se calcula con calendario laboral europeo, porque el contrato lo dice, y muestra el festivo que desplaza el vencimiento. La propuesta de respuesta cita dos artículos vigentes; el tercero que el modelo quería usar está restringido a otro tenant y no aparece. Nadie envía nada hasta que una persona con permiso sobre esa cuenta aprueba el texto exacto. Es un ejemplo conceptual, no una ejecución del producto.

## 5. Arquitectura y boilerplate previstos

El repositorio propone TypeScript/Hono/Supabase con Postgres. No existe app ni lockfile. Estas rutas son **propuestas de esta auditoría**, no archivos existentes:

```text
apps/api/src/                 # rutas nominadas, principal, policy y ACL
apps/worker/src/              # jobs, SLA, outbox y reconciliación
apps/portal/                  # bandeja, caso, propuesta y revisión
packages/contracts/src/       # DTOs, errores y validación runtime
packages/auth/src/            # JWT, membership, ACL y mandato
packages/crm/src/             # contacto, cuenta, procedencia y permisos
packages/inbox/src/           # canales, threading y deduplicación
packages/sla/src/             # calendario versionado y reloj único
packages/knowledge/src/       # versiones, ámbito y recuperación autorizada
packages/reply/src/           # propuesta, verificación y aprobación
packages/cs/src/              # señales definidas y renovación
packages/adapters/src/        # Chatwoot, CRM, helpdesk y correo
migrations/                   # RLS, FK compuestas y pruebas de roles
```

**Fronteras:** el portal pide; el servidor resuelve principal, membership, ACL y mandato. El modelo recibe contexto minimizado y devuelve propuesta, nunca decide envío. El worker revalida permiso y versión justo antes de escribir. La bandeja externa es frontera separada, con capacidad, versión y rol declarados. `agente` conserva la identidad canónica; el twin no duplica memorias de clientes.

**Estados propuestos:** `intake → triage → awaiting_facts → draft → human_review → approved → queued → sent → acknowledged → resolved`, con `blocked`, `stale` y `reopened`. Un `sent` sin ACK del proveedor es `outcome_unknown`, no entrega confirmada.

## 6. Agentes y gates

Los agentes preparan, clasifican y redactan; no envían, no cierran casos y no modifican datos de la cuenta sin aprobación. Reparto sugerido: coordinación congela SHAs; seguridad valida aislamiento; dominio implementa bandeja, SLA y conocimiento; integración prueba Chatwoot/CRM con versión real; QA adversarial construye fixtures de baja, duplicado y fuga; una persona responsable de servicio revisa tono, política y escalado.

Cada fase futura: leer ficha y entrada del manifest; congelar SHAs; definir tipos e invariantes; implementar; ejecutar; registrar evidencia sanitizada; declarar `PASS`, `BLOCKED` o `NOT_VERIFIED`. Checkpoints tras C05, C10, C15, C20, C25, C30, C35, C40 y C42. Un fake verde no cierra un gate de proveedor.

## 7. Plan de las 42 campañas

Fichas de esta auditoría derivadas del índice del repositorio; **no transcriben las tareas del manifest** y todas siguen `NOT_STARTED`.

### CLT-C01 — Baseline y perímetro de solo lectura
Fijar SHAs, fuentes y vertical sintética; inventariar qué se leerá y qué nunca. **Gate:** entorno reproducible y capacidades no verificadas desactivadas.

### CLT-C02 — Modelo de dominio y autoridad
Definir contacto, cuenta, conversación, caso y quién decide cada efecto. **Gate:** un solo dueño por campo y por efecto; conflicto de autoridad bloquea.

### CLT-C03 — Autenticación Supabase y principal
JWT con firma, issuer, audience y tiempos; membership desde servidor. **Gate:** token inválido o tenant ajeno no lee; sin `user_metadata` como permiso.

### CLT-C04 — Twin y trazabilidad nativa
Mapear actor, runtime, rol y procedencia sin crear registro soberano. **Gate:** sin memorias de clientes compartidas; cotejo contra el SHA del padre.

### CLT-C05 — DTOs y contratos runtime
Esquemas estrictos, IDs opacos, fechas con zona, versiones y errores sanitizados. **Gate:** rechazo de extras e inválidos; sin PII en mensajes. Checkpoint.

### CLT-C06 — Postgres, RLS y migraciones
Tablas por tenant, FK compuestas, RLS y migraciones reversibles. **Gate:** con roles reales, A no alcanza B ni un recurso restringido propio.

### CLT-C07 — Finalidades, preferencias y permisos de comunicación
Registrar base, finalidad y preferencias por canal; bajas con propagación. **Gate:** preferencia retirada bloquea el envío antes de encolar y antes del efecto.

### CLT-C08 — Acuerdos, entitlements y encargos
Contrato, cuota, alcance y responsable por encargo. **Gate:** función sin entitlement habilitado responde `forbidden`, no degrada.

### CLT-C09 — Registro de proveedores, OAuth y secretos
Conexión por ámbito, secretos solo en servidor, scopes mínimos. **Gate:** sin token en logs; rotación sin perder vínculos.

### CLT-C10 — Discovery y capacidades verificadas
`CapabilityReport` por versión, edición y rol. **Gate:** `unknown` bloquea la operación; un 200 con HTML no es salud. Checkpoint.

### CLT-C11 — Directorio y resolución de identidad
Unificar personas entre canales sin fusionar identidades por nombre. **Gate:** coincidencia dudosa queda pendiente; no se crea un contacto nuevo por un typo.

### CLT-C12 — Importación, staging y sync
Importar con procedencia, conflictos y campos pendientes; repetición idempotente. **Gate:** importar no concede permiso de contacto ni crea membresía.

### CLT-C13 — Chatwoot lectura y bindings
Leer conversaciones con ACL y versión del proveedor. **Gate:** sin permiso no se cae a admin; empresa equivocada no es dato válido.

### CLT-C14 — Chatwoot writeback seguro
Escribir con intent durable, idempotencia y reconciliación. **Gate:** timeout deja `outcome_unknown`; no se duplica por reintento ni por otra vía.

### CLT-C15 — CRM Twenty opcional
Adaptador con campos mínimos y mapeo declarado. **Gate:** CRM ausente no bloquea la bandeja; el adaptador no se presenta como instalado. Checkpoint.

### CLT-C16 — Frappe CRM y Helpdesk alternativos
Comparar con criterios de licencia, ACL y edición. **Gate:** solo una vía de piloto habilitada; el resto deshabilitado y declarado.

### CLT-C17 — Zammad y portabilidad de helpdesk
Evaluar migración y salida sin pérdida de historia. **Gate:** export reproducible; sin dependencia irreversible del proveedor.

### CLT-C18 — Canal web y sesiones de contacto
Sesión de visitante, minimización y consentimiento por finalidad. **Gate:** la sesión no hereda permisos de un usuario autenticado ni al revés.

### CLT-C19 — Correo transaccional y threading
Envío con referencia, agrupación por cabeceras y rebotes. **Gate:** auto-respuesta y rebote no abren ticket nuevo ni duplican hilo.

### CLT-C20 — WhatsApp oficial bajo capacidad confirmada
Plantillas aprobadas, ventana de servicio y número verificado. **Gate:** ventana cerrada o plantilla no aprobada impide el envío. Checkpoint.

### CLT-C21 — Inbox, webhooks y evidencia adjunta
Ingesta firmada, deduplicada y con evidencia anclada. **Gate:** webhook sin firma se rechaza; adjunto conserva hash y procedencia.

### CLT-C22 — Casos y contrato de resolución
Definir qué significa resolver y quién puede declararlo. **Gate:** ninguna resolución automática sin criterio verificable y responsable.

### CLT-C23 — SLA, calendario y routing determinista
Reloj único con calendario, zona, festivos y pausas; routing por regla. **Gate:** mismo cálculo en API, informes y alertas; ambigüedad produce `unknown`.

### CLT-C24 — Conocimiento versionado y RAG autorizado
Artículos con versión, ámbito y vigencia; recuperación filtrada antes y después. **Gate:** cero fragmentos de otro tenant o de recurso restringido. Checkpoint.

### CLT-C25 — Propuestas IA, idiomas y verificación
Propuesta con fuentes citadas y frases sin respaldo visibles. **Gate:** no se afirma hecho no sostenido; idioma declarado y revisado realmente.

### CLT-C26 — Preview y aprobaciones de efecto
Aprobación ligada a hash, destinatario, canal y caducidad. **Gate:** cambio material o revocación invalida; sin aprobación no hay envío.

### CLT-C27 — Jobs, outbox y reconciliación
Intent, lease, outbox y ACK tras commit. **Gate:** replay no duplica; entrega duplicada no genera dos mensajes.

### CLT-C28 — Handoff humano y coordinación
Transferencia con ACK, responsable y contexto mínimo. **Gate:** handoff sin ACK queda pendiente; no hay dos personas creyendo que atienden.

### CLT-C29 — Onboarding y playbooks de servicio
Secuencia de alta, checklist y expectativas por plan. **Gate:** el cliente sabe qué está activo y qué no; sin promesas de capacidad no probada.

### CLT-C30 — Customer success y señales explicables
Señales con definición, fuente, ventana y confianza. **Gate:** ninguna señal se presenta como predicción cierta ni dispara acción sola. Checkpoint.

### CLT-C31 — Renovaciones, reclamaciones y propuestas comerciales
Propuesta versionada y reclamación con evidencia. **Gate:** propuesta no es pedido; reclamación no promete resultado.

### CLT-C32 — Anam como presencia del twin
Presencia con scope, coste y privacidad; mismo enforcement. **Gate:** el avatar no se presenta como humano ni como responsable del caso.

### CLT-C33 — Portal responsive y revisión humana
Vista de bandeja, caso y propuesta con estado y procedencia. **Gate:** cambio de usuario o tenant cierra contexto y revalida acceso.

### CLT-C34 — SDK TypeScript, Hono y tools nominadas
SDK de servidor y allowlist de operaciones. **Gate:** sin método libre de HTTP/SQL ni envío expuesto al modelo.

### CLT-C35 — Bridge del padre y eventos interoperables
Mapeo de eventos con provenance y ACK. **Gate:** sin enum host inventado; sin ACK no hay handoff. Checkpoint.

### CLT-C36 — Observabilidad, métricas y reportes
Métricas con cobertura y sin PII en etiquetas. **Gate:** un agregado pequeño no revela un caso; sin medición no se prometen tiempos.

### CLT-C37 — Costes, cuotas y backpressure
Presupuesto por tenant, reserva y degradación explícita. **Gate:** pico no consume el presupuesto sin aviso ni corta servicio en silencio.

### CLT-C38 — Derechos, retención y salida del servicio
Export, supresión y retención con revisión; propagación a índices y copias. **Gate:** restore no resucita datos ni permisos retirados.

### CLT-C39 — Seguridad adversarial y aislamiento
BOLA entre y dentro de tenants, prompt injection en documentos, canarios, export. **Gate:** cualquier fuga detiene; solo datos sintéticos.

### CLT-C40 — Evaluaciones y vertical E2E reproducible
Dos tenants, tres actores, propuesta, aprobación, envío a sink y ACK. **Gate:** cero fuga, cero envío no aprobado, `outcome_unknown` reconciliado. Checkpoint.

### CLT-C41 — Operaciones, CI y release controlada
CI reproducible, alertas, runbook y restore probado. **Gate:** sin restore no hay readiness; feature flag no revierte mensajes enviados.

### CLT-C42 — Aceptación, informe y entrega a otra IA
Inventario de SHA, gates, tests, costes y pendientes. **Gate:** aceptación solo del alcance probado; lo no verificado queda visible. Checkpoint final.

## 8. Pruebas previstas

Ninguna de producto se ejecutó en esta auditoría.

| Riesgo | Caso | Criterio |
|---|---|---|
| Envío sin permiso | Baja durante la cola; aprobación de otra versión; destinatario cambiado. | Bloqueo en ambos puntos; sin mensaje. |
| SLA | Festivo, zona, contrato ambiguo, pausa por tercero. | Cálculo reproducible y `unknown` cuando falte dato. |
| Fuga RAG | Artículo de otro tenant; recurso restringido; agregado pequeño. | Cero aparición en respuesta, log o informe. |
| Threading | Rebote, auto-respuesta, reasunto, duplicado por reintento. | Un solo hilo, sin ticket espurio. |
| Proveedor | Timeout tras escritura; token sin scope; versión distinta. | `outcome_unknown` reconciliado; capacidad deshabilitada. |
| Señales | Muestra insuficiente; dato faltante; sesgo de canal. | Señal declarada incierta; sin acción automática. |

## 9. Decisiones pendientes

1. **Alcance del piloto:** ¿atención solamente, o también propuestas comerciales? Lo segundo exige base jurídica y control de oposición desde el primer día.
2. **Canal inicial:** uno solo, con capacidad verificada. Elegir Chatwoot como bandeja o construir puerto propio, no ambos.
3. **Base de conocimiento:** quién la mantiene, con qué vigencia y quién responde de un artículo obsoleto.
4. **Responsable de servicio:** quién revisa, con qué horario y qué SLA se promete realmente.
5. **Datos:** retención de conversaciones y adjuntos, subencargados y tratamiento por modelo.

## 10. Resultado

Meta auditoría documental de 42 campañas, contratos, arquitectura y seguridad. **No se ejecutó producto, no se conectó ningún proveedor y no se modificó el repositorio.** El plan es defendible; lo que falta es todo lo demás, y el gate que más importa es el que impide enviar sin aprobación.
