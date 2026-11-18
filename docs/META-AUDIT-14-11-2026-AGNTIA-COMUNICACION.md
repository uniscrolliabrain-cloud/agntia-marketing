# META AUDIT · Agntia Comunicación · 14-11-2026

**Repositorio:** [uniscrolliabrain-cloud/agntia-comunicacion](https://github.com/uniscrolliabrain-cloud/agntia-comunicacion/tree/e784c4e1d58107e4257a3aca30f50efa42ae4cf8) · **Privado**
**Referencia:** `e784c4e1d58107e4257a3aca30f50efa42ae4cf8` · **Fecha de auditoría:** 14-11-2026
**Naturaleza:** meta auditoría de estado. No hay producto que auditar.

## 1. Veredicto

**El repositorio está vacío a efectos prácticos: un README de 298 bytes.** Creado el 14-11-2026 a las 09:10, sin documentación, sin campañas y sin código. El tamaño del repositorio informado por GitHub es de 0 KB.

## 2. Contenido íntegro

El README declara, en cuatro líneas:

- Es el departamento agéntico de comunicación corporativa, relaciones públicas, comunicación interna, prensa y gestión de crisis de AgntiaPro.
- Estado: `DOCUMENTATION_ONLY / NOT_STARTED`.
- Los agentes canónicos y las políticas están en `uniscrolliabrain-cloud/agente`.
- "No software ni despliegue".

## 3. Qué significa este estado

| Aspecto | Observación |
|---|---|
| Archivos | 1 (`README.md`) |
| Documentación de producto, arquitectura, seguridad, campañas | **ninguna** |
| Campañas de 42 fases | **no existen** |
| Código, tests | **no existen** |
| Licencia | no declarada (repo privado) |
| Relación con `agente` | una frase, sin contrato |

## 4. Observaciones

**El dominio es el de mayor riesgo reputacional y el de menor tolerancia al error de los nueve.** Comunicación corporativa, prensa y gestión de crisis comparten una propiedad incómoda: la acción es pública, inmediata e irreversible. Un comunicado enviado no se retira; una nota de prensa mal matizada se cita durante años; una respuesta en crisis amplifica el problema si llega tarde o suena automática.

Eso tiene una consecuencia de diseño que conviene fijar antes de escribir código: **este departamento no puede tener envío autónomo**. Ni a prensa, ni a canales internos, ni a redes. La aprobación humana del texto exacto, con portavoz identificado y versión congelada, es el mínimo; y en crisis, además, un responsable con autoridad real, porque la velocidad importa y el modelo no puede decidir la posición de la empresa.

**Hay solapamiento declarado con hermanos.** `agntia-redes` cubre publicación social y comunidad; `agntia-clientes` cubre atención y comunicación con clientes; `agntia-branding` cubre identidad y voz. Comunicación corporativa y prensa son distintos, pero la frontera no está escrita en ninguna parte. Sin un `AuthorityMap` explícito, dos servicios pueden responder al mismo periodista o publicar mensajes contradictorios el mismo día. Ese es el fallo característico de esta familia de repositorios y aquí es más visible porque el dominio es público.

**La gestión de crisis es un proceso con reloj.** Presión de medios, plazos de respuesta, escalado y portavocía necesitan reglas versionadas y responsables nominales, no un chat que redacta rápido. Un "borrador de declaración" generado en treinta segundos puede ser útil; presentarlo como posición oficial, no.

**Falta el registro de fuentes y hechos.** Un comunicado afirma cosas sobre la empresa. Cada afirmación debería poder rastrearse a un dato verificado, igual que en `agntia-legal` una cita se rastrea a una norma. Sin eso, el departamento produce texto plausible sin base, que es exactamente lo que no se quiere en una crisis.

## 5. Qué haría falta para poder auditarlo

1. **Alcance y fronteras** con `redes`, `clientes` y `branding`, con un `AuthorityMap` por encargo.
2. **Contrato con `agente`**: identidad del twin, eventos, autoridad y procedencia.
3. **Regla de oro de efectos**: sin envío autónomo, sin portavocía simulada, sin suplantación de declaraciones oficiales.
4. **Protocolo de crisis**: quién decide, en cuánto tiempo, con qué aprobación y qué se registra.
5. **Trazabilidad de afirmaciones** a fuentes verificadas.
6. **Plan de campañas** en el formato de los hermanos si se quiere auditoría de ejecución por fases.

## 6. Resultado

Meta auditoría de estado: un README de 298 bytes, sin documentación, sin campañas y sin código. **No se modificó nada.** No hay hallazgos técnicos; el riesgo relevante es de diseño y está en el dominio, no en el repositorio: comunicación y crisis son el único ámbito de la familia donde un error se paga en público.
