# Acta de entrevista al negocio — Reconocimiento (000)

> Fase: documentación y protección (constitución v1.0.0,
> `.specify/memory/constitution.md`). Fecha: 2026-11-18. Este fichero es la
> fuente `entrevista-negocio.md` declarada como pendiente en
> `registro-de-anomalias.md` sección 0.
>
> Método: simulación de entrevista dirigida por el consultor. Preguntas
> decidibles (contexto mínimo no técnico, ejemplo con números reales,
> respuesta por sí/no o elección), ordenadas de mayor a menor impacto
> económico, una por turno, con repreguntas cuando la respuesta no decidía
> la cuestión. El negocio respondió en el papel de seis roles, sin nombres
> (coherente con memoria-historica 5.1: el proyecto carece de autoría).
>
> Roles interlocutores: **RG** (reglas del mercado), **RC** (comercial),
> **RS** (seguridad), **RT** (técnico/arquitecto), **RI**
> (infraestructura/datos), **DIR** (dirección).
>
> Convenio: toda decisión de negocio de este acta constituye el testigo
> **NEGOCIO** (rol + fecha 2026-11-18) exigido por el registro de anomalías
> para reclasificar. Nada de lo aquí decidido se corrige en esta fase
> (Principio III): las decisiones alimentan la modernización, no la fase
> actual.

---

## 1. Decisiones cerradas

| # | Cuestión (origen) | Decisión del negocio | A quién |
|---|-------------------|----------------------|---------|
| P1 | Plazo real de custodia (A-07, RN-34, memoria 1.4/1.6/3.4) | **5 días** (no 5 minutos del contrato, no 4 días del Tutorial) | RG |
| P1b | Alcance de los 5 días | A **los dos relojes**: recuperación del comprador (desde el pago) y cobro del vendedor (desde la entrega) | RG |
| P2 | Política de disputas (A-01, RN-35) | **Sistema de validación** que determine el buen actor: **automático primero, humano en apelación**. El sistema nunca llegó a implementarse (coincide con la promesa del Tutorial.js:211-213) | RG |
| P2b | Dinero durante disputa | **Congelado hasta el veredicto**; nadie cobra aunque venza el plazo | RG |
| P4 | ¿DICOM vivo o en desuso? (A-02, contrad. 01) | **Vía viva**: hay que arreglar el registro de clave pública del comprador | RC |
| P6 | Purga de compras fantasma (A-03) | Sin conclusión sobre el pasado (véase P25); **regla nueva: un dataset retirado no debe estar disponible en el catálogo** | RG |
| P7 | Reglas de dinero (A-33) | **Seis confirmadas tal cual**: precio congelado en compra; sobrante devuelto; unicidad de compra; comisión 5 % solo en cobro del vendedor; puertas de cobro (con plazo actualizado a 5 días); cierre irreversible | RG |
| P8 | ¿Mismo dataset por varios vendedores? (A-09, RN-08) | **No**: solo puede venderlo quien lo registró primero (unicidad global). Nota: la seed (P16) mitiga de facto el choque de identificadores | RC |
| P9 | ¿Precio mínimo? (A-08, RN-09) | **No**: el precio cero es legítimo (datasets gratuitos de promoción). El fallo silencioso de precio vacío (NaN) sigue siendo hallazgo | RC |
| P10 | Reglas de permisos y catálogo (A-32) | **Siete confirmadas**, incluida la regla 6 reformulada por el negocio: **retirable solo sin compras en curso** (compras cerradas o recuperadas no bloquean) | RG |
| P11 | Reglas de identidad/plazos/emergencia (A-34) | **Receta física confirmada** (30 MB, nombres fijos); **interruptor de emergencia confirmado** ("siempre tiene que haber un mecanismo de seguridad"); **frontera de plazos CAMBIA a inclusiva** ("5 días o más": en el segundo exacto ya se puede cobrar/recuperar); **conversión de identidad confirmada** con deseo de unificarla en un punto; **refresco de roles** deseado (solucionable con la tecnología actual) | RG |
| P12 | ¿Conservar destroy/destroyAndSend? (A-34, R17) | **No: se retira.** El interruptor de emergencia (congelar sin vaciar) basta | RS |
| P13 | Aprobación de vendedores por posición o identidad (A-11) | **Por identidad** (dirección concreta). El diseño actual por posición queda clasificado como **descuido**, no diseño aceptado | RG |
| P14 | Flujo manual de claves (A-14, R13) | Aceptado de momento; **sustituirlo es prioridad en modernización**. Requisito nuevo: **las claves solo deben ser accesibles por el vendedor, para nadie más** | RG |
| P15 | Semántica de búsqueda (A-20, RN-40) | **Los dos modos son correctos** ("partial" = al menos un criterio; "total" = todos) y **se quedan con sus nombres actuales**. Reclasificable como INTENCIONAL (dos testigos) | RG |
| P16 | Para qué era la "seed" (A-15, RN-44) | Creencia del negocio: **para variar el hash final y evitar identificadores repetidos del mismo dataset**. La seed **se mantiene cumpliendo esa función** (tarea de modernización: hoy no interviene en nada; la variación ocurre de facto por la clave aleatoria, Forms.js:355) | RT |
| P17 | Rol de server.js (A-21, contrad. 09) | **Banco de pruebas**, sin papel productivo. Info nueva: el clúster IPFS de pruebas se montó **fuera de este repositorio** | RT |
| P18 | Nodo 209.250.245.197 (A-36) | **Nunca fue producción** (solo pruebas o nada) | RI |
| P22 | ¿Historial/repositorio previo? (A-38) | **No existe**: el snapshot es todo lo que hay. La cronología reconstruida es la única memoria del sistema. El equipo original queda sin identificar | DIR |
| P23 | ¿Conservar tests históricos? (A-31) | **Conservar tal cual** como referencia histórica (comentados, sin ejecutar) | RT |
| P24 | Doble rol admin+vendedor (A-41, RN-49) | **Prohibirlo**: un admin nunca puede ser vendedor; si una cuenta tiene ambos, se quita uno. La pregunta de visibilidad queda subsumida | RG |

