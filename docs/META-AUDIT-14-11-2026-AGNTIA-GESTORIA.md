# META AUDIT · Agntia Gestoría · 14-11-2026

**Repositorio:** [uniscrolliabrain-cloud/agntia-gestoria](https://github.com/uniscrolliabrain-cloud/agntia-gestoria/tree/de931bb3092d7b7a9dc566f36cdaef65b7ed198c)
**Referencia:** `de931bb3092d7b7a9dc566f36cdaef65b7ed198c` · **Fecha de auditoría:** 14-11-2026 · **Licencia:** MIT
**Naturaleza:** meta auditoría de código y documentación. No es asesoramiento fiscal, contable ni jurídico.

## 1. Veredicto en una frase

Es el repositorio más maduro de los ocho y el único con producto ejecutable de verdad: **hay código, hay suite verde y hay una lista de pendientes honesta**; el riesgo no es que no exista, es que un cálculo fiscal correcto en apariencia se presente como liquidación válida sin revisión profesional.

## 2. Qué hay, medido

| Componente | Estado observado |
|---|---|
| Código Python | 3.105 líneas en `agntia_gestoria/` |
| Tests | 1.454 líneas; 7 archivos + `tests/integration/` |
| Cliente TypeScript/Hono | `typescript/`, empaquetado local |
| Stack | FastAPI + uvicorn, SQLite, almacenamiento de documentos |
| Motores fiscales | 303 y 130, territorio común, ejercicio 2026 |
| Territorios declarados | común, Canarias, Álava, Bizkaia, Gipuzkoa, Navarra, Ceuta y Melilla |
| Adaptador Odoo | Community 19, opt-in, entorno de laboratorio |
| Issues abiertos | 9 |
| Documentación | 10+ documentos, incluidos `product-scope`, `calculation-engines`, `legal-research`, `odoo-adapter/` |

**Comprobación ejecutada en esta auditoría:** instalación en entorno virtual limpio (`pip install -e '.[dev]'`, exit 0) y `pytest -q` → **91 passed, 6 skipped, 1 warning en 13,22 s**. Los 6 omitidos corresponden a las pruebas que requieren Odoo/PostgreSQL reales (`AGNTIA_RUN_ODOO_TESTS`), coherencia que el propio `pendientes.md` declara.

Esto es lo que ningún otro de los ocho repositorios puede decir hoy: una suite real que pasa, con las pruebas que exigen laboratorio correctamente omitidas en lugar de fingidas.

## 3. Hallazgos prioritarios

### P0.1 — El cálculo es correcto para el supuesto admitido, no para todos

`docs/calculation-engines.md` y el README acotan: los motores 303 y 130 calculan **los supuestos admitidos para territorio común**. El resto —Canarias, forales, Ceuta y Melilla, regímenes especiales, operaciones intracomunitarias complejas— genera expedientes de preparación con fuentes, no liquidaciones. La distinción está escrita y es la correcta, pero debe ser **visible en la interfaz y en cada cifra**, no solo en la documentación: quien vea un 303 calculado para un perfil foral debe toparse con un bloqueo, no con un resultado plausible.

Riesgo concreto: un asesorado con actividad en varios territorios declara un perfil mixto y el motor aplica reglas de territorio común a la parte foral. El diseño dice que los puntos de conexión y repartos requieren revisión específica; el gate debe garantizar que el sistema **no emita** cifra consolidada en ese caso.

### P0.2 — Fechas nominales y calendario oficial

El README es explícito: las fechas calculadas son nominales y requieren contrastar calendario oficial, festivos y domiciliación. Es la decisión correcta y a la vez el punto de mayor exposición práctica: un vencimiento presentado como definitivo y equivocado por un festivo local genera recargo.

Regla propuesta: toda fecha mostrada lleva su origen (regla versionada, evento, calendario aplicado), se marca como propuesta mientras no haya calendario verificado para el territorio, y cambiar el hecho inicial obliga a recalcular. No debe existir una fecha "confirmada" generada por el modelo.

### P0.3 — Autenticación fuera del patrón de la familia

El resto de los SaaS Agntia declara JWT de Supabase con membership verificada. Gestoría usa un modelo distinto: `GESTORIA_OWNER_TOKEN`, `GESTORIA_ACTORS_JSON` con roles `owner`/`reviewer`/`agent`/`viewer`, sesiones de navegador opacas de ocho horas y `GESTORIA_ALLOW_LOCAL_OWNER` para demostración local. Para una aplicación de escritorio o instancia única es defendible y está bien pensado —tokens en servidor, roles acotados, agentes limitados a sus empresas—, pero **es una excepción al contrato de la familia que conviene documentar como decisión, no dejarla implícita**.

Si Gestoría se ofrece como SaaS multiusuario, ese modelo no basta: no hay identidad federada, ni membership por organización, ni revocación central. Y `GESTORIA_ALLOW_LOCAL_OWNER=true` es una bandera de demo que en producción sería un bypass total: debe ser imposible de activar fuera de localhost.

El README ya advierte no compartir el token `owner` con agentes y asignar rol `agent` limitado a sus empresas; ese consejo debería ser un control del servidor, no una recomendación.

### P0.4 — Documentos y datos personales en SQLite

`GESTORIA_DATA_DIR` contiene SQLite y documentos; el aviso de no subirlo a Git está, pero la protección real es otra: cifrado en reposo o disco cifrado, copias separadas, retención definida y borrado verificable. Son datos fiscales de terceros: importes, NIF, cuentas, nóminas potencialmente.

Los documentos son además contenido no fiable y el README lo dice correctamente. Debe aplicarse también a los PDFs y CSV que se importan para el registro económico: una instrucción dentro de una factura no es una orden.

### P0.5 — Adaptador Odoo: borradores con aprobación, y nada más

El adaptador Community 19 es opt-in, importa de forma no verificada, detecta conflictos y crea **facturas borrador con aprobación humana**. No publica facturas ni presenta declaraciones. El diseño es prudente y el `pendientes.md` enumera lo que falta con precisión: smoke en dos bases, backup/restore con PostgreSQL y filestore, caducidad de credenciales, procedencia del build, contención de incertidumbre.

Lo importante para el cliente: **nada de eso está verificado**. Docker, Odoo 19 y PostgreSQL no estaban disponibles; el propio repositorio lo declara en lugar de simularlo. Esta auditoría tampoco pudo verificarlo, y por tanto el adaptador es `NOT_VERIFIED` en runtime.

Nota de licencia: Odoo Community se distribuye bajo LGPL-3.0 y sus módulos Enterprise son propietarios. Integrar por API es distinto de enlazar código; conviene dejarlo escrito antes de distribuir.

### P0.6 — «Borrador contable equilibrado» no es asiento correcto

El README distingue con acierto: los borradores comprueban equilibrio, no adecuación al PGC. Es exactamente el tipo de matiz que se pierde al presentar el producto. Un asiento que cuadra puede estar mal imputado, y el sistema no debe sugerir lo contrario ni permitir que un agente lo dé por revisado.

## 4. Modelo y límites

| Objeto | Conserva | No acredita |
|---|---|---|
| `PerfilEmpresa` | actividad, territorios, impuestos y régimen declarado. | aplicabilidad fiscal correcta en casos mixtos. |
| `RegistroEconomico` | documento, referencia única, importe y fecha. | que el documento sea válido o el gasto deducible. |
| `ExpedientePreparacion` | fuentes, datos, detección de modificaciones y revisor. | liquidación presentada ni conformidad de la administración. |
| `CalculationRun` | motor, versión, supuestos, entradas y traza. | resultado extensible a otro territorio o ejercicio. |
| `DeadlineProposal` | regla, evento, calendario y estado. | fecha definitiva sin calendario verificado. |
| `ReviewRecord` | revisor, rol, versión y decisión. | representación ante la administración. |

## 5. Riesgos de operación

- **Un solo nodo.** SQLite y una cola de un proceso: no hay concurrencia ni alta disponibilidad. Es correcto para instancia única; inviable como SaaS sin cambiar el motor.
- **Copias.** `pendientes.md` reconoce que backup/restore con PostgreSQL y filestore no se ha probado. Para datos fiscales, un restore no probado es un riesgo de pérdida real.
- **Retención de claves a 42 días** es una propuesta, no una aprobación; si la restauración tolerada crece, la ventana debe crecer con ella.
- **Observabilidad.** Sin métricas de cálculo ni trazas, un resultado raro se investiga leyendo código.
- **Nueve issues abiertos** en un repositorio de esta criticidad merecen triaje explícito antes de cualquier piloto con datos reales.

## 6. Pruebas: lo ejecutado y lo que falta

Ejecutado aquí: suite unitaria y de contrato (91 pasan, 6 omitidos por requerir Odoo). Eso cubre API, motores, informes y endurecimiento del adaptador según los nombres de los archivos de test.

**No verificado**, y declarado como tal por el repositorio y por esta auditoría: Odoo 19 real, PostgreSQL, backup/restore, credenciales reales, dos bases A y B, presupuesto de carga, runtime de `agente`, presentación telemática y cualquier interacción con la administración.

Criterio para el futuro: una cifra fiscal solo se considera probada con caso, fuente normativa, versión del motor y contraste humano; un test verde de fórmula no valida una obligación tributaria.

## 7. Recomendaciones, por orden

1. **Bloquear por territorio**: impedir cifras consolidadas cuando el perfil incluya territorios fuera del alcance de los motores.
2. **Marcar fechas como propuestas** hasta que exista calendario verificado, y registrar cuál se usó.
3. **Decidir el modelo de identidad**: instancia única con token, o SaaS con JWT y membership. Documentar la elección.
4. **Cerrar el laboratorio Odoo** (backup/restore, credenciales, dos bases) o mantener el adaptador desactivado por defecto.
5. **Cifrado y retención** de `data/`, con restore probado y borrado verificable.
6. **Triaje de los 9 issues** con criterio de riesgo fiscal.

## 8. Resultado

Meta auditoría de código con **una comprobación real ejecutada** (instalación limpia y `pytest`: 91 pasan, 6 omitidos). No se modificó el repositorio, no se conectó Odoo ni PostgreSQL, no se presentó ningún modelo y no se usaron datos reales. Es el repositorio del conjunto con mejor relación entre lo que promete y lo que demuestra.
