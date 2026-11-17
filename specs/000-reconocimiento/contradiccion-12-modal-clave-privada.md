# Contradicción 12 — Modal de clave privada del comprador (activo vs cerrado)

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «el comprador introduce su clave privada ECIES para descifrar la
IV y la clave que el vendedor publicó».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: modal en deals activos | Buyer.js:371-383 (BoxModal con input `privateKeyHandler`, botones OK/Hide → `submitPrivateKey`/`hideDecryptDataBox`) | Bloque «My active deals» |
| B: modal en deals cerrados | Buyer.js:429-441 (BoxModal idéntico, mismos handlers) | Bloque «My closed deals» |

Los handlers compartidos: `privateKeyHandler` (Buyer.js:144-147),
`submitPrivateKey` (149-169), `hideDecryptDataBox` (139-142); el control de
visibilidad compartido: `displayBox`/`activeAttributeId`
(Buyer.js:24-25, 132-142).

## 2. ¿Misma convención o algoritmo?

Sí: mismo input type=password, mismo placeholder («Please, introduce your
private key here...», Buyer.js:378 y 436), mismos handlers, mismo
descifrado (`getEncryptedIV`/`getEncryptedKey` + `ecies.decrypt`,
Buyer.js:151-158). La única diferencia nominal es el elemento al que
acompaña (deal activo vs cerrado) y que A solo se abre con `pwdStatus`
true (Buyer.js:132-137 vía showDecryptDataBox) mientras B se abre siempre
(`showDecryptDataBox(event, element.id, true)` con true hardcodeado,
Buyer.js:423).

## 3. Ejemplos con resultados distintos

- **Entrada**: el mismo dataset id X aparece en activos (pwdStatus false)
  y el comprador también tiene un deal cerrado con id Y.
  - A: «Private key» no abre el modal (guard `pwdStatus === true` en
    showDecryptDataBox, Buyer.js:132-137): clic sin efecto.
  - B: «Private key» abre siempre (true hardcodeado, Buyer.js:423).
  - Divergencia de UI para el mismo concepto: un botón obedece al estado
    on-chain, el otro no.
- **Estado compartido**: al abrir el modal de un deal, `displayBox`/`activeAttributeId`
  son GLOBALES al componente (Buyer.js:24-25): si los ids coincidieran en
  ambas listas, el modal se mostraría en las dos a la vez (BoxModal.js:11-13
  filtra por id). Con ids distintos no ocurre (SUPOSICIÓN: los ids activos
  y cerrados son disjuntos por construcción del reparto, Buyer.js:74-94).

## 4. Cuándo divergen y cuándo coinciden

- El descifrado coincide siempre (mismo código). La divergencia está en la
  condición de apertura (estado on-chain vs hardcodeado) y solo se
  manifiesta pulsando «Private key» en un deal activo sin contraseña: un
  camino da un modal, el otro nada.
- Nadie lo vio porque el flujo natural es: activo sin contraseña → no hay
  clave que introducir; cerrado → la clave ya se introdujo antes.

## 5. Historia probable

B es una copia del bloque de A pegada al construir la sección «My closed
deals» (Buyer.js:404-448): mismo JSX, mismos handlers reutilizados, y el
`true` hardcodeado es el rastro de «aquí no hace falta la guard» — se
desactivó la condición pasando el literal en vez de refactorizar el
componente modal. La duplicidad completa del JSX (14 líneas idénticas)
sugiere edición directa sobre el render, no extracción de componente.