## 2. Cuestiones abiertas o aplazadas (no cerradas)

| # | Cuestión | Estado | Condición anotada |
|---|----------|--------|-------------------|
| P3 | Rotación de credenciales (A-05, R3) | **Aplazada** | "Cuando el sistema vaya a producción, se pensará cómo gestionarlo". Info nueva: el negocio **no considera el sistema en producción** |
| P5 | ¿Firebase como fuente del pago? (A-04, RN-41, R6) | **Aplazada** | "No está decidido que esa vaya a ser ni la base de datos final, ni que sea la solución técnica correcta". Se decide al definir la arquitectura objetivo |
| P19 | MyERC721 / tokenización (A-24) | **ABIERTA** | Dirección: no decidido |
| P20 | Red de destino (A-35) | **ABIERTA** | "Tenemos que investigar" (mainnet vs L2 vs local; ligado al camino a producción) |
| P21 | Responsables de las advertencias "no tocar" (A-37) | **ABIERTA** | Sin responsables asignados; quedan como advertencias documentales |
| P22b | Equipo original | **Sin respuesta** | Sin autoría atribuible; el snapshot (bbc383e4) es el único origen |
| P6b | Purga retroactiva de deals fantasma (A-03) | **Descartada** | Véase P25: los datos se han perdido y no tenían valor |
| P25 | Arqueología de datos (A-03/06/10/23) | **Descartada** | "Todos los datos se han perdido y no tenían valor". Los conteos y tratamientos retroactivos quedan sin objeto; refuerza que no hubo operativa real |

## 3. Información nueva aportada sin pregunta previa (condiciones y prohibiciones)

