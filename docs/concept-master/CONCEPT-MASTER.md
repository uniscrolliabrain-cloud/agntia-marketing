# AGNTIA MARKETING — CONCEPT MASTER
**Versión:** 1.0 · **Fecha:** 2026-11-15 · **Estado:** TARGET_VISION / EVOLUTIVO · **Repositorio:** `uniscrolliabrain-cloud/agntia-marketing`

> **Visión:** convertir el marketing empresarial en un sistema de inteligencia de mercado, experimentación, construcción de demanda, comunicación relevante y aprendizaje económico continuo, dirigido por agentes especializados y gobernado por evidencia, consentimiento, autoridad y resultados verificables.

## 0. Naturaleza del Concept Master

Este documento define el **producto final deseado**, no el MVP ni la implementación actual. Se conserva íntegra la documentación existente; sus límites de piloto no restringen la visión final. Se distingue **[C] práctica o tecnología establecida**, **[D] arquitectura propia propuesta**, **[H] hipótesis de frontera por investigar**. El concepto puede evolucionar a V2 cuando avance el conocimiento o el producto. Los claims de terceros no prueban rendimiento propio. Ninguna campaña, anuncio, mensaje o gasto está implementado por escribirlo aquí.

**Invariantes heredados:** `agente` gobierna identidad canónica, organización, agentes, políticas, SOPs, aprobaciones y bus. Marketing gobierna semántica y ejecución especializada dentro de mandatos explícitos. Los twins no tienen autoridad independiente. Multi-tenant, ACL por recurso/campo, propósito, aprobación por payload, outbox, idempotencia, resultado incierto, auditabilidad, límites de gasto y fail-closed. Se permite solapamiento con Redes, Branding, Clientes y Ventas, pero un `AuthorityMap` elige el dueño de cada efecto.

## 1. Tesis estratégica y propuesta disruptiva

### 1.1 Problema
Las empresas fragmentan investigación, posicionamiento, creación, canales, publicidad, CRM, ventas, medición y aprendizaje. Muchas herramientas maximizan métricas de plataforma (clics, alcance, leads atribuidos) sin demostrar valor incremental ni vincular decisiones a caja y margen. La IA generativa acelera piezas, pero no asegura comprensión del mercado, validez de claims, permiso de contacto, distribución o causalidad.

### 1.2 Sistema final
**Agntia Marketing Intelligence OS**, una especialidad agéntica que:
- construye y actualiza un **Market Reality Graph** de categorías, segmentos, necesidades, competidores, señales y fuentes;
- formula hipótesis comerciales y alternativas de posicionamiento;
- diseña campañas, journeys, contenido y experiencias multicanal;
- simula costes, riesgos, frecuencia, elegibilidad y resultados esperados antes de activar;
- orquesta efectos autorizados mediante el runtime y conectores;
- mide resultados con un **Measurement Claim Contract** que distingue descripción, atribución y causalidad;
- aprende de experimentos, ventas y economía real, con memoria versionada y aprobación de cambios;
- permite al owner conversar con la empresa y comprender **por qué** se propone una decisión.

### 1.3 Conceptos diferenciales [D]
1. **Market Reality Graph:** conocimiento vivo con hechos, hipótesis, procedencia, incertidumbre y caducidad.
2. **Opportunity Discovery Engine:** oportunidades sustentadas por señales y pruebas de necesidad, no solo generación de ideas.
3. **Experiment-First Growth:** hipótesis, diseño experimental, guardrails y evaluación antes de escalar presupuesto.
4. **Evidence-to-Impact Ledger:** cadena brief→hipótesis→creatividad→audiencia autorizada→efecto→resultado→conclusión.
5. **Marketing Digital Twin:** simulador de escenarios y asignación de recursos, sin presentarlo como predicción causal demostrada.
6. **Audience Authorization Snapshot:** conjunto máximo aprobado, consentimiento y bajas revalidadas antes de cada efecto.
7. **Claim Provenance Graph:** toda afirmación pública importante enlaza evidencia, licencia, revisión y vigencia.
8. **Cross-Domain Growth Brain:** marketing conecta oportunidades, ventas, finanzas, marca y clientes sin mezclar autoridades.
9. **Creative Evolution Laboratory:** variantes multimodales, experimentos y aprendizaje de estilo con controles de derechos.
10. **Demand Resilience Radar:** señales de cambios de demanda, reputación, canales y dependencia de plataformas.

