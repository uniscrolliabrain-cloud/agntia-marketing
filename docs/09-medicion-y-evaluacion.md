# Medición, causalidad y evaluación del sistema

Diseño científico/ingenieril pendiente de ejecución. No se han medido resultados de campañas ni reproducido los papers. El producto debe ser útil con pocos datos: reportar observaciones honestas es mejor que producir un MMM ficticio. No se exige un tamaño de muestra universal inventado; cada análisis declara requisitos, horizonte, métrica y potencia/sensibilidad.

## Tres niveles de afirmación

Descriptivo: qué registró cada fuente, con ventana, definición, cobertura y ajuste. Atribuido: cómo una regla/plataforma asigna crédito a conversiones; no prueba incremento. Causal: efecto estimado con intervención/identificación, supuestos, incertidumbre y límites explícitos. Las salidas experimentales, cuasi-experimentales y MMM no se mezclan bajo un mismo «ROI» sin etiqueta. Fit predictivo no valida por sí solo iROAS, como motiva P04.

ConversionFact dedup por evento de negocio/ID/fuente; conservar devoluciones/cancelaciones y tiempo de ocurrencia. Las plataformas pueden atribuir la misma venta varias veces. No sumar ROAS/conversiones atribuidas entre Meta/Google/email como ingresos únicos. Ingreso bruto, neto, margen y beneficio son métricas distintas; sin fuente de costes no mostrar rentabilidad. Aperturas pueden estar afectadas por proxies, bots y privacidad; usuarios/clics/sesiones tampoco son intercambiables.

## Datos y contratos

Observation define origen, unidad, agregación, ventana/zona, fecha de recepción, config de tracking/consentimiento, value o missing, sourceHash y cobertura. Reprocesar datos tardíos produce nueva versión, no sobrescribe un reporte aprobado silenciosamente. Search Console devuelve top rows con límites; ausencia de una query no prueba cero demanda ni caída. GA4 y cada backend tienen definiciones/configuración propias que se conservan.

MeasurementClaim fija estimand, población/geo, tratamiento/control, outcome, supuestos/controles, periodo, criterio de admisibilidad, método y revisión. Si la fuente cambia, el informe muestra stale o invalidación de conclusión. No unir a nivel persona datasets sin permiso/identidad verificables ni deducir consentimiento por disponer de una API.

## Experimentos y MMM

ExperimentSpec preregistra unidad, asignación/exposición, ventanas, MDE/power assumptions, guardrails, análisis y reglas de parada. Comprobar SRM, contaminación, outcomes tardíos y comparaciones múltiples; no parar al primer p-value favorable sin diseño válido. GrowthBook es un candidato de motor, no garantía de diseño estadístico correcto. Bandits optativos necesitan otra política evaluada; no activar gasto/exploración por recomendación de LLM.

MMM con Meridian/Robyn usa datos agregados limpios y controles/priors justificados, model checks y sensibilidad. Datos insuficientes, colinealidad, cambios de régimen o identificación dudosa producen blocked/needs_review. No fabricar series para «habilitar» un cliente real; sintéticos solo prueban método con verdad conocida. Recomendaciones de mix son escenarios con intervalos/restricciones; no autorizan reasignación. Cuasi-experimentos requieren examen de supuestos/controles, no cualquier corte de presupuesto como experimento natural válido.

## Fixtures originales y E2E

Dos tenants A/B y operadorP, owners/revisores/colaboradores y twins con mandatos distintos. Personas con emails compartidos/homónimos, permisos retirados, dos marcas y fuentes parecidas; dominios.example y sink local, nunca datos reales. Series sintéticas con promociones/estacionalidad/endogeneidad y efecto conocido para evaluar falsas conclusiones; sin copiar material de terceros sin revisar derechos.

| E2E previsto | Criterio |
|---|---|
| A Brief→audiencia→creativo→approval→sink→receipt→reporte | Un efecto, payload exacto y fuentes/actor/mandato recuperables |
| B A consulta IDs/listas/exports/search/jobs deB |0 fugas de datos/metadatos, incluso por caché/Realtime/Anam |
| C Baja/ampliación audiencia tras aprobación | Bajas reducen; nuevos miembros bloqueados hasta nueva aprobación |
| D Timeout tras aceptación y caída de worker | Replay sin doble envío o incertidumbre bloqueada hasta reconciliar |
| E Contenido/policy/coste cambiado tras approval | Versión/hash invalida ejecución |
| F Métricas tardías, duplicadas y ventas devueltas | Nueva revisión con dedup/ajustes, no ROI inflado |
| G Experimento con SRM/contaminación o MMM no apto | No concluir uplift/causalidad ni activar budget |
| H Portal externo y bridge fake fiel | Misma policy/twin; fake no se declara conexión real al padre |
| I Ads test account y pausa incierta | Ningún gasto/activación producción; estado honesto |

Evaluación de agente combina assertions de herramientas/estado protegido con juicio lingüístico calibrado para ES/EN/FR. Un texto convincente no compensa un dato inventado, acción prohibida o consulta cross-tenant. P01/P06 inspiran pruebas de trayectoria/seguridad, no scores heredados. Gates críticos:0 secretos centinela,0 aprobación fabricada,0 fuga,0 duplicado replay,0 gasto no autorizado. Medir p50/p95/coste/cobertura bajo workload registrado; no prometer valores antes de ejecutar.
