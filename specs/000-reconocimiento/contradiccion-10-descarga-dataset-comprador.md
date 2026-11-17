# Contradicción 10 — Descarga del dataset por el comprador

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «el comprador obtiene el fichero que compró».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: streaming cifrado Enigma+IPFS+StreamSaver | `getFileFromIPFS`, Buyer.js:171-317 (stream de escritura 180-181, `ipfs.ls` 306-314, descifrado por partes 192-303) | Botones «Download file» (deals activos, Buyer.js:350-352) y «Decrypt file» (cerrados, Buyer.js:415-417), con claves descifradas en estado |
| B: enlace `<a download>` | Buyer.js:418 (`<a href={this.state.dataFile} download="myfile.txt"> Download </a>`) | Botón «Download» del bloque de deals cerrados |
| C: guardian de A | Buyer.js:173 (`if (this.state.decryptedIV && this.state.decryptedKey)`) | Puerta lógica de A |

## 2. ¿Misma convención o algoritmo?

No. A es un pipeline completo: lista las partes del directorio IPFS
(`ipfs.ls`), las lee una a una (`ipfs.getReadableStream`), las reensambla
en un Readable manual y las descifra con AES (Enigma) escribiendo en
StreamSaver (Buyer.js:192-303). B es el mecanismo nativo de descarga del
navegador apuntando a un `href`. No comparten ni una línea: B depende de
`state.dataFile` y A de `state.decryptedIV/decryptedKey`.

## 3. Ejemplos con resultados distintos

- **Entrada**: comprador con deal cerrado (dataset X ya retirado por el
  vendedor) y clave privada ECIES correcta.
  - A («Decrypt file», tras introducir la clave en el modal): descarga y
    descifra el dataset a «filename1» vía StreamSaver.
  - B («Download»): `state.dataFile` es null para SIEMPRE (Buyer.js:29; no
    hay asignación en todo el fichero) → el enlace apunta a
    `href="null"` → el navegador descarga una página en blanco o no
    hace nada (SUPOSICIÓN de comportamiento por navegador).
- **Cuantificación**: A funciona el 100 % de las veces con claves válidas;
  B el 0 %. La divergencia es binaria: fichero vs nada.
- **Caso límite compartido**: sin claves descifradas, A retorna en
  silencio (guard C, Buyer.js:173) y B sigue mostrando su enlace muerto:
  ambos «no hacen nada», por caminos opuestos.

## 4. Cuándo divergen y cuándo coinciden

- Divergen siempre que se comparen: uno produce el fichero, el otro nunca.
- Coinciden visualmente solo en el estado sin claves (nada ocurre), lo que
  explica la confusión: el usuario ve DOS botones de descarga y ninguno
  responde hasta que usa el modal; el que responde es A.

## 5. Historia probable

B parece el primer intento («download="myfile.txt"» con nombre fijo y
enlace genérico: el patrón mínimo de CRA/descarga de tutorial), abandonado
cuando el dataset resultó ser un DIRECTORIO cifrado por partes que el
navegador no puede descargar de un tirón: entonces se escribió A (el
pipeline con StreamSaver,.streamsaver y Enigma). B quedó en el bloque de
deals cerrados como resto arqueológico; `dataFile` sin asignar es la
secuela del cambio de plan.