## 2. Frontera mundial: industria, ciencia y open source

### 2.1 Referentes industriales
La documentación previa ya examina selectivamente **HubSpot Marketing Studio, Adobe CX Enterprise Coworker, Salesforce Agentforce Marketing, Klaviyo, Braze y Mailchimp**. Ampliar el mapa competitivo para contrastar capacidades, no para copiar logos:
- **Adobe Experience Platform / Journey Optimizer / Marketo:** contenido, audiencias, journeys, experiencia y gobierno.
- **Salesforce Marketing Cloud / Data Cloud / Agentforce:** contexto CRM, datos y orquestación.
- **HubSpot, Klaviyo, Braze, Iterable, Customer.io, ActiveCampaign, Mautic:** CRM/automatización, journeys y lifecycle.
- **Google Ads, Google Analytics, Search Console, Google Meridian; Meta Ads, Meta Robyn:** distribución, observación y ciencia de medición.
- **Semrush, Ahrefs, Similarweb, SparkToro, Brandwatch, Meltwater:** búsqueda, inteligencia competitiva, audiencias y escucha.
- **Optimizely, Statsig, Eppo, GrowthBook:** experimentación, feature flags, diseño estadístico y medición.
- **Canva, Adobe Firefly, Figma, Runway y herramientas de producción audiovisual:** creatividad y activos; derechos y condiciones dependen del proveedor.
Estas son **líneas de benchmarking**, no una auditoría funcional completa de todas sus ediciones o APIs.

### 2.2 Ciencia de marketing
- **Econometría y MMM:** adstock, saturación, factores de confusión, estacionalidad, estimación bayesiana y curvas de respuesta.
- **Inferencia causal:** ensayos aleatorizados, geoexperimentos, holdouts, diseños cuasiexperimentales y sensibilidad de supuestos.
- **Experimentación:** asignación estable, potencia/MDE, guardrails, peeking, multiplicidad, CUPED y análisis secuencial cuando se justifique.
- **Comportamiento del consumidor:** investigación cualitativa, jobs-to-be-done, intención vs comportamiento observado, elasticidad, elección y segmentación.
- **Economía de crecimiento:** CAC, LTV, cohortes, margen de contribución, retención, payback, elasticidad y capital circulante.
- **Búsqueda e información:** recuperación semántica, relevancia, SEO técnico, discoverability y visibilidad en interfaces de respuesta generativa.
- **Sistemas multiagente:** coordinación de tareas y revisión; sin asumir que agentes más numerosos mejoran resultados.

### 2.3 Open source prioritario
- **Google Meridian:** MMM bayesiano, geo-datos, priors, saturación, ROI y optimización, con condiciones de identificabilidad. https://developers.google.com/meridian/docs/basics/meridian-introduction
- **Meridian GeoX:** experimentos geográficos para incrementalidad y calibración de MMM. https://developers.google.com/meridian/geox
- **Meta Robyn:** MMM con ridge, búsqueda multiobjetivo, adstock, saturación y asignación. https://facebookexperimental.github.io/Robyn/
- **PyMC-Marketing:** modelos bayesianos de marketing y CLV como candidato. https://github.com/pymc-labs/pymc-marketing
- **GrowthBook:** experimentación y flags; evaluar licencias/ediciones y límites de producto. https://github.com/growthbook/growthbook
- **Mautic:** automatización de marketing autoalojada, candidata existente. https://github.com/mautic/mautic
- **listmonk:** newsletters y listas autoalojadas, candidata existente. https://github.com/knadh/listmonk
- **PostHog:** analítica/experimentación, según edición y licencias. https://github.com/PostHog/posthog
- **Matomo:** analítica web, con consideraciones de privacidad. https://github.com/matomo-org/matomo

**Decisión de arquitectura:** estas librerías son motores candidatos dentro de adaptadores y workers aislados, no el sistema canónico ni sustitutos de consentimiento, gobernanza o calidad de datos. Revisar licencia, SHA/release, requisitos y evaluación propia antes de incorporarlas.

