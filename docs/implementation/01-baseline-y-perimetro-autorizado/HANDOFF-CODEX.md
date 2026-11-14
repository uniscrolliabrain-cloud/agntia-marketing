# C01 — Handoff a Codex (revisor)

**No escribir en la rama del implementador.** Leer protocolo, léxico, guardrails, C01 y C02. Revisar SHA congelado de Freebuff.

1. Verificar que SHA del padre y Marketing existen, que cada ruta de código citada existe en ese SHA y que las firmas citadas corresponden a la fuente.
2. Comprobar que los scripts/entorno se distinguen de tests efectivamente ejecutados. `NOT_VERIFIED` si no hubo ejecución.
3. Auditar que el patchset no toca padre, main, secretos, datos de clientes ni runtime.
4. Ejecutar validación documental y registrar comandos, exit codes y resultados; comprobar JSON del manifiesto si se editó.
5. Validar gates C01-G01 y C01-G02, detectar rutas faltantes y contradicciones de README vs código.
6. Emitir `REVIEW.md`: P0/P1/P2/P3, reproducción, estado PASS/BLOCKED/CHANGES_REQUESTED y SHA revisado.

No aprobar por simple lectura del informe de Freebuff.
