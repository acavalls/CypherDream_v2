# Contradicción 01 — Registro de la clave pública del comprador

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio (el registro fue retirado
> por el negocio el 2026-11-17). No se decide cuál implementación es la
> correcta: pregunta de negocio.

## 1. Implementaciones implicadas

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: registro completo desde la firma de la TX de compra | `buyHandler`, GenomicsForm.js:232-267 (lectura de `getPublicKey` 237, aviso 242-245, reconstrucción TX 247-261, `getSenderPublicKey` 263, `registerPublicKey` 265) | Todo comprador que compra desde el formulario GENOMICS del Marketplace |
| B: compra sin registro de clave | `buyHandler`, DicomForm.js:228-235 (solo `purchaseDataset` + alerta) | Todo comprador que compra desde el formulario DICOM |
| C: prototipo muerto en los tests | test/TestMarketplace.js:656-707 (test comentado con reconstrucción TX anidada, 689-705) | Nadie (test íntegramente comentado) |
| D: receptor de la clave | `registerPublicKey` + `getPublicKey` (Marketplace.sol:391-400, 638-643) y consumidor `submitNewKeys` en MyDeals.js:129-151 | El contrato y el vendedor |

Camino A usa: compra → clave derivada → registro. Camino B usa: compra y
fin. Camino C usaba la misma técnica de A con codificaciones ligeramente
distintas (ver 5).

## 2. ¿Misma convención o algoritmo?

No. A y C comparten algoritmo (reconstruir la TX cruda con ethereumjs-tx y
extraer la clave del remitente), pero difieren en detalles: C codifica
`gasPrice`/`value` con `Buffer(tx.gasPrice)` (TestMarketplace.js:691, 694)
y A con `ethJsUtil.bufferToHex(new ethJsUtil.BN(...))` (GenomicsForm.js:252,
255); C usa `chainId: web3.version.network` (696) y A
`this.props.web3.version.network` (257). B no implementa nada de esto.
El contrato (D) es agnóstico: acepta cualquier cadena como clave pública
(Marketplace.sol:396).

## 3. Ejemplos con resultados distintos

- **Entrada idéntica**: comprador B compra el dataset X del vendedor V con
  precio 2 ETH, sin clave pública previa.
  - Por GENOMICS (camino A): tras la compra, `getPublicKey(B)` devuelve la
    clave pública de 65 bytes hexadecimal; el vendedor puede cifrarle
    IV/clave (MyDeals.js:141-146) y B recibe el dataset.
  - Por DICOM (camino B): tras la compra idéntica, `getPublicKey(B)`
    devuelve `""`; `submitNewKeys` aborta con «Invalid public key from
    buyer» (MyDeals.js:149-151) y el deal queda estancado para siempre (el
    comprador solo puede recuperar el importe tras 5 min, Marketplace.sol:306-311).
- **Cuantificación**: el mismo gesto de negocio («pulsar Buy») produce
  registros de clave pública en ~100 % de las compras GENOMICS y en 0 % de
  las DICOM. La divergencia no es numérica: es presencia/ausencia de un
  derecho (recibir la contraseña).
- Los detalles A vs C no llegan a divergir en resultados porque C nunca se
  ejecuta; si se ejecutara, `Buffer(tx.gasPrice)` vs
  `bufferToHex(new BN(...))` podría producir firmas reconstruidas con
  distinta codificación (SUPOSICIÓN: `getSenderPublicKey` podría fallar o
  dar la misma clave según normalización; pendiente de verificar).

## 4. Cuándo divergen y cuándo coinciden

- Divergen SIEMPRE que el comprador compre por DICOM sin haber comprado
  antes por GENOMICS (que le habría registrado la clave). Coinciden si el
  comprador ya tenía clave pública (GenomicsForm.js:237-240 corta el
  registro en ambos caminos: en A porque retorna, en B porque nunca llega).
- Nadie lo detectó si la operativa real de pruebas se hizo por GENOMICS:
  DICOM era la vía gemela que nadie ejercitó (flujo-aplicacion.md 8.6).

## 5. Historia probable

GenomicsForm (370 líneas) fue el prototipo funcional; DicomForm (339
líneas) es su copia recortada: mismo esqueleto (estado, componentDidMount,
searchHandler, buyHandler) pero el autor recortó de `buyHandler` todo el
bloque de la clave pública (el bloque más complejo del fichero). El
prototipo C muestra que la técnica se desarrolló primero en tests y luego
se portó a GenomicsForm (misma secuencia de pasos), sin volver a pasar por
DicomForm. Estilo: comentarios en mayúsculas y estructura idéntica
respaldan el copy-paste con omisión, no un diseño de dos flujos.