### 2.4 Investigación y pruebas
Google describe Meridian como framework abierto para MMM y modelado causal basado en supuestos, no como garantía de causalidad en cualquier dataset. Robyn documenta calibración, optimización y modelos con datos agregados. GeoX permite experimentar con regiones; el resultado solo generaliza bajo condiciones de diseño y validez. CUPED utiliza covariables previas al experimento para mejorar precisión cuando sus supuestos se cumplen. Estas son bases metodológicas para el producto, no resultados demostrados de Agntia.

## 3. Taxonomía de capacidades finales

**P0/P1/P2 son horizontes de construcción, no recortes de visión.** Cada capacidad tiene identificador estable y deberá evolucionar a ficha con entradas, salidas, contratos, pruebas y autoridad.

### A. Inteligencia de mercado y estrategia
**M01 [C/P0]** Inteligencia de empresa: producto, margen, capacidades, restricciones, posicionamiento y objetivos.
**M02 [C/P0]** Investigación de mercado con fuentes primarias/secundarias y calidad de evidencia.
**M03 [D/P1]** Market Reality Graph: competidores, segmentos, necesidades, categorías, señales, fuentes y versiones.
**M04 [C/P1]** Segmentación ICP/personas con hipótesis, sesgos y criterios auditables; evitar perfiles sensibles indebidos.
**M05 [C/P1]** Análisis de competidores, ofertas, precios, canales, distribución y diferenciación.
**M06 [D/P1]** Opportunity Discovery Engine con priorización por evidencia, tamaño de oportunidad y viabilidad.
**M07 [C/P1]** Investigación de cliente: entrevistas, encuestas, reviews, soporte, búsquedas y patrones de abandono.
**M08 [D/P2]** Detección de cambios de mercado y early signals con control de falsos positivos.
**M09 [D/P2]** Laboratorio de posicionamiento, propuestas de valor, diferenciación y mensajes contrastables.
**M10 [H/P2]** Simulación de evolución competitiva y reacción de mercado, explícitamente hipotética.

### B. Marca, creatividad y contenidos
**M11 [C/P0]** Briefs estructurados con objetivo, segmento, oferta, presupuesto, restricciones y criterios de éxito.
**M12 [C/P0]** Generación y edición de copys, landings, emails y materiales ES/EN/FR con revisión.
**M13 [D/P1]** Claim Provenance Graph: afirmaciones, fuentes, permisos, caducidad y revisión.
**M14 [C/P1]** Biblioteca de activos y derechos: licencias, consentimiento, versiones, canales y vencimientos.
**M15 [C/P1]** Producción multimodal: imágenes, vídeo, audio, infografías, creatividades y adaptaciones.
**M16 [D/P1]** Creative Evolution Laboratory: hipótesis creativas, variantes, pruebas, aprendizaje y no-regresión.
**M17 [C/P1]** Localización cultural, accesibilidad, lectura fácil y adaptación por canal sin claims inventados.
**M18 [D/P2]** Sistema de narrativas coherentes con Branding y Comunicación, gobernado por BrandPolicy.
**M19 [D/P2]** Optimización de contenido basada en calidad, derechos, evidencia y resultados, no solo engagement.
**M20 [H/P2]** Generación de campañas narrativas interactivas persistentes con personajes/agentes y controles editoriales.

### C. Distribución, campañas y journeys
**M21 [C/P0]** Planificación de campañas con objetivos, calendario, responsables, recursos, presupuesto y dependencias.
**M22 [C/P0]** Audiencias autorizadas por finalidad, canal, fuente, supresión y vigencia.
**M23 [C/P1]** Email lifecycle, journeys y automatización con caps, reentrada, pausa y revalidación.
**M24 [C/P1]** Landing pages, formularios, tracking de conversiones y optimización de experiencia.
**M25 [C/P1]** SEO técnico, contenidos, búsqueda local, Search Console y analítica orgánica.
**M26 [D/P1]** AEO/GEO: monitorización reproducible de visibilidad en respuestas IA, con metodología y límites explícitos.
**M27 [C/P1]** Paid media: planificación, targeting autorizado, creatividades, experimentos y propuestas de gasto.
**M28 [D/P2]** Cross-channel orchestration con un único ejecutor por efecto y prioridades de contacto.
**M29 [C/P2]** SMS, WhatsApp, push, redes y otros canales solo con permisos, políticas y adaptadores verificados.
**M30 [D/P2]** Frequency & Fatigue Controller: saturación de audiencia, presión de contacto y experiencia.
**M31 [D/P2]** Budget & Effect Governor: gasto autorizado, límites, pacing, stop-loss y reconciliación.
**M32 [H/P2]** Orquestación dinámica de journeys bajo incertidumbre y restricciones de privacidad, con experimentos previos.

