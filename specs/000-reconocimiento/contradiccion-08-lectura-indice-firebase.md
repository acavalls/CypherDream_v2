# Contradicción 08 — Lectura del índice Firebase

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «cargar el catálogo completo del índice en el navegador».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: componente dedicado IndexDB | IndexDB.js:11-23 (`axios.get(".json")` en componentDidMount, guarda en `state.data`) | NADIE: único import vivo comentado (GenomicsForm.js:12) |
| B: inline en GenomicsForm | GenomicsForm.js:78-91 (idéntico: `axios.get(".json")`, catch con console.log, `state.dataDB`) | Búsqueda GENOMICS |
| C: inline en DicomForm | DicomForm.js:74-87 (copia de B) | Búsqueda DICOM |

Las tres usan la misma instancia axios (`axios-orders.js:3-5`, baseURL
`https://data-storage123.firebaseio.com/`).

## 2. ¿Misma convención o algoritmo?

Sí: mismo endpoint (`".json"`, raíz de la base), misma operación (GET
completo sin paginación ni filtros), mismo estado (`database` flag +
datos), mismo tratamiento de error (console.log y nada más). Diferencia
única: A además devuelve `state.data` como render (IndexDB.js:26), lo que
no renderiza nada (un objeto como JSX) y estaba destinado a ser un visor.

## 3. Ejemplos con resultados distintos

- Para la misma entrada (estado del índice en el instante t), A, B y C
  devuelven el mismo objeto. Sin divergencia de resultado.
- Divergencia de COMPORTAMIENTO observable: en /marketplace B y C están
  montados a la vez (contradiccion-11), así que la base completa se
  descarga DOS veces por visita (dos peticiones GET idénticas, GenomicsForm.js:79
  y DicomForm.js:75). Con un índice de N registros y S visitas, se
  transfieren 2×S×N registros.
- Divergencia ante fallo: las tres dejan `data`/`dataDB` en null y solo
  loguean (IndexDB.js:20-22; GenomicsForm.js:88-90; DicomForm.js:84-86);
  ninguna reconecta. Una búsqueda posterior con `dataDB == null` rompe en
  `searchHandler` (SUPOSICIÓN: TypeError al iterar null, GenomicsForm.js:141).

## 4. Cuándo divergen y cuándo coinciden

- Coinciden siempre en el valor; divergen en el coste (doble descarga) y
  en la resiliencia (ninguna reintenta).
- Que A exista completa y sin usar indica que el concepto se resolvió dos
  veces (componente y copia inline) y la segunda ganó por proximidad.

## 5. Historia probable

IndexDB.js es el esqueleto de un visor del índice («IndexDB», con estado
`database/data`) que se abandonó: su único import está comentado en
GenomicsForm.js:12 y su render es un objeto (IndexDB.js:26), señal de que
nunca se terminó. GenomicsForm copió la lógica de carga inline (quizá
primero importando IndexDB, luego pegándola), y DicomForm heredó la copia
con el fork del contenedor (contradiccion-03). La convención de nombres
(`dataDB` vs `data`) marca las dos generaciones.
