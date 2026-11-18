# META AUDIT · Agntia Ciberseguridad · 14-11-2026

**Repositorio:** [uniscrolliabrain-cloud/agntia-ciberseguridad](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/tree/2bdeb41dc290c0a6778900dcbdab1e308c245516)
**Referencia:** `2bdeb41dc290c0a6778900dcbdab1e308c245516` · **Fecha de auditoría:** 14-11-2026
**Naturaleza:** meta auditoría documental y de validador. No es auditoría de seguridad, ni pentest, ni certificación. **No se ha escaneado ningún sistema.**

## 1. Veredicto en una frase

Es el repositorio con mejor higiene de honestidad de los ocho —su propio validador declara `security_scans_executed: 0`— y su riesgo no es técnico sino de promesa: **un informe de seguridad mal redactado se lee como certificación aunque diga lo contrario en la letra pequeña**.

## 2. Qué es y qué hay

Middleware de ciberseguridad tradicional y agéntica: inventario de activos autorizados, evidencias, auditorías, control de acciones de agentes y remediaciones revisables. Cincuenta y dos archivos: documentación extensa, un manifiesto de campaña, configuración de planes y un único script de validación.

| Componente | Estado observado |
|---|---|
| Documentación | 12 documentos numerados + ADR + research (papers, compañías, fuentes) |
| Campaña | `docs/campaigns/2026-11-10-seven-days/`, 42 fases (D1P1–D7P6), 294 tareas, 84 escenarios |
| Manifest | `campaign.json` con `execution_state` y `phase_count: 42` |
| Código de producto | **ninguno**; solo `scripts/validate_foundation.py` |
| Scanners instalados o ejecutados | **ninguno** |
| Licencia del código propio | pendiente de elección por el propietario |

**Comprobación ejecutada en esta auditoría (14-11-2026):** `python3 scripts/validate_foundation.py` → `{"status": "PASS", "scope": "documentation, repository metadata and planned budget consistency only", "markdown_files": 35, "repository_metadata_records": 31, "security_scans_executed": 0, "words": 30397}`. Es decir: los enlaces locales, el JSON, el catálogo y la coherencia del presupuesto cuadran. **No dice nada sobre la seguridad de nada.** El propio script lo declara, y eso es exactamente lo que se le pediría a un repositorio de seguridad.

Nota de estructura: es el único del conjunto que organiza la campaña por días (siete) en lugar de por fases numeradas, con 6 fases por día. Mantiene el «no es una promesa de terminar en una semana» de forma explícita.

## 3. Hallazgos prioritarios

### P0.1 — Un hallazgo sin evidencia es una opinión con severidad

El núcleo del producto es emitir `findings`. Un hallazgo debe conservar: regla o comprobación que lo produjo y su versión, activo y commit o artefacto exacto, ruta y línea, evidencia reproducible, fecha, herramienta y versión, y estado de revisión humana. Sin eso no es accionable y, peor, no es defendible ante el cliente ni ante un tercero.

Prohibiciones que el diseño debe hacer ejecutables, no retóricas: no inflar severidad para parecer útil, no presentar un resultado de scanner como veredicto, no declarar «sin vulnerabilidades» por ausencia de hallazgos —la ausencia de prueba no es prueba de ausencia—, y no cerrar un hallazgo sin retest o waiver firmado.

### P0.2 — Escanear tiene base legal y alcance; el «sí» del cliente no basta

Un scanner que toca sistemas ajenos es una actividad con consecuencias: puede tumbar un servicio, alterar datos o violar términos. El diseño acierta al exigir inventario de activos autorizados (D1P5) y autorización de trabajo. Debe concretar: quién autoriza, con qué documento, para qué activos y ventana, con qué límites de intensidad, y cómo se detiene. Escanear un dominio del que el cliente es «responsable» pero no titular, o un SaaS de terceros que aparece en su inventario, es el error clásico.

La remediación autónoma queda fuera: proponer un parche es aceptable; aplicarlo sin aprobación, no. Y un parche aplicado no se revierte con un botón.

### P0.3 — El repositorio del cliente es entrada hostil

Analizar código de terceros implica leer comentarios, nombres de rama, mensajes de commit y ficheros de configuración que pueden contener instrucciones dirigidas al agente —el vector de *prompt injection* en el propio material auditado—. El diseño lo trata (D5P3, D5P5) y es la decisión correcta: el contenido analizado nunca adquiere autoridad. Debe extenderse a los metadatos y a los resultados de herramientas: la salida de Semgrep no es una orden.

