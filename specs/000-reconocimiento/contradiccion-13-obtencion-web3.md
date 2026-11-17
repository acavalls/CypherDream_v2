# Contradicción 13 — Obtención del proveedor web3

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «conseguir una instancia web3 con la que hablar con la cadena».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: `window.ethereum` + `enable()` | getWeb3.js:8-17 (pide permiso de cuentas; si el usuario rechaza, la promesa se RECHAZA) | Navegadores modernos con MetaMask y similares |
| B: `window.web3` inyectado | getWeb3.js:20-25 (usa el provider legacy SIN pedir permiso) | Navegadores/MetaMask antiguos |
| C: HttpProvider local | getWeb3.js:27-33 (`http://127.0.0.1:9545`, el nodo de desarrollo de Truffle) | Cualquier navegador sin cartera |

Las tres resuelven la misma promesa (`getWeb3()` en getWeb3.js:3-36) y el
consumidor es único: App.componentDidMount (App.js:34).

## 2. ¿Misma convención o algoritmo?

No: tres contratos de salida distintos para el mismo «paso 1» de la
aplicación.

1. A establece una RELACIÓN de permisos con el usuario (popup de
   `enable()`); B y C no piden nada.
2. A puede FALLAR por decisión del usuario (reject → promesa rechazada,
   getWeb3.js:15-17); B y C no tienen ese camino.
3. C apunta a una red fija de DESARROLLO (9545) sin comprobar que existe.
4. Ninguna verifica red/chainId: las tres aceptan la red que traiga el
   provider (App.js:40-43 conecta el artefacto sin validar red).

## 3. Ejemplos con resultados distintos

- **Entrada**: el mismo usuario abre la app en tres navegadores.
  - Con MetaMask moderno (A): ve el popup; si acepta, funciona; si
    rechaza, `componentDidMount` aborta y la app queda con `web3: null`
    (App.js:22-29) SIN mensaje: páginas en blanco salvo Home/Tutorial
    (SUPOSICIÓN: unhandled promise rejection visible solo en consola).
  - Con MetaMask antiguo (B): entra sin popup; las cuentas llegan igual
    (era el comportamiento legacy).
  - Sin cartera (C): «entra» al nodo de desarrollo; si no hay nodo en
    9545, la primera llamada on-chain falla con error de red sin mensaje
    (App.js:43, `Contract.deployed()`).
- **Cuantificación**: para la misma intención del usuario («usar la app»),
  tres resultados: permiso+funciona, funciona sin permiso, o fallo
  silencioso.

## 4. Cuándo divergen y cuándo coinciden

- Coinciden en el resultado final (una web3 operativa) solo cuando el
  entorno es el previsto para cada rama. Divergen en el camino de fallo:
  solo A tiene un fallo CONTROLADO (rechazo del usuario), y ni siquiera
  ese está gestionado aguas abajo.
- Es invisible en demos porque la demo usa el navegador con MetaMask
  desbloqueado (rama A feliz) o el nodo de desarrollo (rama C feliz).

## 5. Historia probable

getWeb3.js es casi literal la plantilla `getWeb3` de las Truffle Boxes de
2018-2019 (mismo orden de ramas, mismos comentarios «Modern dapp
browsers...», «Legacy dapp browsers...», «Fallback to localhost» y el
console.log «No web3 instance injected, using Local web3.»,
getWeb3.js:23, 32): el proyecto arrancó de un box y la utilidad nunca se
adaptó (sin mensaje de error para el usuario, sin chequeo de red). Las
tres ramas son la historia de la evolución de MetaMask congelada en el
snapshot.
