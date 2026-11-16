# ADR C01 · Frontera de autoridad entre dominios

- **Estado:** aceptada e implementada (2026-11-16).
- **Contexto:** el repo describía en prosa la frontera entre Marketing y los demás dominios de AgntiaPro, pero ninguna línea de código impedía que Marketing se declarase dueño de un efecto ajeno (`publish_post`, `create_quote`, `send_message`, `update_brand_asset`).
- **Decisión:**
  1. El mapa canónico vive en `packages/contracts/src/authority-map.ts` (`AUTHORITY_MAP`, `EFFECT_OWNER`). Es datos, no prosa: se puede importar y testear.
  2. `packages/core/src/authority-map.ts#assertNoSelfGrant` deniega con `409` cualquier handoff en el que `ownerService === 'marketing'` para un efecto con dueño canónico distinto.
  3. Una declaración no canónica que no sea autoconcesión (`ownerService: 'clientes'` para `publish_post`) no se bloquea: se devuelve metadato `authority` y el conflicto queda registrado, porque el contrato MKT-C37 exige registrar conflictos de responsable en lugar de rechazarlos.
  4. `GET /v1/marketing/authority` publica el mapa a agentes y humanos.
- **Consecuencias:**
  - Marketing no puede ejecutar efectos de otros dominios ni declararse su dueño; debe proponer un handoff al dueño.
  - La frontera es auditable y testeable.
  - Queda pendiente el ACL por campo y por recurso (M64), y la política sobre si `toService` debe coincidir siempre con el dueño canónico. Esa segunda decisión es del fundador: hoy se registra como conflicto y no como error.
- **Reversión:** eliminar la llamada a `assertNoSelfGrant` en `service.ts#proposeHandoff` y la ruta `/v1/marketing/authority`; el contrato y los tests quedan como documentación.
- **Datos que nunca llegan al LLM:** tokens, `secretRef`, `emailRef` de contactos, miembros de audiencias y valores de proveedores. El mapa de autoridad sí es público para el agente porque no contiene datos de clientes.