### D. Ciencia de medición e incrementalidad
**M33 [C/P0]** Catálogo de métricas: definición, unidad, denominador, ventana, dedup, fuente y cobertura.
**M34 [C/P0]** Analítica descriptiva de tráfico, contactos, conversiones y ventas con conciliación de eventos.
**M35 [C/P1]** Atribución como modelo descriptivo dependiente de reglas, no causalidad.
**M36 [C/P1]** Experimentos A/B con hipótesis, aleatorización, potencia, guardrails y análisis predefinido.
**M37 [C/P1]** Holdouts y experimentos geográficos cuando escala y diseño lo permitan.
**M38 [C/P1]** Incrementalidad y lift con estimand, supuestos, incertidumbre y validez externa.
**M39 [C/P2]** MMM con Meridian/Robyn/PyMC-Marketing como candidatos, calibrado por experimentos.
**M40 [D/P2]** Measurement Claim Contract: observación, atribución, experimento, cuasiexperimento o modelo.
**M41 [D/P2]** Measurement Suitability Gate: rechazar inferencias sofisticadas sin datos/identificación suficientes.
**M42 [D/P2]** Learning Ledger de experimentos, resultados negativos, hipótesis refutadas y conocimiento reutilizable.
**M43 [C/P2]** CLV/cohortes/retención con definiciones y censura temporal explícitas.
**M44 [D/P2]** Modelo unificado de impacto económico con Finanzas y Ventas: margen, caja y resultados netos.

### E. Planificación económica y optimización
**M45 [C/P1]** Planificación de presupuestos y escenarios por canal, campaña y segmento.
**M46 [C/P1]** Curvas de respuesta, saturación, adstock y efectos retardados cuando sean identificables.
**M47 [D/P2]** Marketing Digital Twin: escenario de inversión, canal, creatividad y capacidad comercial.
**M48 [C/P2]** Optimización con restricciones: presupuesto, capacidad, frecuencia, riesgo y calidad de evidencia.
**M49 [D/P2]** Frontera de Pareto: crecimiento, rentabilidad, marca, resiliencia y experiencia del cliente.
**M50 [D/P2]** Decisiones de escalado, pausa y redistribución revisables, con coste de oportunidad.
**M51 [H/P2]** Política de exploración/explotación contextual bajo consentimiento, seguridad y validación experimental.
**M52 [D/P2]** Integración con previsión de caja y unit economics, sin duplicar el motor de Finanzas.

### F. Experiencia agéntica y servicio
**M53 [D/P0]** Twin especialista de Marketing ligado a LAIA y agentes canónicos de `agente`.
**M54 [D/P0]** Chat asesor con briefs, fuentes, previews, aprobaciones y explicación de resultados.
**M55 [D/P1]** Growth Office: roles funcionales de investigación, estrategia, creatividad, performance, SEO y ciencia de medición.
**M56 [D/P1]** Briefing diario/semanal/mensual de oportunidades, campañas, riesgos y aprendizajes.
**M57 [D/P1]** Campaign Studio con calendario, presupuesto, estados, evidencias, revisión y diff.
**M58 [D/P1]** Experiment Lab con diseño, asignación, métricas, diagnóstico y decisión de continuación.
**M59 [D/P2]** Market Radar y Competitive Observatory con procedencia y caducidad de señales.
**M60 [D/P2]** Conversación multimodal y avatar Anam opcional, mismos permisos que la API.
**M61 [D/P2]** Report Factory con snapshots reproducibles, gráficos, presentaciones y explicación causal honesta.
**M62 [D/P2]** Human-in-the-loop review queue: claims, derechos, gastos, targeting, envíos y crisis.
**M63 [D/P2]** Decision Memory: qué se decidió, qué ocurrió y qué hipótesis se corrigieron.

