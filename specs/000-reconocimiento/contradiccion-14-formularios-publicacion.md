# Contradicción 14 — Manejo del formulario de publicación (rama genomics vs rama dicom)

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «recoger, actualizar y limpiar los metadatos del dataset que va
a publicarse».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: rama genomics (objeto `searchFormGenomics`) | Forms.js:50-100 (campos), inputChangedHandler 222-224 y 237-239, clearFormHandler 249-251 y 264-266, componentDidUpdate 162-168 | Publicación GENOMICS |
| B: rama dicom (objeto `searchFormDICOM`) | Forms.js:102-153 (campos), inputChangedHandler 226-228 y 241-243, clearFormHandler 255-257 y 268-270, componentDidUpdate 170-176 | Publicación DICOM |

Cada handler contiene la MISMA lógica escrita dos veces dentro de dos `if`
sobre `this.state.genomics`/`this.state.dicom` (que además son
mutuamente excluyentes por construcción, Forms.js:195-205).

## 2. ¿Misma convención o algoritmo?

Sí, exactamente: copiar el formulario activo, actualizar/campo a campo o
vaciar, y guardar de vuelta en el objeto correspondiente. Paso a paso los
dos bloques de cada handler son idénticos salvo el nombre del objeto de
estado. Un tercer ejemplo: componentDidUpdate reconstruye `formData` con
el mismo bucle dos veces (Forms.js:162-168 vs 170-176), solo difiriendo
en el origen.

## 3. Ejemplos con resultados distintos

- Para la misma operación (escribir un campo, limpiar el formulario,
  publicar), A y B producen resultados equivalentes: NO hay divergencia
  de resultado.
- Divergencia latente de MANTENIMIENTO: cualquier cambio en la lógica de
  un handler debe hacerse en dos sitios dentro del mismo fichero; olvidar
  uno crea formularios con comportamientos distintos por tipo de datos.
  Ese riesgo ya se materializó una vez en el proyecto: el fork
  GenomicsForm/DicomForm omitió el registro de clave pública
  (contradiccion-01).
- Detalle observable: `inputChangedHandler` copia el formulario con spread
  superficial (`{ ...this.state.searchFormGenomics }`, Forms.js:223): los
  objetos de campo internos se comparten hasta la reasignación; el patrón
  es idéntico en ambas ramas, así que tampoco aquí divergen.

## 4. Cuándo divergen y cuándo coinciden

- Coinciden siempre hoy (lógica idéntica). La divergencia es un riesgo
  futuro de edición, no un comportamiento presente.
- Es invisible porque las dos ramas se tocaron siempre juntas (el fichero
  es único y las ediciones se hacen «en paralelo» a la vista).

## 5. Historia probable

El componente nació genomics-only (`searchForm` único era lo natural) y la
rama DICOM se añadió duplicando cada handler con un `if` en vez de
parametrizar el objeto activo: la elección de dicom/genomics se guarda
como DOS booleanos mutuamente excluyentes (Forms.js:30-31, 195-205) en vez
de un enum, patrón que delata la adición retrospectiva. El mismo refrito
«dos ramas donde había una» se repite en el render (Forms.js:546-562,
bucles gemelos sobre cada formulario).
