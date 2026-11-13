# Referentes, patrones y brechas

Comparación de capacidades descritas oficialmente, no prueba competitiva ni compra recomendada. V01–V06 permiten estudiar productos relevantes sin afirmar que el diseño entregue su escala, seguridad, licencias o cobertura. No se han contratado ni ejecutado sus plataformas.

| Referente | Patrón estudiado | Traducción al diseño Agntia | Brecha por demostrar |
|---|---|---|---|
| HubSpot Marketing Studio | Planificación, contexto y producción en un espacio | CampaignBrief→plan→materiales→revisión→activación | UX, conectores, permisos, datos y coherencia real |
| Adobe CX Enterprise Coworker | Orquestación de experiencia/contenido con aplicaciones y agentes | WorkOrder, puertos de dominio y políticas por efecto | Integraciones y operación empresarial, sin reconstruir todas sus nubes |
| Salesforce Agentforce Marketing | Contexto de negocio compartido y agentes colaboradores | Twins, datos tipados, tareas/approvals y eventos compatibles | Wiring real del padre, cobertura y supervisión probada |
| Klaviyo headless | Contexto de marketing utilizable por distintas interfaces | SDK servidor/Hono/tools con una frontera de autorización | Flujos/consentimiento/datos y compatibilidad de despliegue |
| Braze | Journeys, decisión y creatividad dentro del workflow | FSM, experimentos, límites de frecuencia y revisión | Rendimiento multicanal y reglas probadas por proveedor |
| Intuit Mailchimp | Analítica conversacional vinculada a campañas/audiencias | Snapshot, métricas con fuente y explicación del twin | Calidad de datos, definiciones e inferencias verificadas |

Estos son resúmenes de fuentes comerciales. Ninguna cifra anunciada se usa como objetivo alcanzado o promesa. Un proveedor puede tener opciones headless/IA sin que todas estén en planes baratos; no presuponer contratos, APIs abiertas, edición o precio. Evaluar cada capacidad, no «instalar un líder» como sustituto del diseño.

## Ángulos propios a construir

Campaign Evidence Ledger: cada decisión y resultado enlaza brief, datos, versión y evidencia. Audience Authorization Snapshot: el humano aprueba un máximo congelado de personas/reglas/propósito; bajas posteriores reducen, nuevas incorporaciones no entran sin nueva aprobación. Measurement Claim Contract: un reporte identifica si un número es observación, atribución o estimación causal con supuestos. Effect Ownership Map: evita que padre, Mautic, listmonk y redes ejecuten el mismo envío/publicación. Son conceptos de ingeniería propuestos, sin afirmar novedad científica.

Ventaja esperada: autoalojamiento opcional, portabilidad, costes limitados y trazabilidad de trabajo especializado hacia el agente generalista. La presencia por Anam permite explicar un experimento fallido o una audiencia bloqueada, y la UI hace revisable la evidencia. No se pretende crear una segunda organización de empleados ni un segundo scheduler empresarial.

## Qué falta realmente

Todo el producto: DB/RLS, runtime de campañas, conectores, medición, portal, sesiones AV, evaluaciones, restore y operación humana. La documentación no verifica entregabilidad, reputación de dominio, resultado de negocio, anuncios reales ni exactitud causal. Una pyme con pocos datos puede no tener condiciones para MMM o experimentos potentes; el producto debe ofrecer reporte descriptivo útil sin fabricar un análisis avanzado.

La expansión incluye SMS/push/WhatsApp cuando sus permisos/costes se prueben, integración de comercio/facturación, audiencias externas y publicación CMS especializada. Se diseñan puertos, pero no se declara soporte universal por nombrar un canal. El piloto de email/medición y propuestas ads es intencionalmente acotado. Su utilidad debe medirse en resultados reales, con cobertura, límites y revisión comercial/jurídica cuando corresponda.