### G. Plataforma, protección y ecosistema
**M64 [C/P0]** Tenant isolation, ACL por recurso/campo, consentimiento, retención y auditoría.
**M65 [D/P0]** AuthorityMap entre Marketing, Redes, Branding, Clientes, Ventas, Comunicación y Finanzas.
**M66 [C/P1]** Conectores con discovery de capacidades, sandbox, scopes, secretos y reconciliación.
**M67 [D/P1]** Audience Authorization Snapshot con supresión dinámica y congelación del máximo aprobado.
**M68 [C/P1]** Outbox/inbox, idempotencia, approval binding, effect receipt y estado incierto.
**M69 [D/P1]** Data Provenance & Measurement Graph para linaje de cada métrica y claim.
**M70 [C/P1]** Gobernanza de modelos: versiones, drift, coste, evaluación, rollback y permisos.
**M71 [D/P2]** Librería sectorial: autónomos, retail, servicios, hostelería, ecommerce, B2B y empresas locales.
**M72 [H/P2]** Inteligencia de tendencias entre empresas con agregación privada y bases jurídicas verificadas.

## 4. Arquitectura conceptual de destino

### 4.1 Ocho planos
1. **Market Intelligence Plane:** fuentes, crawling autorizado, investigación, señales, competidores, categorías y evidencia.
2. **Customer & Permission Plane:** contactos, fuentes de identidad, consentimiento, finalidad, preferencias, supresión y elegibilidad.
3. **Strategy & Creative Plane:** briefs, posicionamiento, ofertas, claims, activos, derechos, versiones y variantes.
4. **Campaign & Journey Plane:** campañas, calendarios, FSM, reglas, frecuencia, budget, destinatarios y efectos.
5. **Measurement Science Plane:** eventos, definiciones, dedup, atribución, experimentos, MMM, incertidumbre y validación.
6. **Decision Intelligence Plane:** escenarios, optimización, alternativas, riesgos, guardrails y decisiones.
7. **Agent Interaction Plane:** LAIA, twins, especialistas, workspaces, Anam y entregables.
8. **Governance & Integration Plane:** identidad, ACL, mandatos, aprobaciones, outbox, conectores, trazabilidad, observabilidad y bus.

### 4.2 Ciclo canónico
`objetivo empresarial → investigación con fuentes → hipótesis de oportunidad → brief → audiencia/permiso → estrategia y creatividades → estimación y preview → revisión humana → aprobación de payload/alcance/gasto → ejecución autorizada → receipt → observaciones → experimento/modelo → evaluación económica → memoria de aprendizaje → siguiente hipótesis`.

**Nunca** tratar un borrador como publicación, un evento de conversión como venta verificada, un click atribuido como venta incremental o un plan de anuncios como autorización de gasto.

### 4.3 Entidades conceptuales
`MarketObservation, SourceEvidence, Competitor, MarketSegment, CustomerNeed, OpportunityHypothesis, PositioningVersion, BrandPolicySnapshot, ClaimEvidence, CreativeAsset, LicenseBinding, CampaignBrief, CampaignPlan, CampaignRevision, AudienceRule, EligibilityDecision, AudienceSnapshot, ContactPreference, SuppressionEntry, JourneySpec, JourneyRun, OutboundIntent, ProviderReceipt, ExperimentSpec, Assignment, Guardrail, MetricDefinition, Observation, ConversionFact, AttributionResult, IncrementalityEstimate, MMMRun, ModelDiagnostics, BudgetScenario, DecisionCase, DecisionOutcome, LearningRecord, WorkOrder, DelegationMandate, AuthorityMap`.

Cada objeto incluye tenant, owner/actor verificado, versión, sourceRefs, propósito, timestamps, ACL y estado. Para modelos: dataset hash, ventana, estimand, supuestos, semilla, métricas, intervalos, método, versión y diagnóstico. Los identificadores de audiencia nunca se vuelcan indiscriminadamente al bus o al prompt.

## 5. Núcleo científico: de métricas a decisiones válidas

### 5.1 Jerarquía de evidencia
**E0** dato no verificado; **E1** observación descriptiva; **E2** asociación/atribución por regla; **E3** inferencia modelada con supuestos; **E4** diseño cuasiexperimental evaluado; **E5** experimento aleatorizado correctamente ejecutado y analizado. Esta escala es una **taxonomía interna propuesta**, no ranking universal de validez: un experimento sesgado puede ser peor que una observación sólida. Registrar población, unidad, periodo, estimand, sesgos, incertidumbre y alcance de generalización.

