# MKT-C27 — AEO y GEO observacional

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/27-aeo-y-geo-observacional.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Medir visibilidad generativa con panel reproducible y límites.

Dependencias: MKT-C26.

Invariante: No hay garantía de mención/ranking ni API universal de respuestas de consumo.

## Artefactos previstos (no creados)
- `packages/aeo/`
- `docs/aeo-measurement-contract.md`
- `tests/aeo-observations.test.ts`

## Tareas por descomponer
- **MKT-C27-T01** Definir panel de preguntas/fuentes/idiomas/regiones aprobado. — **aceptación:** Se evita personalización sensible y consultas con PII.
- **MKT-C27-T02** Seleccionar APIs/acuerdos de acceso permitidos por proveedor. — **aceptación:** Si no hay acceso, unsupported sin browser scraping evasivo.
- **MKT-C27-T03** Guardar modelo/versión/config/fecha y evidencia de respuesta. — **aceptación:** Observaciones no equivalen al buscador de todos los usuarios.
- **MKT-C27-T04** Definir métricas de mención/cita/cobertura y variabilidad. — **aceptación:** Ausente, error y no disponible no se mezclan.
- **MKT-C27-T05** Comparar cambios con controles/repeticiones y límites explícitos. — **aceptación:** Mejora observada no se declara efecto causal sin diseño.
- **MKT-C27-T06** Proponer mejoras de contenido basadas en fuentes/claridad. — **aceptación:** No fabricar estadísticas/reviews o explotar prompt injection en sitios.
- **MKT-C27-T07** Probar ES/EN/FR, cambio de modelo y coste de consultas. — **aceptación:** Reporte conserva versiones y no extrapola benchmark GEO histórico.

## Gates por ejecutar
- MKT-C27-G01: Proveedor cambia modelo: serie se marca cambio de régimen, no victoria de campaña.
- MKT-C27-G02: Generar fake citations para aparecer más en IA queda bloqueado.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
