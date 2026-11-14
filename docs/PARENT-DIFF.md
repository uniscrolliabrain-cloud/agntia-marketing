# Cotejo con el padre · MKT-C01

**Padre:** `uniscrolliabrain-cloud/agente` @ `54b8d5407a8576459448c4d059a877297d18ca7a`
**Modificaciones al padre:** ninguna. Este documento sólo registra lo que se
leyó y lo que se decidió no reutilizar.

## Qué existe en el padre y qué se usa aquí

| Elemento del padre | Uso en marketing |
|---|---|
| Identidad del agente y personas | **No se copian.** Los twins se vinculan por SHA; no se crea otra plantilla canónica. |
| `Actor`, JWT, membership | Se replica el contrato, no el código. |
| `provenance` | Se conserva la forma `origen/ejecutor@sha`. |
| Catálogo de agentes | Se cita como referencia (`12` en índice, `16` en catálogo: **discrepancia pendiente**). |
| Plantilla de marketing | Existe como plantilla, **no como prueba de ejecución**. |
| Lead discovery / accept | **No** se interpreta como consentimiento comercial ni de campaña. |
| Seguimiento y oposiciones | La oposición del padre es un insumo; la supresión local y su versión mandan. |
| Analytics overview | **No** es un motor MMM. No se usa como tal. |

## Discrepancias registradas

1. **Catálogo 12 vs índice 16.** No se resuelve en esta rama. Cualquier binding
   de proveedor debe leer el catálogo por revisión, no por índice.
2. **Nombres nativos.** Se conservan `tenantId`, `actorId`, `personaId`,
   `kernelTurnId`, `provenance`. No se introduce un `workspaceId` paralelo.
3. **Eventos.** El padre usa `schemaVersion: "1.0"` como literal string; nuestro
   envelope interno usa `schemaVersion: 1` numérico. El bridge
   (`toParentEvent`) emite **`"1.0"` string** y sólo tipos mapeados.

## Lo que este servicio NO hace con el padre

- No escribe en el repositorio del padre.
- No registra agentes canónicos.
- No copia memorias ni personas por defecto a todos los clientes.
- No redelega capacidades: un mandato sólo puede reducir el ámbito del twin.
- No envía eventos con PII, tokens ni cuerpos de mensaje.
