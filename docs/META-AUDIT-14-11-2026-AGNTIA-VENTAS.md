# META AUDIT · Agntia Ventas · 14-11-2026

**Repositorio:** [uniscrolliabrain-cloud/agntia-ventas](https://github.com/uniscrolliabrain-cloud/agntia-ventas/tree/adcf65cce3cbdc2cb4bd65b0607a6537dc12b69f)
**Referencia:** `adcf65cce3cbdc2cb4bd65b0607a6537dc12b69f` · **Fecha de auditoría:** 14-11-2026
**Naturaleza:** meta auditoría documental. No es asesoramiento comercial, fiscal ni jurídico.

## 1. Veredicto en una frase

De los tres planes documentales pendientes, es el que más se parece a un producto real de mercado —CRM, catálogo, precios, CPQ, propuestas, firma— y por eso el más expuesto: **un descuento mal calculado o una cotización enviada con precio caducado no es un bug de interfaz, es una pérdida de margen o un incumplimiento contractual**.

## 2. Qué es y qué hay

Empresa SaaS de operaciones comerciales: convertir oportunidades autorizadas en trabajo verificable (CRM, pipeline, reuniones, propuestas, seguimiento) sin que la presión por vender se convierta en permiso. Sesenta y nueve archivos Markdown y JSON; **cero código**.

| Componente | Estado observado |
|---|---|
| Documentación | 9 documentos + 4 de arquitectura + contratos + runbook + 3 de research |
| Campañas | 42 documentos, 294 tareas, 84 escenarios, `NOT_STARTED` |
| Manifest | `campaign.json`, 324 KB |
| Código, tests | **ninguno** |
| CRM | Twenty, Frappe, Espo, Suite — candidatos |

Límite declarado y correcto: sin mensajes comerciales reales, sin alta automática de leads por scraping, sin firma, sin cobro y sin descuentos fuera de mandato durante el piloto. Cotizar y enviar son capacidades distintas; datos públicos no prueban permiso para contactar.

## 3. Hallazgos prioritarios

### P0.1 — Dinero: `Decimal`, versión y redondeo declarado

El precio es la parte del sistema donde un error es dinero. Cantidades y precios deben ser decimales exactos con divisa y exponente explícitos; los impuestos, descuentos y redondeos tienen regla versionada y orden de aplicación definido (¿descuento antes o después de impuesto? ¿por línea o por total?). El redondeo del total no puede calcularse distinto en la cotización, el pedido y la factura futura.

Un `Pricebook` debe llevar vigencia. Una tarifa caducada no se usa "porque es la última que hay": produce `blocked` o propuesta marcada como tal. Es el equivalente comercial del endoso posterior en seguros.

### P0.2 — El descuento es un mandato, no un campo

C20 existe precisamente por esto. Un mandato de descuento fija techo, base de cálculo, vigencia, aprobador y motivo. Un LLM no concede descuento; una propuesta de descuento requiere aprobación humana ligada al porcentaje exacto, al cliente y a la versión de la cotización. Cambiar una línea invalida la aprobación del descuento.

Riesgo típico que el documento debe blindar: descuentos que se acumulan (comercial + campaña + pronto pago) superando el techo aunque cada uno por separado esté permitido. El control es sobre el descuento efectivo total.

### P0.3 — Contactar no es un permiso, y el scraping no lo crea

El README lo dice: datos públicos no prueban permiso para contactar. Hay que operacionalizarlo. Cada candidato necesita base, origen, fecha y finalidad; una oposición (C25) debe propagarse a secuencias, correo, CRM y cualquier export antes del siguiente envío, y comprobarse otra vez justo antes de mandar. Comprar listas, scrapear en masa o inferir vulnerabilidad queda fuera por diseño, no por buena intención del prompt.

La secuencia automatizada es el punto donde más fácil se ignora una baja: un job encolado el lunes puede ejecutarse el miércoles después de la oposición del martes. La revalidación inmediata antes del efecto es obligatoria.

### P0.4 — Firma y pedido: puertos, no atajos

C22 trata la firma electrónica "como puerto" y C29 el pedido con handoff. Es la decisión correcta: la firma es un acto jurídico con requisitos propios (identidad, consentimiento, evidencia, conservación) y no debe implementarse como un botón. El piloto no firma, no cobra y no compromete entrega.

Un pedido enviado sin aprobación es el equivalente comercial de publicar sin revisar: visible, difícil de retirar y con consecuencias contractuales. Requiere el mismo binding —hash de propuesta, cliente, importe, condiciones, caducidad— y ACK del sistema receptor.

### P0.5 — Forecast y cohortes: no son hechos

C28 y C32 producen previsiones y métricas. Una previsión no es un ingreso; un pipeline ponderado no es caja; una cohorte con muestra pequeña no es tendencia. Cada cifra debe declarar definición, ventana, fuente, supuestos y cobertura, y distinguir lo comprometido de lo especulativo. La etapa del pipeline la mueve una persona o una regla explícita, no la confianza del modelo.

Prohibido explícito: presentar «probabilidad de cierre» generada por el modelo como dato, o convertir un importe ponderado en previsión de tesorería.

### P0.6 — Correo comercial y reuniones: identidad y consentimiento

C23 y C24 cubren calendario y correo supervisado. Enviar en nombre de una persona requiere su identidad verificada, su firma real y su permiso; un agente no redacta "como si" fuera el comercial y envía. Las invitaciones de calendario crean eventos en agendas ajenas: hora, zona, asistentes y cancelación deben ser exactos, y un cambio debe notificarse.

El contenido entrante (respuestas, rebotes, auto-respuestas) es dato no fiable: no puede modificar el estado del pipeline ni disparar acciones por sí solo.

## 4. Modelo de dominio

| Objeto | Conserva | No acredita |
|---|---|---|
| `DirectoryEntry` | identidad, organización, procedencia. | permiso de contacto. |
| `ConsentRecord` | base, canal, fecha, finalidad y retirada. | autorización para otro canal o fin. |
| `Opportunity` | cuenta, etapa, importe, probabilidad declarada. | ingreso ni cierre. |
| `PricebookVersion` | tarifas, vigencia, divisa y reglas. | cotización válida tras caducar. |
| `Quote` / `QuoteVersion` | líneas, impuestos, descuentos y redondeo. | pedido ni aceptación del cliente. |
| `DiscountMandate` | techo, base, aprobador y vigencia. | descuento acumulado permitido. |
| `Proposal` | condiciones, versión y entregables. | firma ni compromiso de entrega. |
| `ForecastRun` | escenario, supuestos y ventana. | caja ni previsión garantizada. |
| `OrderHandoff` | contenido, destinatario y ACK. | pedido aceptado sin ACK. |

**Ejemplo sintético:** una oportunidad de 24.000 EUR pide un 18 % de descuento. El mandato permite hasta 15 % sin aprobación; el sistema no aplica el 18 %, muestra el exceso y pide aprobación humana sobre esa cotización concreta. La tarifa usada caduca en tres días, y la cotización lo advierte. Al cambiar una línea, la aprobación anterior queda invalidada. Nadie envía ni firma. Es un ejemplo conceptual.

## 5. Arquitectura y boilerplate previstos

Propuesta TypeScript/Hono/Supabase. Rutas sugeridas, no existentes:

```text
apps/api/src/                # API nominada, policy y ACL
apps/worker/src/             # jobs, secuencias, outbox
apps/portal/                 # pipeline, cotización, propuesta y revisión
packages/contracts/src/      # DTOs, Money y validación
packages/auth/src/           # JWT, membership y mandato
packages/crm/src/            # directorio, oportunidad y actividad
packages/pricing/src/        # pricebook, CPQ, impuestos y redondeo
packages/discounts/src/      # mandatos y aprobación
packages/proposals/src/      # propuesta, versiones y firma como puerto
packages/outreach/src/       # correo, secuencias y oposición
packages/forecast/src/       # escenarios y cohortes
packages/adapters/src/       # CRM y firma
migrations/                  # RLS, FK compuestas, pruebas de roles
```

**Estados:** `candidate → accepted → qualified → quoted → proposed → negotiating → won|lost`, con `blocked`, `stale` y `opt_out`. `quoted` no implica `proposed`, y `proposed` no implica `signed`.

## 6. Agentes y gates

Los agentes investigan, preparan y redactan; no envían, no descuentan, no firman y no mueven etapa sin regla. Reparto: coordinación, seguridad, dominio (precio y descuento), integración CRM, QA adversarial y un responsable comercial que aprueba precio, propuesta y envío. Checkpoints tras C05, C10, C15, C20, C25, C30, C35, C40 y C42.

## 7. Plan de las 42 campañas

Fichas derivadas del índice; todos los gates siguen `NOT_EXECUTED`.

### VEN-C01 — Baseline, fuentes y alcance
Fijar SHAs, alcance y vertical sintética. **Gate:** entorno reproducible; capacidades no probadas desactivadas.

### VEN-C02 — Autoridad por dominio y contrato SaaS
Quién decide precio, propuesta, envío y pedido. **Gate:** un dueño por efecto; conflicto bloquea.

### VEN-C03 — Supabase JWT y principal
Firma, issuer, audience y tiempos; membership de servidor. **Gate:** tenant ajeno no lee; sin fallback.

### VEN-C04 — Twins y nomenclatura canónica
Identidad y provenance sin registro soberano nuevo. **Gate:** sin memorias de clientes; cotejo del padre.

### VEN-C05 — DTOs, esquemas y errores
Contratos estrictos con `Money` decimal y errores sanitizados. **Gate:** extras rechazados; sin PII en mensajes. Checkpoint.

### VEN-C06 — Persistencia, RLS y migraciones
Tablas por tenant, FK compuestas y audit separado. **Gate:** aislamiento con roles reales.

### VEN-C07 — Mandatos, finalidad y aprobaciones
Mandato por encargo; aprobación ligada a contenido y versión. **Gate:** revocación detiene trabajo.

### VEN-C08 — Secretos, discovery y aislamiento remoto
Secretos en servidor, conexión por ámbito, capability report. **Gate:** `unknown` deshabilitado.

### VEN-C09 — Directorio y representación
Persona, organización y representación verificadas. **Gate:** importar no crea membresía ni permiso.

### VEN-C10 — Candidatos y aceptación
Candidato con base, origen y finalidad; aceptación humana. **Gate:** sin base no se contacta. Checkpoint.

### VEN-C11 — Pipeline y etapas
Etapas con regla de transición y responsable. **Gate:** la etapa no la mueve el modelo.

### VEN-C12 — Triage y cualificación
Cualificación con criterios declarados. **Gate:** puntuación no es hecho ni prioriza por atributo sensible.

### VEN-C13 — Fuentes y contexto de cuenta
Contexto con fuente, fecha y cobertura. **Gate:** sin fuente no hay afirmación sobre la cuenta.

### VEN-C14 — Adaptador CRM Twenty
Campos mínimos, mapeo declarado y ACL. **Gate:** versión real o `NOT_VERIFIED`.

### VEN-C15 — Adaptadores Frappe/Espo/Suite
Comparar licencia y aislamiento. **Gate:** una sola vía habilitada. Checkpoint.

### VEN-C16 — Import y conflictos
Staging con conflictos y repetición idempotente. **Gate:** duplicado no crea segunda cuenta.

### VEN-C17 — Catálogo y disponibilidad
Producto, vigencia y disponibilidad real. **Gate:** producto retirado no se cotiza.

### VEN-C18 — Pricebook y tarifas
Tarifas versionadas con vigencia y divisa. **Gate:** tarifa caducada bloquea cotización.

### VEN-C19 — CPQ y redondeo
Cálculo determinista con orden de impuestos y descuentos. **Gate:** mismo resultado en cotización y pedido.

### VEN-C20 — Mandatos de descuento
Techo, base, acumulación y aprobador. **Gate:** exceso requiere aprobación humana sobre ese importe. Checkpoint.

### VEN-C21 — Propuesta y versiones
Propuesta versionada con condiciones y caducidad. **Gate:** propuesta != pedido; cambio invalida aprobación.

### VEN-C22 — Firma electrónica como puerto
Interfaz con requisitos de identidad y evidencia. **Gate:** el piloto no firma; puerto sin implementar declarado.

### VEN-C23 — Reuniones y calendario
Hora, zona, asistentes y cancelación. **Gate:** invitación exacta; error no crea evento huérfano.

### VEN-C24 — Correo comercial supervisado
Envío con identidad verificada y aprobación. **Gate:** sin aprobación no sale; rebote no dispara secuencia.

### VEN-C25 — Secuencias y oposición
Oposición propagada y revalidada antes del efecto. **Gate:** encolado el lunes, baja el martes, no se envía. Checkpoint.

### VEN-C26 — Inbox y toma humana
Respuestas con deduplicación y toma de control. **Gate:** dos personas no responden a la vez.

### VEN-C27 — Actividad y receipts
Actividad real con receipt o `unknown`. **Gate:** sin receipt no se declara entregado.

### VEN-C28 — Forecast y escenarios
Escenarios con supuestos, ventana y sensibilidad. **Gate:** previsión no es caja ni hecho.

### VEN-C29 — Pedido y handoff operativo
Pedido con contenido, destinatario y ACK. **Gate:** sin ACK queda pendiente; no se duplica.

### VEN-C30 — Renovación y expansión
Renovación con condiciones nuevas y aprobación. **Gate:** no hereda precio ni condiciones por defecto. Checkpoint.

### VEN-C31 — QA de conversación comercial
Revisión de conversación con criterios y evidencia. **Gate:** QA no aprueba ni sustituye al responsable.

### VEN-C32 — Métricas comerciales y cohortes
Definición, ventana y muestra mínima. **Gate:** cohorte pequeña declarada incierta; sin suma de definiciones distintas.

### VEN-C33 — Reportes, dashboard e infografías
Reporte con cobertura y límites. **Gate:** agregado pequeño no revela cuenta.

### VEN-C34 — Portal responsive, chat y Anam
Estado real, procedencia y revisión. **Gate:** el avatar no negocia precio ni compromete entrega.

### VEN-C35 — SDK TypeScript, Hono y tools
Tools nominadas con allowlist. **Gate:** sin envío, descuento ni firma expuestos al modelo. Checkpoint.

### VEN-C36 — Bridge de agente y eventos
Eventos con provenance y ACK. **Gate:** sin enum inventado; sin ACK no hay handoff.

### VEN-C37 — Cooperación y handoff empresarial
WorkOrder y AuthorityMap entre servicios. **Gate:** sin permiso no hay datos; un solo ejecutor.

### VEN-C38 — Modelos, coste y observabilidad
Coste medido y logs sin PII. **Gate:** sin medición no se promete precio ni rendimiento.

### VEN-C39 — Privacidad y pruebas adversariales
BOLA, prompt injection, canarios, export y oposición tardía. **Gate:** cualquier fuga detiene.

### VEN-C40 — Vertical E2E y fallos distribuidos
Candidato → cotización → aprobación → envío a sink → ACK. **Gate:** cero envío no aprobado, cero duplicado, `unknown` reconciliado. Checkpoint.

### VEN-C41 — Operaciones, CI, backup y release
CI reproducible, alertas y restore probado. **Gate:** sin restore no hay readiness.

### VEN-C42 — Aceptación, evidencia y handoff final
Inventario de evidencia y pendientes. **Gate:** aceptación solo de lo probado. Checkpoint final.

## 8. Pruebas previstas

Ninguna ejecutada. Casos: descuento acumulado sobre techo; tarifa caducada; redondeo distinto entre cotización y pedido; oposición durante la cola; cotización aprobada y luego editada; pedido duplicado por reintento; invitación con zona errónea; previsión presentada como caja.

## 9. Decisiones pendientes

1. **Un CRM.** Twenty como candidato principal; importación desde CSV como suelo mínimo.
2. **Impuestos y redondeo.** Regla única, versionada y probada con casos límite antes de cotizar.
3. **Quién aprueba precio.** Persona, umbral y segregación de funciones.
4. **Base jurídica del contacto.** Qué canales y qué supuestos; oposición desde el primer día.
5. **Fuera del piloto.** Firma, cobro, pedido real y promoción pagada.

## 10. Resultado

Meta auditoría documental de 42 campañas. **Sin código, sin CRM conectado, sin envíos y sin cambios en el repositorio.** El plan es el más comercialmente ambicioso del conjunto y, por eso, el que más necesita que el gate del dinero y el de la oposición sean bloqueantes desde la fase 18.
