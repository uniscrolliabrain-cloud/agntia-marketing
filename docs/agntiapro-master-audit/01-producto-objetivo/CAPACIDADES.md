# Trazabilidad de las 72 capacidades
Fuente [CONCEPT-MASTER](../../concept-master/CONCEPT-MASTER.md), sección 3. Estado de cada Mxx: TARGET DOCUMENTADO; implementación y tests individuales PENDIENTES DE VERIFICAR. No inferir completitud por coincidencia de nombres de archivos.
| Rango | Plano | Campaña constructiva | Evidencia requerida |
|---|---|---|---|
| M01–M10 | Inteligencia de mercado | C03 | fuente, procedencia, caducidad, tenant, ranking y pruebas |
| M11–M20 | Marca y creatividad | C04 | derechos, claims, revisiones, variantes y tests |
| M21–M32 | Distribución, journeys y gasto | C05 | audience snapshot, outbox, approval hash, receipts |
| M33–M44 | Medición y ciencia | C06 | métricas versionadas, experimento, diagnósticos, incertidumbre |
| M45–M52 | Economía | C07 | escenarios, restricciones, datos financieros y sensibilidad |
| M53–M63 | Experiencia agéntica | C08 | tools autorizadas, UI, briefing, auditoría |
| M64–M72 | Plataforma y ecosistema | C01, C02, C09 | authz, contratos, proveedores, privacidad, pruebas cruzadas |
Las 42 campañas MKT-C01–C42 son antecedentes de implementación, no equivalentes a las nuevas C00–C09. Cada patchset debe declarar los Mxx concretos cubiertos y comprobar código existente antes de crear duplicados.
