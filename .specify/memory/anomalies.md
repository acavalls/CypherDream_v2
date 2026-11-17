# Registro de anomalías — CypherDream_v2

Registro de hallazgos conforme al Principio III de la constitución
(`.specify/memory/constitution.md`). Nada de lo aquí registrado se corrige
en la fase de documentación y protección: corregir es decisión del módulo
siguiente.

Clasificaciones usadas: bug, riesgo, rareza, incidente.

## A-01 a A-06

Recogidas en la constitución (`.specify/memory/constitution.md`, sección
"Anomalías Conocidas en el Momento de Ratificar") y en
`specs/000-reconocimiento/mapa-sistema.md` (sección "Zonas oscuras").

## A-07 — Incidente: modificación no autorizada del árbol de trabajo

- **Clasificación**: incidente.
- **Hallazgo**: durante la sesión de trabajo se detectó una modificación en
  el árbol de trabajo de `server.js` que no provenía del agente ni de un
  commit: la respuesta del endpoint `POST /api` cambiaba de
  `{ hola: "kk" }` a `{ hola: "t" }`. Constituye un cambio de comportamiento
  observable prohibido por el Principio I.
- **Evidencia**: `git diff server.js` previo a la reversión (registro en la
  conversación del 2026-11-17); estado consagrado en
  server.js:27 (`res.send(JSON.stringify({ hola: "kk"}));`).
- **Acción tomada**: reversión del árbol con `git checkout -- server.js`;
  ni el commit bbc383e4 ni ningún commit del agente contienen la variante
  `{ hola: "t" }`.
- **Pregunta abierta al negocio**: ¿quién introdujo la modificación y con qué
  intención? ¿Debe vigilarse el árbol de trabajo frente a ediciones externas?