1. **El sistema no está en producción** (P3): el negocio lo confirma implícitamente al aplazar la gestión de credenciales "cuando vaya a producción".
2. **Las claves solo son accesibles por el vendedor** (P14): requisito de negocio que contradice el render en claro actual (Forms.js:578-589).
3. **Un dataset retirado no debe estar disponible en el catálogo** (P6): contradice el índice nunca depurado (Forms.js:185).
4. **El admin solo debe ser admin** (P24): "no tiene sentido que sea vendedor"; contradice que el código lo permita.
5. **La seed debía variar el identificador** (P16): intención de diseño que el código no implementa.
6. **El clúster IPFS de pruebas se montó fuera del repositorio** (P17).
7. **Todos los datos se han perdido y no tenían valor** (P25): no hubo operativa real; no hay arqueología posible ni necesaria.
8. **El negocio entendió gas ≠ sobrante** (P7b): aclaración registrada; el gas no es devoluble y va al minero, el sobrante es dinero del precio que vuelve al comprador.
9. **Deseos técnicos registrados para modernización** (P11): unificar la conversión de identidad en un punto; mecanismo de refresco de roles.

## 4. Efecto sobre el registro de anomalías (propuesta de reclasificación)

Con el testigo NEGOCIO de este acta (rol + 2026-11-18), las clasificaciones
del `registro-de-anomalias.md` pueden actualizarse así (pendiente de
volcado en su fichero):

- **A-01** — política de disputas decidida (validación mixta + congelación): la semántica "enviar = cobrar" queda como contradicción con la regla de negocio P2.
- **A-02** — prioridad elevada: DICOM es vía comercial viva (P4).
- **A-03** — corrección futura confirmada (regla P6); purga retroactiva descartada (P25).
- **A-05** — aplazada con condición explícita (P3).
- **A-07** — RESUELTA: plazo de negocio = 5 días, ambos relojes (P1/P1b); el Tutorial (4 días) y el contrato (5 minutos) quedan como desviaciones documentales.
- **A-08** — precio 0 es funcionalidad legítima (P9); solo el NaN queda como hallazgo.
- **A-09** — regla de unicidad global confirmada (P8); riesgo mitigado de facto por la seed (P16).
- **A-11** — RESUELTA: aprobación por identidad; la actual es descuido (P13).
- **A-14** — confirmada como deuda con requisito nuevo (claves solo del vendedor) y prioridad (P14).
- **A-15** — intención declarada (variar identificador); la seed se mantiene cumpliendo su función en modernización (P16).
- **A-20** — reclasificable INTENCIONAL (dos testigos) (P15).
- **A-21** — RESUELTA: banco de pruebas (P17).
- **A-24** — sigue ABIERTA (P19).
- **A-31** — conservar (P23).
- **A-32, A-33** — reglas protegidas CONFIRMADAS con dos testigos (P7, P10). Subpregunta RN-20 (reenvío tras rechazo): absorbida por la política de validación de P2 (el rechazo deja de ser el mecanismo; diseño futuro). Orden transfer-antes-de-estado del refund (R22): observación técnica, no requiere negocio.
- **A-34** — reglas confirmadas; destroy RETIRADO (P12); frontera de plazos pasa a inclusiva (P11), en contradicción con el `>` estricto actual (Marketplace.sol:290, 311).
- **A-35, A-37** — ABIERTAS (P20, P21).
- **A-36** — RESUELTA: nunca fue producción (P18).
- **A-38** — RESUELTA parcialmente: no hay historial previo; equipo sin identificar (P22).
- **A-41** — RESUELTA por prohibición del doble rol (P24).
- **A-06, A-10, A-23** (tratamientos retroactivos) — sin objeto: datos perdidos y sin valor (P25).

## 5. Lista de clasificaciones PENDIENTES tras esta entrevista

Quedan abiertas solo: **A-24** (tokenización), **A-35** (red de destino),
**A-37** (responsables de advertencias) y la mitad humana de **A-38**
(equipo original). Ninguna bloquea las specs formales de la fase actual;
las tres primeras son decisiones de dirección para el camino a producción.

---

**Firma metodológica**: entrevista conducida por el consultor (agente),
respuestas del negocio por roles, 2026-11-18. Sin nombres, conforme a la
práctica del proyecto (memoria-historica 5.1). Ninguna clasificación se
corrige en esta fase; este acta es insumo del módulo de modernización.
