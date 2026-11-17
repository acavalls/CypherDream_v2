# Contradicción 11 — Doble render de los formularios del Marketplace

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «mostrar al comprador el formulario de búsqueda GENOMICS/DICOM».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: render condicional muerto | Marketplace.js:7-20 (estado `genomicsForm`/`dicomForm` + handlers `genomicsFormHandler`/`dicomFormHandler`) y 24-39 (render condicionado a ese estado) | NADIE: los handlers no están conectados a ningún onClick (búsqueda de `genomicsFormHandler` sin resultados salvo su definición) |
| B: acordeón estático Bootstrap | Marketplace.js:48-83 (dos `<a data-toggle="collapse">` que muestran `<Genomics>` y `<Dicom>` SIEMPRE, dentro y fuera del acordeón) | La ruta /marketplace actual |

## 2. ¿Misma convención o algoritmo?

Ambas montan los mismos dos componentes con los mismos props
(`contract`, `accounts`, `web3`: Marketplace.js:28-31 vs 59-62 y 35-38 vs
76-79). La diferencia es de CONTROL: A pretendía alternar entre
formularios con estado React; B los pinta todos a la vez y delega el
plegado en el `data-toggle` de Bootstrap (que además requiere bootstrap.js,
comentado en index.js:7-9).

## 3. Ejemplos con resultados distintos

- **Entrada**: el comprador abre /marketplace.
  - B (activa): GenomicsForm y DicomForm se montan DOS VECES cada uno (una
    fuera del acordeón, líneas 28-39, y otra dentro, 59-62 y 76-79) → 4
    instancias vivas → 4 peticiones `axios.get(".json")` por visita (dos
    por componente, contradiccion-08) → el mismo formulario se ve
    duplicado en pantalla.
  - A (muerta): habría 1 instancia visible por tipo, alternando.
- **Entrada**: compra desde el resultado de búsqueda. Cada instancia tiene
  estado propio: un `loading` de una instancia no bloquea a las otras; el
  usuario puede lanzar dos compras simultáneas desde las dos copias
  visibles del mismo resultado (SUPOSICIÓN de UI, la lógica on-chain
  protege con RN-16 solo contra el mismo comprador+dataset+owner).
- **Cuantificación**: 4× la carga del índice por visita y 2× el área de
  formulario respecto al diseño A.

## 4. Cuándo divergen y cuándo coinciden

- Coinciden en el contenido (mismos componentes/props). Divergen en
  cantidad de instancias (2 vs 1 por tipo) y en control (siempre visibles
  vs conmutable).
- El doble render pasó desapercibido porque ambos renders son idénticos y
  apilados: visualmente parece «un formulario con el acordeón raro», no
  cuatro componentes.

## 5. Historia probable

El estado y los handlers de A (Marketplace.js:7-20) son el esqueleto de la
versión conmutable; el acordeón de B es el fallback que se quedó. El
renombre de imports (`../../containers/GenomicsForm/...`, Marketplace.js:3-4)
y la estructura duplicada del JSX sugieren que se añadió B copiando el
bloque del acordeón de Forms.js (que usa el mismo patrón
`#accordion`/`collapse`, Forms.js:663-695) cuando el enfoque A no llegó a
cablearse. El comentado `//console.log(streamer)` de Forms y los handlers
muertos apuntan a la misma sesión de pruebas.
