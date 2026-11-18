# META AUDIT · Agntia Vídeo · 14-11-2026

**Repositorio:** [uniscrolliabrain-cloud/agntia-video](https://github.com/uniscrolliabrain-cloud/agntia-video/tree/dae608ac40a9afd53e669b9f1b63e201ecf96a96)
**Referencia:** `dae608ac40a9afd53e669b9f1b63e201ecf96a96` · **Fecha de auditoría:** 14-11-2026 · **Licencia:** MIT (RNNoise BSD)
**Naturaleza:** meta auditoría de código. No evalúa calidad de edición ni idoneidad editorial del resultado.

## 1. Veredicto en una frase

Es el producto más terminado del conjunto —estudio de podcast funcional, con cliente TypeScript, herramientas para agentes y límites escritos con precisión— y su freno aquí es puramente de entorno: **sin FFmpeg no hay nada que medir**, y sin medir no se puede afirmar que funcione.

## 2. Qué hay, medido

| Componente | Estado observado |
|---|---|
| Código Python | 1.883 líneas (`app`, `media`, `audio`, `jobs`, `models`, `providers`, `storage`) |
| Cliente TypeScript/Hono | 305 líneas; 16 herramientas para agentes (17 con subidas) |
| Interfaz | web propia en `agntia/static/` (HTML/CSS/JS) |
| Pruebas | `test_audio.py`, `test_studio.py`, `browser_smoke.py`, `typescript.test.mjs`, `agent_integration.mjs` |
| Stack | FastAPI + uvicorn, FFmpeg/ffprobe, cola de un proceso |
| Proveedores | DeepSeek (texto) y Gemini (vídeo/audio), opcionales |
| Modelo local | RNNoise incluido, con licencia BSD en `THIRD_PARTY_NOTICES.md` |
| Despliegue | Windows local, Linux, Docker Compose |
| Licencia del código | MIT |

**Comprobación ejecutada en esta auditoría:** instalación limpia (`pip install -e '.[dev]'`, exit 0) y `pytest -q` → **10 failed, 22 errors**, todos con la misma causa: `ValueError: Instala FFmpeg y ffprobe y añádelos al PATH` (32 apariciones). En esta máquina no hay FFmpeg y no fue posible instalarlo (sin permisos de root sobre `dpkg`). **Por tanto: suite `NOT_VERIFIED` por dependencia externa ausente, no por defecto del código.** El repositorio declara esa dependencia como requisito; el fallo confirma que la requiere y que falla de forma explícita en lugar de silenciosa, lo cual es correcto.

## 3. Hallazgos prioritarios

### P0.1 — El material del cliente sale hacia dos proveedores

`Analizar` envía vídeo y audio **reducidos** a Google; el agente y las traducciones envían texto a DeepSeek. Está declarado con claridad, y es la información que más importa a un cliente con material sensible: una entrevista sin publicar, una voz identificable, una grabación con terceros.

Lo que falta para un uso profesional: elección de región, retención del proveedor, base y finalidad por proyecto, y la posibilidad de trabajar sin proveedor (que existe, y debe ser el camino por defecto en un piloto con datos de cliente). El aviso en el README es necesario pero no sustituye a un consentimiento por proyecto ni a un registro de qué se envió y cuándo.

### P0.2 — Caché que no caduca

Las cachés de análisis guardan texto del proyecto en `data/` y **no caducan automáticamente**. Combinado con "los archivos no se borran automáticamente", el resultado es un archivo histórico de transcripciones y análisis que crece sin límite y sin política de retención. Para material de terceros es una exposición silenciosa.

Recomendación: retención por proyecto, borrado verificable, y caché ligada al par contenido/modelo/idioma con vencimiento explícito.

### P0.3 — Un solo propietario, un solo proceso

El diseño es explícito y correcto: pensado para **un propietario de confianza y un único servidor**, sin cuentas multiusuario, sin cuotas por usuario, sin reanudación de subidas y sin almacenamiento S3. `AGNTIA_ACCESS_TOKEN` protege el acceso remoto mediante cookie HttpOnly y el backend rechaza clientes remotos sin token. La advertencia de no usar más de un worker porque la cola es de un proceso está bien puesta.

El riesgo es de expectativa: nada de esto sirve como servicio multi-cliente. Si en algún momento se ofrece a varias empresas, hace falta identidad por usuario, aislamiento por proyecto, cuotas y cola distribuida. Hoy es una herramienta de estudio, y así debe presentarse.

### P0.4 — El render es el efecto irreversible

El agente puede modificar el plan, pero **no renderiza sin que una persona pulse el botón**: esa decisión está tomada y es la correcta. Aun así, conviene blindarla: un render consume CPU, disco y tiempo, y puede sobrescribir una entrega previa. Los planes de IA se validan antes de guardarse; debería garantizarse también que un plan inválido no deja la cola bloqueada y que un trabajo interrumpido al reiniciar queda marcado para relanzar, como el README describe.

Riesgo específico: conflicto entre retoques manuales y cambios del agente. La política declarada —conservar los cambios locales y devolver conflicto en lugar de sobrescribir— es la adecuada y está entre las pruebas previstas (`test_revision_conflict_preserves_saved_plan`). Es el comportamiento que hay que mantener.

### P0.5 — Límites de la edición que el marketing puede inflar

El README dedica una sección a límites y es de una honestidad poco habitual: sin multicámara, sin capas, sin doblaje, sin avatares generados, sin seguimiento de caras, subtítulos aproximados a nivel de frase, sin alineación fonética, detección de beats que no coincide siempre con el pulso, y una IA de voz que no reconstruye audio saturado.

Ese texto es el activo. El riesgo es que una demo lo contradiga: presentar el estudio como "editor con IA que monta solo" cuando el ajuste a beats mueve finales de corte dentro de 0,12–0,40 s y puede cortar frases. Cada afirmación pública debería poder rastrearse a una función y a un límite.

### P0.6 — Superficie de entrada

Hay pruebas específicas para path traversal, deduplicación por SHA-256, límite por archivo (`AGNTIA_MAX_UPLOAD_GB`, 10 por defecto), ignorar enlaces simbólicos y limpieza de subidas parciales. Es la lista correcta. Faltan, para un uso con terceros: validación de tipo real (no solo extensión), cuarentena de archivos corruptos y protección contra bombas de descompresión o vídeos con metadatos maliciosos.

## 4. Modelo y efectos

| Objeto | Conserva | No acredita |
|---|---|---|
| `Project` | briefing, material, versiones y plan. | que el montaje sea el aprobado. |
| `Asset` | hash, tipo, duración y procedencia. | derechos de uso del material. |
| `Plan` | cortes, audio, subtítulos y parámetros. | que el render coincida con el plan. |
| `Render` | versión, parámetros, estado y entrega. | entrega correcta ni reproducible sin FFmpeg local. |
| `Analysis` | proveedor, modelo, idioma y resultado. | transcripción exacta. |
| `Job` | estado, intento y error. | que un trabajo interrumpido se reanude solo. |

**Ejemplo sintético:** un episodio con dos invitados y una canción con licencia solo para web. El sistema transcribe, propone cortes, la persona ajusta dos frases que el análisis cortaba a mitad, sustituye la música por una pista libre y exporta. El plan original se conserva como versión anterior; el render no sobrescribe la entrega previa. Nada de esto se ejecutó aquí por ausencia de FFmpeg.

## 5. Qué verificar cuando haya FFmpeg

1. `python -m pytest -q` completo, con recuento real de pasan/fallan.
2. `test_render_video_with_external_audio_and_vertical_clip` y render de subtítulos.
3. Ajuste a beats y undo, verificando que no se cortan frases.
4. Deduplicación por SHA-256 y rechazo de enlace simbólico.
5. Conflicto de revisión agente/humano.
6. Acceso remoto con y sin `AGNTIA_ACCESS_TOKEN`.
7. `browser_smoke.py` en escritorio y móvil.
8. `typescript.test.mjs` y `agent_integration.mjs` contra el servidor real.

## 6. Recomendaciones, por orden

1. **Ejecutar la suite en un entorno con FFmpeg** y publicar el recuento; hoy no existe evidencia de verde.
2. **Retención de caché y de material** con borrado verificable.
3. **Ruta sin proveedores como opción por defecto** para material de cliente.
4. **Validación de tipo real** además de extensión, y cuarentena de corruptos.
5. **Mantener** la regla de que el agente no renderiza sin acción humana.
6. **Alinear el discurso público con la sección de límites**, que ya está bien escrita.

## 7. Resultado

Meta auditoría de código con **una comprobación ejecutada que resultó no concluyente por entorno**: instalación correcta, suite bloqueada por ausencia de FFmpeg (10 fallos y 22 errores con la misma causa). No se modificó el repositorio, no se contactó a DeepSeek ni Gemini, no se procesó material de terceros y no se generó ningún render. El producto parece sólido y sus límites están bien documentados; lo que falta es la prueba en un entorno completo.
