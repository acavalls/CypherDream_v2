# Contradicción 09 — Anclar (pin) en el clúster IPFS

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «garantizar que el clúster IPFS conserva un CID».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: cliente, CID calculado del dataset | Forms.js:328-333 (`ipfsCluster.pin.add(dirHash, cb)` dentro de `createIpfsDirectory`, tras enlazar las partes) | Publicación de datasets (camino del vendedor) |
| B: servidor, CID fijo a mano | server.js:18-29 (`ipfsCluster.pin.add("QmXjQFbrxkSaxjKQQtSVL24TpXtoK8JVkQ4E8347rY1AAU")` en `POST /api`) | Nadie en la web: no hay referencia a localhost:3001 ni a /api en client/src (flujo-aplicacion.md sección 0) |

Ambas usan la misma librería y el mismo endpoint de clúster
(127.0.0.1:9094: ipfs.js:11 para A, server.js:6 para B).

## 2. ¿Misma convención o algoritmo?

Misma operación (`pin.add`) y mismo clúster; distinta política de entrada:
A ancla el CID resultante del directorio de partes cifradas del dataset
(Forms.js:313-323 construye el dirHash); B ancla un CID hardcodeado
siempre el mismo, sea cual sea la petición (server.js:20), y ni siquiera
usa el cuerpo de la petición.

## 3. Ejemplos con resultados distintos

- **Entrada**: vendedor publica el dataset D (dirHash QmABC...).
  - A: ancla QmABC... → el dataset D queda replicado por el clúster y
    descargable por el comprador (Buyer.js:306-314).
  - B (si alguien llamara a `POST /api`): ancla QmXjQF... sin relación con
    D → el dataset D NO queda anclado → si el nodo local pierde D, el
    comprador no podrá descargarlo aunque haya «pagado».
- **Cuantificación**: B ancla el mismo CID el 100 % de las veces; A, el
  0 % de las veces ancla ese CID y el 100 % el del dataset. No hay
  entrada para la que ambos produzcan el mismo anclaje (salvo que el
  dataset publicado FUERA exactamente el CID de B: SUPOSICIÓN — quizá el
  CID de B sea el dataset biométrico de prueba del negocio; pregunta
  abierta del mapa-sistema 5.3).
- Además, B responde un json de prueba sin relación con el anclaje y
  tampoco informa del error del pin al cliente (server.js:20-27).

## 4. Cuándo divergen y cuándo coinciden

- Nunca coinciden (objetivos distintos por construcción). La divergencia
  es invisible porque B no está cableado a ningún flujo: la aplicación web
  no lo llama (flujo-aplicacion.md sección 0). El riesgo latente es
  organizativo: quien asuma que server.js «es el pin de producción»
  creería que los datasets se protegen, y no es cierto.

## 5. Historia probable

server.js (17 líneas, logs «HOLA!»/«ATPC», respuesta de broma) tiene pinta
de banco de pruebas del SDK ipfs-cluster-api: alguien verificó que sabía
llamar al clúster con un CID conocido antes de escribir la versión real en
Forms.js:328-333. El comentario de ipfs-config/leeme («el fichero api y
config deben ir en el directorio .ipfs del proyecto ipfs») y el CID fijo
sugieren una demo contra un dataset concreto del negocio. Quedó sin
cablear y sin borrar.
