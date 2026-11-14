# MKT-C39 — Privacidad, derechos y pruebas adversariales

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/39-privacidad-derechos-y-pruebas-adversariales.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Cerrar superficies de fuga y ciclo de vida de datos antes de E2E.

Dependencias: MKT-C38.

Invariante: Fuga, bypass de supresión, secreto o efecto no autorizado detienen campaña.

## Artefactos previstos (no creados)
- `tests/security/`
- `packages/privacy/requests/`
- `docs/threat-model.md`

## Tareas por descomponer
- **MKT-C39-T01** Probar BOLA por API/campo/job/archivo/search/cache/Realtime/export. — **aceptación:** Dos tenants y proyectos compartidos sin metadatos ajenos.
- **MKT-C39-T02** Probar JWT/scope/twin/approval manipulados y revocación. — **aceptación:** Sin owner/default ni provisioning desde user_metadata.
- **MKT-C39-T03** Inyectar instrucciones en sitios/creativos/CSV/adjuntos/tools. — **aceptación:** Datos no alteran política/capacidad/destinatario.
- **MKT-C39-T04** Probar SSRF/redirect/DNS/MIME/HTML/CSV y webhook/OAuth replay. — **aceptación:** Sin egress no aprobado ni ejecución de contenido.
- **MKT-C39-T05** Implementar solicitudes de derechos con identidad/alcance/revisión. — **aceptación:** Export no entrega datos de terceros; borrado no ignora retención legítima.
- **MKT-C39-T06** Propagar supresión a índices/memorias/backends y backups con ACK. — **aceptación:** Restore no resucita datos ni reenvía campañas.
- **MKT-C39-T07** Escanear centinelas y revisar evidencia/logs/reportes públicos. — **aceptación:** Cero secretos/PII de prueba sensible, riesgos pendientes explícitos.

## Gates por ejecutar
- MKT-C39-G01: Documento exige exportar audienceB: policy independiente del modelo bloquea.
- MKT-C39-G02: Restaurar backup anterior a baja conserva la supresión antes de activar worker.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
