# MKT-C40 — Evaluación de agentes y vertical E2E

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/40-evaluacion-de-agentes-y-vertical-e2e.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Verificar trayectoria, datos, efectos y medición con fixtures reproducibles.

Dependencias: MKT-C39.

Invariante: Texto convincente o mock verde no compensan efecto incorrecto o conector sin probar.

## Artefactos previstos (no creados)
- `tests/e2e/`
- `tests/evals/`
- `docs/e2e-evidence.md`

## Tareas por descomponer
- **MKT-C40-T01** Crear fixtures propios A/B/P y dataset con endogeneidad/efecto conocido. — **aceptación:** Sin datos reales ni material sin licencia incorporado.
- **MKT-C40-T02** Ejecutar E2E A–I, reseteando entorno y seeds por caso. — **aceptación:** Estado inicial/final y protected state registrados.
- **MKT-C40-T03** Combinar assertions deterministas de tools/estado con juez de lenguaje. — **aceptación:** No dar PASS a cifra falsa por tono profesional.
- **MKT-C40-T04** Repetir ES/EN/FR y cambios concurrentes de audiencia/policy/claims. — **aceptación:** No extrapolar un idioma o configuración al resto.
- **MKT-C40-T05** Inyectar caída DB/proveedor/worker y revocación en cola. — **aceptación:** Sin doble envío, pérdida de audit o permiso residual.
- **MKT-C40-T06** Medir calidad/coste/latencia/cobertura y conclusiones causales falsas. — **aceptación:** Resultados con métodos/versions; sin scores de autores heredados.
- **MKT-C40-T07** Distinguir real/sandbox/fake y publicar matriz de capacidades. — **aceptación:** Conector sin laboratorio NOT_VERIFIED y disabled, no producto completo.

## Gates por ejecutar
- MKT-C40-G01: Buen fit MMM con recuperación causal mala no pasa gate científico.
- MKT-C40-G02: Respuesta final correcta con acción prohibida intermedia falla la evaluación.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