### 5.2 Diseño experimental
Predefinir hipótesis, variable de tratamiento, unidad de aleatorización, población elegible, métricas primarias y guardrails, MDE/potencia, horizonte, stopping rule, manejo de múltiples pruebas y análisis de abandono. Asignación persistente y aislamiento entre grupos. Considerar interferencia entre usuarios, efectos de red, contaminación de canales y cambios de campaña. CUPED con covariables previas al tratamiento, no ajustando por resultados posteriores. La IA puede proponer un experimento; el sistema valida el diseño.

### 5.3 MMM
Precondiciones: series suficientemente largas, variación informativa de gasto, outcome confiable, covariables de confusión plausibles, calendario, geografía y controles de calidad. Adstock/saturación, priors, intervalos, posterior predictive checks, sensibilidad, calibración con lift y backtesting temporal. Comparar Meridian, Robyn y PyMC-Marketing según dataset, identificabilidad, interpretabilidad, coste y requisitos. **Sin datos suficientes, declarar NOT_IDENTIFIABLE** y volver a analítica descriptiva/experimentos simples. No inventar ROI por canal.

### 5.4 Incrementalidad y optimización
Definir diferencia entre efecto incremental, ROAS atribuido, iROAS y margen incremental. Para asignación de presupuesto, incluir restricciones de caja, capacidad de ventas, saturación, riesgos de marca y diversidad de canales. Mostrar escenarios y frontera de Pareto, no una única recomendación infalible. Registrar supuestos y decisiones humanas.

### 5.5 Medición de búsqueda generativa
AEO/GEO requiere protocolo reproducible: consultas representativas, locales, idiomas, modelos, fechas, configuración, muestreo, variabilidad y anotación de menciones/citas. No afirmar rankings estables de modelos generativos por una captura aislada ni prometer influir resultados de terceros.

## 6. Sistema de agentes y cooperación entre repos

Los agentes visibles son interfaces de trabajo. Roles propuestos: **Market Researcher, Growth Strategist, Creative Director, Performance Analyst, Lifecycle Specialist, SEO/GEO Specialist, Marketing Scientist y Compliance Reviewer**. Cada rol se implementa como perfiles, SOPs, tools nominadas y contratos bajo el runtime canónico, no como una organización paralela.

**Handoff:** `WorkOrder → capability → resource/purpose → mandato → propuesta → revisión/aprobación → efecto → receipt → resultado → ACK`. El servicio puede completar trabajo local dentro de su mandato; no inventa roles de empresa, scheduler ni autoridad del padre.

**Relaciones de dominio:**
- **Branding:** autoridad sobre identidad visual/verbal y políticas de marca; Marketing ejecuta campañas con versiones aprobadas.
- **Redes:** autoridad elegida por WorkOrder para publicación y comunidad; Marketing puede preparar assets sin publicar.
- **Clientes:** consentimiento, lifecycle, segmentos, experiencia y señales de retención; respetar custodios.
- **Ventas:** leads aceptados, oportunidades, ingresos verificados y feedback comercial; no equiparar lead con venta.
- **Finanzas:** presupuesto, margen, CAC/LTV, cash impact y coste de oportunidad; motor económico bajo su autoridad.
- **Comunicación:** reputación, crisis, medios y narrativa corporativa; reglas de escalado.
- **Vídeo/Diseño:** producción especializada, derechos y variantes creativas.
- **Legal/Ciberseguridad:** privacidad, claims, seguridad de proveedores, fraude y restricciones.

**Tools de destino:** `marketing.market.research`, `marketing.opportunity.rank`, `marketing.brief.propose`, `marketing.audience.preview`, `marketing.creative.revise`, `marketing.campaign.preview`, `marketing.experiment.design`, `marketing.measurement.explain`, `marketing.budget.simulate`, `marketing.report.generate`, `marketing.effect.intent.prepare`. Todas requieren PEP servidor; el LLM no suministra identidad ni rutas arbitrarias de proveedores.

## 7. Experiencia final y workspaces

**Owner:** «¿Qué oportunidades de mercado estamos ignorando?», «¿Qué campaña ha generado margen incremental?», «¿Cómo cambia el plan si bajo el presupuesto un 20 %?», «¿Qué hipótesis no han funcionado?», «¿Qué mensaje está agotando a los clientes?». Cada respuesta muestra fuentes, calidad de evidencia, costes y opciones.

