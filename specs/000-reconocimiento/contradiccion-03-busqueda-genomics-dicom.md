# Contradicción 03 — Módulo de búsqueda duplicado: GenomicsForm vs DicomForm

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: GenomicsForm | GenomicsForm.js:1-370 (estado 16-76, carga del índice 78-91, `searchHandler` 93-166 con ambas ramas, `buyHandler` 232-267) | Ruta /marketplace, tarjeta GENOMICS (Marketplace.js:59-63) |
| B: DicomForm | DicomForm.js:1-339 (estado 11-72, carga 74-87, `searchHandler` 89-162, `buyHandler` 228-235) | Ruta /marketplace, tarjeta DICOM (Marketplace.js:76-80) |

Concepto duplicado: todo el ciclo «cargar índice → filtrar → listar
resultados → comprar».

## 2. ¿Misma convención o algoritmo?

Sí, línea a línea, salvo tres diferencias:

1. Campos del formulario (Age/Country/Gender vs Instrument/Region/
   Resolution): GenomicsForm.js:16-68 vs DicomForm.js:11-64.
2. `buyHandler`: A registra la clave pública (232-267), B no (228-235) —
   tratada en contradiccion-01.
3. A importa ethereumjs-tx y ethereumjs-util (GenomicsForm.js:9-10); B no
   importa nada equivalente (DicomForm.js:1-8).

Todo lo demás es idéntico: mismos nombres de handlers (`searchHandler`,
`inputChangedHandler`, `displayBoxHandler`, `hideBoxHandler`,
`partialMatchingHandler`, `backToFormHandler`, `clearFormHandler`), mismas
ramas, mismos textos («No results were founded.», GenomicsForm.js:350 /
DicomForm.js:319), mismos estilos.

## 3. Ejemplos con resultados distintos

- Para la misma entrada de búsqueda, A y B devuelven resultados idénticos
  cuando los campos comparables coinciden (misma igualdad exacta, mismos
  algoritmos de unión/intersección). Divergencia real: solo la de la
  contradicción-01 (clave pública).
- Efecto cuantificable adicional: al montar /marketplace, AMBOS componentes
  existen (Marketplace.js renderiza los dos, ver contradiccion-11) y cada
  uno lanza su propio `axios.get(".json")` (GenomicsForm.js:79,
  DicomForm.js:75): la misma base de datos se descarga dos veces por
  visita.

## 4. Cuándo divergen y cuándo coinciden

- Coinciden en toda la búsqueda. Divergen en la post-compra (clave
  pública). La duplicidad misma no produce divergencia: produce COSTE (dos
  copias que mantener sincronizadas; cualquier corrección debe aplicarse
  dos veces, y la de la clave pública demuestra que no siempre se aplicó).

## 5. Historia probable

DicomForm es un fork literal de GenomicsForm: misma numeración de líneas
casi 1:1 hasta `buyHandler` (donde A sigue hasta 267 y B termina en 235),
mismos comentarios y nombres. Cronología coherente con que GENOMICS
(BAM/VCF) fue el caso de uso fundacional y DICOM se añadió duplicando el
contenedor en vez de parametrizarlo (los campos son datos, no código).
El handlers muertos de Marketplace.js:12-20 (`genomicsFormHandler`
conmutando entre formularios) sugieren que primero se pensó en un solo
formulario conmutable y se desistió a favor de dos componentes gemelos.