También hay que proteger los secretos **encontrados**: un hallazgo de Gitleaks sobre una clave real exige manejo restringido, redacción en el informe y canal privado de notificación. Publicar el secreto en un dashboard compartido es agravar el incidente.

### P0.4 — El presupuesto no es una oferta y el plan no es cobertura

`config/plans.json` reparte 30/70/300 € entre cómputo, almacenamiento, APIs y reserva. El README es claro: no son cotizaciones ni enforcement implementado, y el suelo de aislamiento es igual en los tres planes. Bien. El riesgo está en la presentación comercial: un plan «Lite» de 30 € que promete «auditoría acotada» puede leerse como cobertura de seguridad, cuando en la práctica alcanza para pocos repositorios y sin SIEM.

Regla: ningún plan se anuncia con una capacidad que no esté verificada en esa versión y edición, ni se incluye un servicio de precio no verificado (el propio documento excluye VirusTotal por términos). Las anualidades no se disfrazan de gasto mensual.

### P0.5 — Cumplimiento con evidencias, no con adjetivos

D6P1 cubre aplicabilidad legal y controles; D6P2 privacidad y brechas. Un informe que dice «cumple RGPD» o «preparado para AI Act» es una afirmación jurídica que el producto no puede hacer. Lo que puede hacer es listar controles, su evidencia, su estado y su revisor, y marcar la aplicabilidad como evaluada por una persona con criterio y territorio declarados.

Coherente con eso: la notificación de brecha y sus plazos se evalúan por responsables humanos con hechos; ninguna plantilla automática garantiza conformidad.

### P0.6 — Aislamiento entre clientes que comparten scanners

Ejecutar herramientas sobre código de varios clientes en el mismo worker es una vía directa de fuga: cachés de reglas, directorios temporales, artefactos, logs, colas, resultados en el mismo índice. Cada job necesita su propio espacio, cuotas y limpieza; el aislamiento se prueba, no se supone. Y los artefactos (SBOM, SARIF, capturas) heredan la clasificación del cliente.

## 4. Modelo de dominio

| Objeto | Conserva | No acredita |
|---|---|---|
| `Asset` | titular, autorización, ventana y alcance. | que escanearlo sea lícito o seguro. |
| `ScanJob` | regla, versión, alcance, estado y evidencia. | cobertura completa del activo. |
| `Finding` | regla, ubicación, evidencia, severidad y revisor. | explotabilidad ni impacto real. |
| `EvidenceBundle` | artefactos, hashes, redacción y cadena. | autenticidad del sistema auditado. |
| `Exception` / `Waiver` | motivo, aprobador, alcance y caducidad. | riesgo aceptado indefinidamente. |
| `RemediationProposal` | cambio propuesto, versión y validación. | parche aplicado ni seguro. |
| `AgentCapability` | tools, scopes y destinos permitidos. | comportamiento correcto del agente. |
| `ComplianceControl` | marco, aplicabilidad, evidencia y revisor. | certificación. |

**Ejemplo sintético:** un repositorio sintético contiene una clave de prueba y una regla Semgrep dispara en un fichero generado. El sistema registra dos hallazgos con regla, versión, ruta y evidencia; el de la clave se redacta en el informe y se envía por canal privado; el del fichero generado se marca como falso positivo con waiver de 90 días y revisor. El informe dice «2 hallazgos, 1 excepción con caducidad, cobertura: repositorio X en el commit Y», no «cliente seguro». Es un ejemplo conceptual.

## 5. Arquitectura y campaña

El repositorio propone Python/FastAPI para el core y un cliente TypeScript/Hono, con workers aislados, gateway de herramientas y control determinista de permisos, argumentos y destinos. El principio declarado —un clasificador de prompts es una señal, no la frontera de seguridad— es correcto y debería gobernar la implementación.

La campaña son **42 fases en siete días nominales** (6 por día). Los días son una agrupación de trabajo, no un compromiso de calendario:

