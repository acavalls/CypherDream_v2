# Contradicción 05 — Identificador de dataset: bytes32 ↔ base58

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «la identidad pública del dataset es el hash base58 del
multihash IPFS; en cadena vive como bytes32 sin prefijo».

| Sentido | Implementaciones (idénticas entre sí) | Evidencia |
|---|---|---|
| bytes32 → base58 (mostrar) | `"1220" + bytes32.slice(2)` → Buffer → `bs58.encode` | MyDatasets.js:34-38; MyDeals.js:49-53; Buyer.js:64-68 |
| base58 → bytes32 (enviar) | `"0x" + bs58.decode(id).slice(2).toString('hex')` | MyDatasets.js:73 y 82; MyDeals.js:144 y 155; Buyer.js:111, 118, 125, 150; Forms.js:335 |
| origen del bytes32 | dirHash del clúster → `bs58.decode(dirHash).slice(2)` | Forms.js:335 |

Uso: los tres listados (vendedor-datasets, vendedor-deals, comprador) y
las cuatro acciones que envían ids al contrato (cambiar precio, retirar
dataset, subir contraseña, retirar/recuperar/autorizar/rechazar).

## 2. ¿Misma convención o algoritmo?

Sí, exactamente la misma en los diez puntos: prefijo multihash «1220»
(0x12 = sha2-256, 0x20 = 32 bytes), slice(2) para quitar el 0x del
bytes32, Buffer hexadecimal y bs58. No hay variantes de prefijo ni
normalizaciones distintas.

## 3. Ejemplos con resultados distintos

- Ninguno entre implementaciones: para cualquier entrada producen el mismo
  resultado (son la misma función copiada).
- Divergencia contra UNA entrada malformada: si el id mostrado se corrompe
  (un carácter), `bs58.decode` lanza o produce otro bytes32: la TX se
  enviaría contra un id inexistente y el contrato la aceptaría o revertiría
  según la función (p. ej. `updateDatasetPrice` sobre un id no registrado
  actualiza un precio fantasma: Marketplace.sol:275-282 no comprueba
  existencia; SUPOSICIÓN de que `datasetById[id].price = newPrice` crea
  una entrada nueva). Este riesgo es de la convención compartida, no de
  una variante.

## 4. Cuándo divergen y cuándo coinciden

- Coinciden siempre (por construcción: es código idéntico replicado). El
  peligro no es hoy una divergencia, sino el FUTURO: cualquier corrección
  o cambio de formato en un punto y no en los otros nueve crearía
  divergencias silenciosas entre pantallas.

## 5. Historia probable

El comentario «// DECODE 32BYTES IPFS HASH TO BS58» aparece copiado en los
tres listados (MyDatasets.js:34, MyDeals.js:49, Buyer.js:64): es código de
MyDatasets (el contenedor más antiguo de vendedor) replicado al construir
MyDeals y Buyer, y la operación inversa reescrita a mano cada vez que una
acción necesitaba enviar el id. Nunca se extrajo a una utilidad: en esta
fase la constitución lo prohíbe (Principio IV), y la copia fue el camino
de menor resistencia en la original.
