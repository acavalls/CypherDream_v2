# Contradicción 02 — Búsqueda: «partial matching» (unión) vs «total matching» (intersección)

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio. No se decide cuál es la
> correcta.

## 1. Implementaciones implicadas

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: unión de filtros («Allow partial matching?» marcado) | `searchHandler` rama if, GenomicsForm.js:98-127 (recogida de TODOS los campos 100-102, filtro por campo 112-115, concatenación 118, deduplicación 120) | Búsqueda con la casilla marcada, en GenomicsForm y DicomForm (DicomForm.js:94-123) |
| B: intersección por registro (casilla sin marcar) | `searchHandler` rama else, GenomicsForm.js:131-165 (solo campos no vacíos 132-136, boolMatch 138-149, selección 151-158) | Búsqueda sin casilla, en GenomicsForm y DicomForm (DicomForm.js:127-161) |

Ambas resuelven el mismo concepto de negocio: «encontrar datasets en el
índice que encajen con lo que pide el comprador».

## 2. ¿Misma convención o algoritmo?

No, y esta es la contradicción central. Paso a paso para la misma entrada:

1. **Recogida de criterios**: A incluye TODOS los campos, vacíos incluidos
   (GenomicsForm.js:100-102); B solo los no vacíos (132-136).
2. **Combinación**: A filtra la base una vez por campo y CONCATENA los
   resultados (112-118): semántica OR — pasa un registro que cumpla
   cualquier criterio. B marca cada registro false/true por criterios
   incumplidos/cumplidos y solo deja los `true` (138-158): semántica AND
   sobre los campos rellenados.
3. **Los criterios vacíos**: en A aportan arrays vacíos que la
   concatenación ignora (no estorban); en B no existen.
4. **Duplicados**: A deduplica (120); B no necesita (un registro aparece
   una vez como máximo).

## 3. Ejemplos con resultados distintos

Base (índice Firebase): R1 = {Age 30, Country «España», Data VCF},
R2 = {Age 40, Country «Francia», Data VCF}, R3 = {Age 30, Country
«Francia», Data BAM-FILE}.

- **Entrada**: Age=30, Country=Francia, Data=VCF.
  - Camino A (parcial): filtros Age=30 → [R1, R3]; Country=Francia →
    [R2, R3]; Data=VCF → [R1, R2]; concatenado y deduplicado →
    **[R1, R2, R3]** (los tres).
  - Camino B (total): R1 falla Country, R2 falla Age, R3 falla Data →
    **[]** (ninguno).
  - Divergencia: 3 resultados vs 0 para la MISMA entrada.
- **Entrada de un solo criterio** (Data=VCF, resto vacío): A → [R1, R2]
  (los otros filtros aportan vacíos); B → [R1, R2]. **Coinciden**.
- **Cuantificación**: con k criterios rellenados sobre una base de N
  registros, A devuelve la unión de los aciertos por criterio (hasta N) y
  B la intersección (hasta 0); la divergencia crece con k y con la
  dispersión de la base.

## 4. Cuándo divergen y cuándo coinciden

- Coinciden con 0 o 1 criterio relleno (caso más común en pruebas
  manuales: buscar solo por tipo de dato). Divergen con 2 o más criterios
  cuando la base tiene registros que cumplen criterios distintos: la
  parcial devuelve «demasiados» y la total «demasiados pocos».
- Es plausible que nadie lo notara porque cada modo se probó solo: la
  parcial con búsquedas de un campo (donde coincide con la total) y la
  total con búsquedas multi-campo donde el resultado de la parcial no se
  miró.

## 5. Historia probable

Los comentarios del código («//Partial matching...» GenomicsForm.js:97,
«// TOTAL MATCHING» 129) muestran que se diseñaron como dos modos
conscientes, no como un refactor a medias. La estructura (dos ramas dentro
del mismo handler, la segunda casi copiada de la primera) sugiere que la
intersección se escribió primero (es la intuitiva) y la unión se añadió
después para «ampliar» la búsqueda, reutilizando el filtro por campo ya
existente y resolviendo la combinación con concat+dedup en vez de rehacer
el motor. El copy-paste entre GenomicsForm y DicomForm multiplicó el par
por dos (ver contradiccion-03).
