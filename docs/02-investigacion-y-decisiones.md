# Investigación y decisiones

Fuentes primarias consultadas selectivamente el 12-11-2026. No revisión sistemática ni reproducción de resultados. [sources.json](research/sources.json) distingue código, documentación, anuncios y papers; las inferencias de diseño son propias. Los SHAs upstream son referencias observadas, no releases/imágenes aprobadas para producción.

## Seis papers

| ID | Lectura y hallazgo relevante | Decisión propia |
|---|---|---|
| P01 AD-Bench, revisión junio2026 | Abstract/HTML selectivo sobre evaluación de analítica publicitaria y trayectorias | Evaluar consultas/herramientas y cifras, no solo una respuesta convincente |
| P02 Synthetic Benchmark Dataset with Endogenous Marketing Spend, revisión septiembre2026 | Abstract: datos sintéticos con gasto endógeno y efecto conocido | Fixtures propios con confusión/estacionalidad; evaluar recuperación causal además de ajuste |
| P03 Pseudo-Incrementality Testing, septiembre2026 | Abstract: intervenciones naturales bajo condiciones de identificación | Proponer análisis cuasi-experimental solo tras revisar supuestos y alternativas |
| P04 When Predictive Fit Misleads, noviembre2026 | Abstract/HTML selectivo: ajuste predictivo puede diferir de recuperación RoAS | No seleccionar MMM por R² solamente; documentar calibración/sensibilidad |
| P05 GEO, revisión2024 | Abstract: medición de visibilidad en motores generativos | Monitor con panel reproducible; no extrapolar el benchmark a rankings actuales |
| P06 AgentDojo, revisión2024 | Abstract: instrucciones maliciosas en datos usados por tools | Aislar sitios/creativos/reportes como evidencia no confiable; PEP fuera del modelo |

Ningún porcentaje de esos trabajos se atribuye a Agntia. No se incorporan datos/código de los autores sin revisar licencias. Los diseños de nuestros tests no son réplica de un benchmark ni una validación científica ya conseguida. Modelo con buen fit puede recomendar mal un presupuesto; dato agregado no garantiza causalidad por sí mismo.

## Actualidad observada

HubSpot presentó Marketing Studio y agentes en su Spotlight de septiembre2026 (V01). Adobe anunció CX Enterprise Coworker en junio2026 como orquestación de marketing y experiencia (V02). Salesforce describió equipos agénticos de marketing en junio2026 (V03). Klaviyo anunció apertura headless en septiembre2026 (V04), Braze capacidades de operador/consola de agentes en abril2026 (V05) e Intuit Mailchimp analítica conversacional en mayo2026 (V06). Son referencias de producto declaradas por sus proveedores; no se han probado ni se copian promesas de rendimiento.

Se extrae un patrón: unir brief, datos, producción, aprobación, activación y aprendizaje con interfaz conversacional. Nuestro diseño lo traduce a capacidades nominadas, snapshots, policy determinista y receipts. Una interfaz MCP o un copiloto no elimina ACL, derecho de acceso o autorización del efecto. Las relaciones societarias, precios y límites de producto se revalidarán al elegir un proveedor; no comparar logos como garantía de independencia o equivalencia funcional.

## SEO/AEO y medición

Google documenta que las prácticas SEO siguen siendo relevantes para AI Overviews/AI Mode y no exige una optimización especial adicional (A09). Por eso no se vende un schema mágico o inclusión garantizada. GEO aporta una referencia de evaluación histórica, no permiso para automatizar interfaces de consumo, fabricar citas o generar volumen de spam. El monitor usará APIs/acuerdos autorizados y contará ausencia/no disponible por separado.

Search Console documenta límites que impiden garantizar todas las filas (A07), y GA4 depende de configuración/identidad de reporting (A06). Los informes conservan esa cobertura. Meridian/Robyn son candidatos metodológicos; no generan causalidad verificable por instalarse. Las herramientas de analítica «privacy-first» tampoco certifican la configuración de tracking o los avisos de este SaaS.

## Incertidumbres encontradas

La ruta de documentación Mautic presenta versión de portada inconsistente con el path; se necesita cotejo con instancia. Meta Ads Insights devolvió429 y no se declara verificado. Dos URLs iniciales de Google Ads no fueron accesibles; se localizó la guía oficial Testing que documenta test accounts/validate_only, sin llamada real. Estas limitaciones quedan registradas en vez de ocultarse con ejemplos de otra versión.
