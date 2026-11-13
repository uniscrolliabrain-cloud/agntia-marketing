# Repositorios, licencias y selección

[repositories.json](research/repositories.json) fija ocho SHAs y archivos leídos selectivamente. No se instalaron ni ejecutaron, ni se auditó todo el código. Varias ramas por defecto son de desarrollo; un SHA observado no es un pin de producción. La implementación deberá elegir release/imagen/digest compatibles y probarlos antes de habilitar capacidad.

| Repo | Función candidata | Licencia observada | Selección propuesta |
|---|---|---|---|
| mautic/mautic | Backend opcional de contactos/segmentos/journeys/campañas | LICENSE GPLv3 o posterior; metadata NOASSERTION | API acotada, instancia por tenant inicialmente si aislamiento compartido no probado |
| knadh/listmonk | Newsletter/envío email opcional | Metadata AGPL-3.0 | Alternativa ligera de activación; no reemplaza approvals ni ledger |
| matomo-org/matomo | Medición/reportes web | Metadata/README GPLv3 o posterior | Read API por site binding; plugins premium fuera salvo revisión |
| plausible/analytics | Analítica web agregada | Metadata AGPL-3.0; README diferencia Cloud/CE | Verificar Stats API/funciones por edición, no asumir paridad Cloud |
| growthbook/growthbook | Experimentos/feature flags | Base MIT, carpetas Enterprise con licencia distinta | Experimentos tipados, no acceso libre a SQL/flags globales |
| google/meridian | MMM/escenarios opcionales | Metadata Apache-2.0 | Worker estadístico aislado si dataset/recursos aptos |
| facebookexperimental/Robyn | MMM alternativo | Metadata MIT | Comparación metodológica, no doble motor por defecto |
| PostHog/posthog | Alternativa de analítica/producto/eventos | Base MIT, ee/ separado | Validar operación/licencia, replay off por defecto, API nominada |

No instalar todos. Piloto: core local +sink de correo de pruebas; elegir después Mautic o listmonk y un backend de medición. GrowthBook y MMM son optativos. La UI de estos backends puede existir para administración pero no es obligatoria para el cliente. Preferir API/proceso separado sin copiar upstream; esa separación no sustituye revisión de obligaciones de distribución/red/cambios.

## Lecturas concretas y riesgos

Mautic LeadApiController muestra permisos y grupos de serialización de contactos incluyendo do-not-contact; eso no verifica aislamiento de una instalación ni todos sus endpoints. La documentación señala que la API se habilita administrativamente. La portada de versión del sitio no coincide claramente con su path; discovery y contratos reales son obligatorios. No aplicar un cron/campaign trigger genérico que active trabajo aprobado con otro alcance.

En listmonk se leyó parte de campaigns.go y la API Campaigns. Hay permisos de listas/campañas, pero eso no demuestra frontera multitenant suficiente para nuestro SaaS. Su endpoint de test manda a destinatarios; nunca se usa como dry-run. Cambiar estado a scheduled/running y publicar archivo web son efectos separados. Si no se demuestra autorización por destinatario antes de cada envío, no habilitar autonomía de esa ruta.

Analytics nombra sites/projects remotos, no tenantId local. Validar esa relación sin mapear por nombre. Matomo/Plausible/PostHog exponen métricas con definiciones diferentes; no unificarlas sumando contadores. Configuración de tracking y métodos de captura son cambios sensibles, no simples lecturas de un dashboard.

Meridian y Robyn consumen datos agregados, pero necesitan supuestos, calidad, cómputo y evaluación. El README de Meridian recomienda recursos de GPU; la campaña medirá el perfil real, no promete ejecutarlo cada día por 30€ ni lo usa si faltan datos. La rama default de Robyn observada es específica de cambios del allocator; fijar referencia estable tras evaluar, no usar la rama por inercia.

## Estado inicial de capacidad

Todos los adaptadores: NOT_IMPLEMENTED. Docs de API leídas no son VERIFIED_RUNTIME. Unknown/forbidden/missing module quedan deshabilitados y explicados. No recurrir a un admin, otro backend, scraping o datos sintéticos presentados como reales para simular integración. Rutas genéricas SQL/HTTP/ORM/method no se exponen al LLM.