| Día | Foco | Fases |
|---|---|---|
| 1 | Base segura, identidad y alcance | D1P1–D1P6 |
| 2 | Snapshots, sandbox y AppSec | D2P1–D2P6 |
| 3 | Jobs, evidencia, findings y reportes | D3P1–D3P6 |
| 4 | Observabilidad y resiliencia | D4P1–D4P6 |
| 5 | Seguridad agéntica y gateway | D5P1–D5P6 |
| 6 | Cumplimiento, incidentes, fraude y coste | D6P1–D6P6 |
| 7 | Integración, E2E, hardening y entrega | D7P1–D7P6 |

### D1P1 — Baseline, alcance y contrato de servicio
Fijar SHAs, alcance y qué se puede escanear. **Gate:** autorización documentada por activo; sin ella no hay job.

### D1P2 — Paquete, configuración y contratos tipados
Esquemas estrictos para activos, jobs y hallazgos. **Gate:** rechazo de extras; sin secretos en configuración.

### D1P3 — Identidad, tenancy y capacidades
JWT, membership y scope por activo. **Gate:** tenant ajeno no lee ni lanza jobs.

### D1P4 — Persistencia, migraciones y auditoría
Tablas por tenant, FK compuestas y audit inmutable. **Gate:** aislamiento con roles reales.

### D1P5 — Inventario de activos y autorización de trabajo
Activo con titular, autorizador, ventana e intensidad. **Gate:** activo sin autorización no se toca.

### D1P6 — Threat model y revisión de fronteras
Modelar el propio riesgo del servicio. **Gate:** fronteras declaradas; sin promesas de blindaje. Checkpoint D1.

### D2P1 — Adquisición de snapshots sin ejecutar código
Obtener código y artefactos sin ejecutar nada del cliente. **Gate:** sin `postinstall`, sin build no confiable, sin red.

### D2P2 — Runner y sandbox de herramientas
Aislamiento por job con cuotas y limpieza. **Gate:** un job no ve artefactos de otro; escape probado.

### D2P3 — Adaptador Gitleaks y protección de secretos
Detección con redacción y canal privado. **Gate:** el secreto no aparece en informes ni logs.

### D2P4 — OSV, inventario de dependencias y SBOM
SBOM reproducible y consulta de vulnerabilidades con versión. **Gate:** sin SBOM no hay afirmación de cobertura.

### D2P5 — Semgrep CE y reglas propias revisadas
Reglas versionadas con revisión y falsos positivos. **Gate:** regla sin revisión no se usa en informe al cliente.

### D2P6 — Trivy para imágenes e IaC del piloto
Escaneo de imágenes e IaC con límites. **Gate:** imagen no obtenida o sin versión → `NOT_VERIFIED`. Checkpoint D2.

### D3P1 — Jobs, idempotencia y estados fiables
Estados explícitos y reintento seguro. **Gate:** un job no se ejecuta dos veces por reintento.

### D3P2 — Worker con leases, fencing y retries
Lease con vencimiento y fencing token. **Gate:** worker zombi no escribe resultados.

### D3P3 — Normalización, deduplicación y contexto
Unificar hallazgos de herramientas distintas sin perder origen. **Gate:** dedup no borra procedencia.

### D3P4 — Custodia, redacción y cadena de evidencia
Artefactos con hash, retención y redacción. **Gate:** evidencia reproducible y saneada.

### D3P5 — Priorización, excepciones y revisión humana
Severidad con contexto y waiver con caducidad. **Gate:** excepción sin aprobador y fecha no existe.

### D3P6 — Reportes y primera vertical AppSec
Informe ejecutivo, técnico y de cobertura. **Gate:** dice qué se miró y qué no; sin «cliente seguro». Checkpoint D3.

### D4P1 — OpenTelemetry y correlación extremo a extremo
Trazas con correlación y sin datos sensibles. **Gate:** sin secretos ni PII en atributos.

### D4P2 — Métricas, SLIs y presupuesto de error
Medición real de latencia y fallo. **Gate:** sin medición no hay SLO publicado.

### D4P3 — Logs estructurados y privacidad de telemetría
Logs con niveles y retención; sin contenido de cliente. **Gate:** auditoría de logs propios sin fugas.

### D4P4 — Dashboards y navegación de investigación
Vista por activo, job y hallazgo. **Gate:** permisos idénticos al API.

### D4P5 — Ingestión de eventos y conectores pasivos
Conectores de solo lectura con capacidad declarada. **Gate:** `unknown` deshabilitado; sin escritura no autorizada.

### D4P6 — Carga, retención y resiliencia de observabilidad
Volumen, retención y degradación. **Gate:** pico no tumba el servicio ni borra evidencia. Checkpoint D4.

