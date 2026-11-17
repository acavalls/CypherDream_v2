# Contradicción 07 — Lista de solicitudes de vendedor: mutación local vs mutación on-chain

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «al aprobar o rechazar una solicitud, esta desaparece de la
lista».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: borrado local en el navegador (duplicado DOS veces, una por botón) | accept: Admin.js:94-99; reject: Admin.js:107-112 (código idéntico: mover último a `index`, delete, recortar) | La UI al pulsar «¿OK?» o «Reject», SIEMPRE (dentro o fuera del if) |
| B: borrado on-chain por índice (duplicado DOS veces en el contrato) | `addDataOwnerStatus` Marketplace.sol:135-139; `removeDataOwnerStatusRequest` Marketplace.sol:165-168 (mismo patrón swap-delete) | El contrato, SOLO si la TX mina y no revierte |
| C: relevo desde la cadena | `refreshRequestsArrayHandler` Admin.js:32-44 → `getDataOwnerRequestStatusArray` (Marketplace.sol:441-446) | Solo al pulsar «Refresh list» |

## 2. ¿Misma convención o algoritmo?

A y B usan el mismo algoritmo (swap-del-último + recorte) y la misma
convención de índice (posición en el array tal como la ve el cliente en el
momento de renderizar el `<select>`). Diferencias de semántica:

1. A se ejecuta INCONDICIONADAMENTE (fuera del `if (this.state.selected)`,
   Admin.js:88/103 vs 94/107); B solo si la TX prospera.
2. A opera sobre la copia local tomada en `componentDidMount`
   (Admin.js:18-29); B sobre el array real del contrato en el momento de
   minar.
3. El índice viajó serializado como JSON a mano en el `value` del select y
   re-parseado (Admin.js:162-175, 56-65): la posición que A y B comparten
   puede estar desfasada entre ambos.

## 3. Ejemplos con resultados distintos

- **Entrada**: lista on-chain [X, Y, Z]; el admin ve [X, Y, Z] y aprueba la
  posición 0 (X). Antes de minar, otro admin rechaza la posición 0 (X con
  swap: la lista pasa a [Z, Y]).
  - A (navegador del primer admin): elimina su posición 0 → lista local
    [Y, Z].
  - B (contrato): `addDataOwnerStatus` con index 0 sobre [Z, Y] aprueba a
    **Z** (quien ocupa la posición 0 al minar) y la lista queda [Y].
  - Resultado: Z es vendedor aunque nadie vio aprobar a Z; las tres copias
    (local A, contrato B, y la del otro admin) muestran tres cosas
    distintas hasta un «Refresh list».
- **Entrada**: el admin pulsa «¿OK?» sin seleccionar nada (`index: null`,
  Admin.js:13). A ejecuta `newArr[null] = newArr[newArr.length-1]`
  (comportamiento dependiente del motor JS, SUPOSICIÓN) y B no hace nada
  (guard `selected`, Admin.js:88). UI y contrato divergen al instante.
- **Entrada**: TX revertida (destinatario ya era vendedor, Marketplace.sol:133).
  A elimina igualmente la entrada local (94-99); B no la elimina. La UI
  dice «aprobado»; la cadena dice «no».

## 4. Cuándo divergen y cuándo coinciden

- Coinciden solo con un admin único, lista estable entre carga y TX, y TX
  minada con éxito — el caso de la demo con un solo administrador.
- Divergen con dos admins concurrentes, con TX fallida, con selección
  vacía, o simplemente si la lista cambió entre el montaje y el clic. El
  «Refresh list» (C) es el único punto de reconciliación, y es manual.

## 5. Historia probable

La duplicidad es doble y simétrica: el mismo swap-delete copiado dos veces
en la UI (accept/reject, Admin.js:94-99 vs 107-112) y dos veces en el
contrato (Marketplace.sol:135-139 vs 165-168). La cronología de los tests
históricos (API «storeOwner» renombrada, test/TestMarketplace.js:58-82)
sugiere que el mecanismo de lista por índice se escribió una vez y se
clonó en cada nueva función sin abstraer. La mutación local optimista
(mutar la UI sin esperar la mina) es un atajo típico de prototipo: con un
solo admin funcionaba siempre y nadie lo cuestionó.