**Workspaces:** Market Observatory, Opportunity Lab, Strategy Board, Brand & Claim Vault, Creative Studio, Campaign Control, Journey Builder, Audience & Consent Center, Experiment Lab, Measurement Science, Growth Economics, Agent Office, Decision Timeline y Report Factory.

**Diseño UX:** vista conversacional + panel estructurado; diff de creatividades; preview exacto de destinatarios/segmentos/canales; simulación de frecuencia y presupuesto; drill-down de métricas; intervalos de incertidumbre; gráfico de experimentos; aprobación con expiración; bloqueo útil cuando falta consentimiento o datos; exportación de reportes reproducibles. Anam/voz es presencia, no firma ni consentimiento tácito.

## 8. Seguridad, privacidad, integridad y responsabilidad

**Protección de audiencia:** consentimiento/base jurídica por propósito y canal, supresión global/local, oposición, minimización, retención, exportación/borrado verificable y revisión de datos sensibles. RGPD y LSSI para España/UE según caso; revisar ePrivacy y normas de plataformas. No inferir atributos sensibles ni utilizar audiencias de terceros sin derechos.

**Protección de efectos:** approval hash vincula revisión, creatividad, claims, canal, finalidad, audiencia máxima, presupuesto, destinatarios y ventana. Un cambio material invalida la aprobación; las bajas posteriores se aplican inmediatamente, altas posteriores no se incorporan silenciosamente. Outbox durable, idempotencyKey, rate/frequency caps, dedup, proveedor y receipt, estado `outcome_unknown` reconciliado antes de reintentar. Sin `execute-anything`.

**Protección del conocimiento:** prompt injection desde páginas/reviews/CSV, documentos maliciosos, contaminación de datos de competidores, copyright y licencias, suplantación de marca, contenido engañoso, sesgos de segmentación, fraude publicitario, scraping no autorizado, gastos no consentidos y fuga cross-tenant. El agente puede redactar; no debe inventar testimonios, resultados de estudios ni avales.

**Autonomía por niveles:** L0 observar, L1 investigar/explicar, L2 proponer, L3 preparar cambios revisables, L4 ejecutar efectos autorizados, L5 gasto/publicación masiva sujetos a controles reforzados. La policy determina el nivel, nunca un prompt.

## 9. Métricas y evaluación de excelencia

**Mercado:** calidad/cobertura/frescura de fuentes, hipótesis verificadas, oportunidades convertidas en experimentos.
**Creatividad:** consistencia de marca, exactitud de claims, derechos, accesibilidad, rendimiento fuera de muestra.
**Campañas:** elegibilidad, tasas de supresión, efectos confirmados, frecuencia, deliverability, incidencias y costes.
**Ciencia:** potencia, calidad de randomización, intervalos, falsos positivos, validez de estimand, calibración MMM, lift y límites.
**Economía:** margen incremental, CAC/LTV con definiciones, payback, retorno marginal, coste de oportunidad y efecto en caja.
**Seguridad:** cero fugas de tenant, cero envíos a destinatarios suprimidos, cero gastos sin autorización, cero duplicados por replay.
**Servicio:** time-to-insight, claridad de bloqueos, capacidad de revisión, p95, coste por flujo y recuperación.

**Pruebas conceptuales obligatorias:** dos tenants con dominios similares; contacto revocado durante cola; cambio de creativo después de aprobar; envío aceptado con timeout; experimento con contaminación; atribución que contradice holdout; MMM no identificable; contenido con claim sin fuente; presupuesto excedido; pérdida de proveedor; lead no aceptado por Ventas; discrepancia de margen con Finanzas. Un texto final correcto con un efecto prohibido durante la trayectoria **falla**.

## 10. Convergencia desde la documentación actual

**G0 — Concept closure:** atlas de referentes y ciencia, 72 fichas Mxx, ontología, ADRs, investigación y decisiones de frontera.
**G1 — Evidence Foundation:** identidad, fuentes, brief, permisos, claim ledger, assets, snapshot de audiencias y política.
**G2 — Campaign Core:** planes, revisiones, email/landing, previews, approvals, outbox, receipts y UX.
**G3 — Growth Intelligence:** mercado, ICP, SEO/AEO, research, oportunidades y medición descriptiva.
**G4 — Experiment-First:** A/B, holdouts, incrementalidad, estadísticas, reportes y criterios de parada.
**G5 — Economic Marketing Science:** MMM si los datos lo permiten, escenarios, asignación y puente con Finanzas/Ventas.
**G6 — Agentic Growth Office:** especialistas, SOPs, LAIA, handoffs, reportes y cooperación entre repos.
**G7 — Advanced Multichannel:** conectores, paid media, journeys dinámicos, resiliencia y gobernanza.
**G8 — Concept V2:** evolución a partir de experimentos, tecnologías y conocimiento nuevos.

