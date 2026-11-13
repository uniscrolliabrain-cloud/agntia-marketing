# Runtime determinista de marketing

LLM redacta, analiza, propone y explica. Código convencional valida identidad, finalidad, datos, estados, presupuesto, aprobación y ejecución. Un supervisor de modelos añade revisión semántica, no autoridad. El avatar, MCP o un prompt de «director marketing» no conceden acceso adicional.

## Flujo

WorkOrder→CampaignBrief→StrategyProposal→AudienceRule/Snapshot→Asset/Claim review→CampaignRevision→Preview→ApprovalBinding→local commit/outbox→worker revalidation→provider receipt o outcome_unknown→reconciliación→MeasurementSnapshot→revisión/aprendizaje. Cada transición tiene guard/versión/evidencia. Una integración o import no activa campañas de forma colateral.

Campaña propuesta: draft, validating, needs_review, approved, scheduled, running, pausing, paused, completed, cancelled, reconciliation_required. Cada efecto tiene su propio intent, no una bandera «campaign approved» válida para todo. Un backend puede seguir enviando trabajos ya aceptados después de pausar; distinguir orden de pausa, ACK remoto, mensajes en vuelo y cierre confirmado. No prometer recall o gasto exactamente cero después del clic de cancelar.

Journey: grafo versionado con steps allowlist, condiciones tipadas, tiempos IANA, límites de pasos/reentrada/duración, propósito y canal. Preview ejecuta simulación local sin writes/gasto remoto. Enroll requiere elegibilidad demostrada; evento de web o CRM no la concede. Cada paso revalida permiso/supresión/frecuencia/mandato/budget y handoff. El motor decide transiciones, no el modelo. Reentrada y replay no duplican pasos efectuados.

## Audiencia y aprobación

Reglas de segmento en DSL cerrada, nunca SQL del LLM. El preview congela un máximo de sujetos elegibles, selección/campos, finalidad, canal, contenido/variantes, coste y política. Puede almacenar refs/hash sin exponer identidades al modelo. ApprovalBinding incorpora hash de esa revisión, audienceSnapshot, assets/claims, límite temporal, entidad aprobadora y proofRef. Bajas posteriores reducen elegibles; no se añaden personas nuevas aunque ahora cumplan la regla. Expandir membresía, contenido, targeting o coste exige otra aprobación.

Si Mautic/listmonk evalúa listas dinámicas al disparar, demostrar que solo puede enviar al máximo aprobado y que actualiza supresión antes de cada efecto. En caso contrario bloquear dispatch por esa ruta o limitar a una estrategia probada de listas estáticas/sink/control de canal. Una copia de supresión con lag no garantiza que se respetó una baja. La política define un punto de autorización irrevocable del efecto y comunica las limitaciones de mensajes ya aceptados; nunca ignorar revocaciones nuevas para los siguientes.

## Idempotencia y fallos

Commit de intent/audit/key/outbox es local y atómico. HTTP/proveedor no comparte transacción. Guardar operación y payloadHash; replay igual devuelve estado, distinto da409. Leases/fencing evitan ACK local de worker antiguo, pero no bastan para exactamente-una-vez remoto. Tras timeout con posible aceptación no enviar desde otro backend o con nueva key. Consultar referencias/estado; si no hay reconciliación fiable, bloquear y escalar.

Distinguir accepted/sent/delivered/open/click/conversion según prueba y definición. Open tracking puede ser distorsionado por proxies/privacidad; clic no es persona única ni venta. No marcar campaña exitosa por haber pasado el cron. Webhooks se autentican, deduplican y ordenan según reglas explícitas; cursor avanza tras commit. Una edición remota o una aprobación obsoleta crea conflicto, no overwrite silencioso.

## Paid media y control de gasto

Lectura y propuesta son capacidades separadas de mutation. Google Ads testing documenta test accounts y validate_only para operaciones que lo admiten; no se extrapola a todos métodos ni se confunde validación con performance/ausencia de coste de cualquier API. Esta campaña de implementación usa test accounts/simulación para writes y no activa producción. Meta Ads actual no se declara verificado por el429 observado.

En una futura operación real, BudgetReservation, tope aprobado, configuraciones de proveedor, observación de gasto/lag y kill switch reducen riesgo; no garantizan un límite monetario remoto exacto por el mero ledger local. Overdelivery/facturación tardía/pausa asíncrona requieren colchón y reconciliación. Un optimizador produce escenarios con supuestos, nunca cambia presupuesto ni billing por sí solo.