### D5P1 — Registro de agentes, tools y capacidades delegadas
Inventario de qué puede hacer cada agente. **Gate:** tool sin registro no se invoca.

### D5P2 — Policy engine y control determinista de acciones
Permisos, argumentos y destinos verificados en código. **Gate:** el modelo no amplía su propio scope.

### D5P3 — Flujos de datos, egress y cuarentena
Salida de datos controlada y contenido sospechoso aislado. **Gate:** sin exfiltración por herramienta o URL.

### D5P4 — MCP, skills y cambios de supply chain
Versión, firma y procedencia de lo que se instala. **Gate:** skill sin procedencia no se carga.

### D5P5 — Evaluaciones adversariales con utilidad
Medir seguridad y utilidad a la vez. **Gate:** reducir ataques no puede destruir la función; ambas se miden.

### D5P6 — Revocación, kill switch y aprobación de efectos
Parada inmediata y aprobación de acciones sensibles. **Gate:** revocación efectiva en jobs en cola. Checkpoint D5.

### D6P1 — Aplicabilidad legal y controles de cumplimiento
Marco, aplicabilidad revisada y evidencia por control. **Gate:** sin revisor y territorio no se afirma aplicabilidad.

### D6P2 — Privacidad, retención y brechas de datos
Retención, derechos y procedimiento de brecha. **Gate:** notificación evaluada por humanos con hechos.

### D6P3 — Antifraude y verificación por contexto
Señales de suplantación con canal alternativo verificado. **Gate:** una señal no bloquea ni acusa sola.

### D6P4 — Incidentes y contención propuesta
Caso, evidencia y contención propuesta. **Gate:** contención no se aplica sin aprobación.

### D6P5 — Remediación revisable y retest
Parche propuesto, validado y reescaneado. **Gate:** cierre solo con retest o waiver.

### D6P6 — Reservas económicas y servicios comerciales
Presupuesto y servicios con precio verificado. **Gate:** plan no se anuncia con capacidad no probada. Checkpoint D6.

### D7P1 — SDK TypeScript/Hono y contrato hacia /agente
Cliente tipado con tools nominadas. **Gate:** sin métodos libres; sin cambios en `agente`.

### D7P2 — Interfaz operativa y experiencia humana
Revisión, excepciones y reportes en UI. **Gate:** estado real, incluidos `unknown` y `blocked`.

### D7P3 — E2E de dos tenants y recorridos de referencia
Dos tenants, jobs aislados, informes correctos. **Gate:** cero fuga entre clientes.

### D7P4 — Hardening, rendimiento y recuperación
Carga, fallo y restore. **Gate:** restore probado con evidencia y permisos reimpuestos.

### D7P5 — Empaquetado, Windows/Linux y supply chain de release
Artefacto reproducible y firmado. **Gate:** sin secretos en el paquete; procedencia declarada.

### D7P6 — Aceptación, reporte al founder y próximos 90 días
Inventario de lo probado y lo pendiente. **Gate:** aceptación solo del alcance verificado. Checkpoint final.

## 6. Pruebas previstas

Ninguna ejecutada salvo el validador documental. Casos clave: activo sin autorización; escaneo de dominio de terceros; secreto real en hallazgo; escape de sandbox; job duplicado por lease vencido; prompt injection en README del cliente; regla que dispara en código generado; informe que omite cobertura; restore con evidencia retirada; revocación durante la cola.

## 7. Decisiones pendientes

1. **Licencia del código propio** antes de cualquier distribución que la requiera.
2. **Base legal y plantilla de autorización** de escaneo, con límites de intensidad y parada.
3. **Un conjunto mínimo de herramientas**: Gitleaks + OSV + Semgrep CE, con Trivy cuando existan imágenes. Nada más hasta probarlo.
4. **Canal privado de divulgación** (`SECURITY.md` lo describe como pendiente).
5. **Qué NO se promete**: SOC 24/7, blindaje, certificación, cobertura universal.

## 8. Resultado

Meta auditoría documental con una comprobación ejecutada (validador `PASS`, 35 documentos, 30.397 palabras, 0 escaneos de seguridad). **No se ha escaneado ningún sistema, no se ha instalado ninguna herramienta de seguridad y no se ha modificado el repositorio.** El plan es defendible y su principal activo es la honestidad explícita de sus propios límites.