Las 42 campañas actuales son una **ruta de construcción existente**, no una medida de completitud conceptual. Su futura revisión debe mapear cada campaña a Mxx y cada Mxx a pruebas, contratos, referencias y decisiones. No alterar campañas en este commit.

## 11. Preguntas abiertas, experimentos y criterios de falsación

1. ¿Qué métodos de medición son estadísticamente viables para una pyme con pocos datos? [H]
2. ¿Qué señales de mercado predicen demanda futura sin confundir ruido con tendencia? [H]
3. ¿Cuánto aporta el sistema de oportunidades frente a investigación humana tradicional? [H]
4. ¿Cuándo un modelo MMM aporta más que experimentos simples y reglas? [H]
5. ¿Qué canal/segmento requiere qué consentimiento y qué versión normativa? [D]
6. ¿Cómo calibrar experimentos geográficos en empresas con una sola ubicación? [H]
7. ¿Qué mejoras creativas generalizan y cuáles son sobreajuste a plataformas? [H]
8. ¿Cómo medir impacto incremental en márgenes, no solo en conversiones? [H]
9. ¿Cómo coordinar un journey entre Marketing, Redes y Clientes sin doble contacto? [D]
10. ¿Qué información de mercado puede agregarse entre clientes sin comprometer privacidad ni secretos comerciales? [H]
11. ¿Cómo distinguir visibilidad en IA generativa de valor de negocio real? [H]
12. ¿Qué efectos pueden automatizarse sin crear riesgo de gasto, reputación o consentimiento? [D]

Cada pregunta tendrá responsable, protocolo, coste, evidencia, fecha de revisión y decisión versionada. Una hipótesis no demostrada se conserva como hipótesis.

## 12. Fuentes, límites de investigación y evolución

### Documentación del repositorio leída selectivamente
- [README](../../README.md)
- [Referentes y brechas](../03-referentes-y-brechas.md)
- [Arquitectura y autoridad](../architecture/01-arquitectura.md)
- [Contratos de diseño](../contracts/01-contratos.md)
- [Producto y límites](../01-producto-y-limites.md) — referencia para siguiente auditoría detallada.
- [Investigación y decisiones](../02-investigacion-y-decisiones.md) — referencia para siguiente auditoría detallada.

### Fuentes primarias consultadas en esta revisión
- Google Meridian: https://developers.google.com/meridian/docs/basics/meridian-introduction
- Google Meridian GeoX: https://developers.google.com/meridian/geox
- Google Meridian repositorio: https://github.com/google/meridian
- Meta Robyn: https://facebookexperimental.github.io/Robyn/
- Meta Robyn repositorio: https://github.com/facebookexperimental/Robyn
- Eppo CUPED: https://docs.geteppo.com/statistics/cuped/

### Fuentes técnicas candidatas a lectura profunda
- PyMC-Marketing: https://github.com/pymc-labs/pymc-marketing
- GrowthBook: https://github.com/growthbook/growthbook
- Mautic: https://github.com/mautic/mautic
- listmonk: https://github.com/knadh/listmonk
- PostHog: https://github.com/PostHog/posthog
- Matomo: https://github.com/matomo-org/matomo
- Regulación RGPD: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- LSSI: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758

**Límite explícito:** investigación selectiva, no revisión sistemática de papers ni auditoría completa de proveedores. Los nombres de plataformas adicionales forman un mapa de benchmarking que debe completarse con fichas de evidencia. Este documento constituye una **visión de destino ambiciosa y versionable**, no prueba de implementación, certificación, ni garantía de que se haya agotado la frontera mundial.

**Política de evolución:** V1.x amplía investigación, evidencia y precisión; V2 puede redefinir el producto cuando el aprendizaje lo justifique. No reducir el Concept Master para adaptarlo al código. Registrar brechas, decisiones, ADRs y supuestos; perseguir el concepto con ingeniería verificable.
