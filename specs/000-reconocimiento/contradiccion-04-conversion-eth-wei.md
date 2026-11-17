# Contradicción 04 — Conversión ETH ↔ wei

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

El mismo concepto de negocio («un precio en ETH se convierte a wei para la
cadena, y de wei a ETH para mostrarlo») está escrito en al menos seis
sitios, con DOS fórmulas de ida:

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: `new BigNumber(Math.pow(10, 18) * precio)` (float primero, BigNumber después) | Forms.js:180 (publicación), MyDatasets.js:74 (cambio de precio) | Registro y `updateDatasetPrice` (valor enviado como objeto BigNumber) |
| B: `value: Math.pow(10, 18) * price` (float puro, sin BigNumber) | GenomicsForm.js:233, DicomForm.js:232 (compra) | `purchaseDataset` (valor enviado como número JS) |
| C: divisiones de visualización `price / Math.pow(10, 18)` | MyDatasets.js:43, MyDeals.js:74, Buyer.js:82 y 91 | Listados al vendedor y comprador |

## 2. ¿Misma convención o algoritmo?

La fórmula base es la misma (10^18 * precio), pero el ORDEN y el TIPO
difieren:

1. A multiplica en coma flotante y después envuelve el RESULTADO (ya
   pérdida-incluida) en BigNumber; no recalcula con precisión arbitraria.
2. B deja el float desnudo; truffle-contract/web3 lo serializa al
   codificar la TX.
3. C divide (operación inversa) solo para pintar.

Paso a paso no hay divergencia de VALOR mientras el float sea el mismo:
«8.2» produce 8199999999999999000 wei en A y en B (dato real calculado con
Node: `8.2 * 10**18` → 8199999999999999000; BigNumber envuelto → idéntico).
La divergencia potencial está en la SERIALIZACIÓN del tipo (BigNumber vs
number) por truffle-contract 4.x (SUPOSICIÓN: ambos caminos terminan en
una cadena decimal correcta; pendiente de verificar con el runner).

## 3. Ejemplos con resultados distintos

- **Divergencia numérica real (contra la intención del usuario, no entre
  A y B)**: el precio escrito no es el precio convertido. Datos reales
  (misma fórmula del código): «8.2» ETH → 8199999999999999000 wei
  (8.199999999999999… ETH, −1000 wei); «0.07» ETH → 70000000000000010 wei
  (+10 wei); «2.05» ETH → 2049999999999999700 wei (−300 wei). Con precios
  «redondos» (0.1, 2, 5) la conversión es exacta.
- **Divergencia A/B (potencial)**: si web3 serializara el float con
  notación científica (a partir de 1e21) la compra revertiría; con precios
  < 1e21 ETH no ocurre (SUPOSIÓN verificable).
- **Divergencia con la unidad de negocio**: MyDatasets muestra
  «Price: X ETH» con la división C sin redondeo de presentación: un precio
  de 2049999999999999700 wei (del propio redondeo de B) se muestra como
  2.0499999999999997 ETH, no como 2.05.

## 4. Cuándo divergen y cuándo coinciden

- A y B coinciden siempre que el precio venga del mismo texto y sea
  < 1e21 ETH (todos los casos reales). Divergirían con precios absurdos o
  si una de las dos vías cambiara de fórmula.
- La divergencia contra el usuario (paso 3, primer punto) se manifiesta en
  precios con decimales «feos» y es invisible porque vendedor y comprador
  usan la MISMA conversión: el contrato compara contra el mismo número
  torcido, así que nadie ve el desfase salvo que audite wei.

## 5. Historia probable

El comentario de Forms.js:180 («where "UA900021343" is the value I need to
convert to numbers only so that it is acceptable to MyERC721 contract»)
revela que la conversión nació para satisfacer a OTRO contrato (un MyERC721
que nunca existió en el repo): el `Math.pow(10,18) * x` es un resto de esa
época, copiado a MyDatasets (mismo patrón con BigNumber) y a los formularios
de compra (sin BigNumber, versión simplificada). La C (división de
presentación) se escribió a mano en cada contenedor al construir los
listados. Tres épocas de la misma idea sin utilidad común (la
constitución prohíbe crear una: Principio IV).
