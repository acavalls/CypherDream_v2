# Flujo de la aplicación — Reconocimiento (000)

> Fase: documentación y protección (constitución v1.0.0,
> `.specify/memory/constitution.md`). Toda afirmación lleva su evidencia
> (fichero:líneas). Lo no verificable se marca **SUPOSICIÓN**.
> Fecha: 2026-11-17. Método: lectura estática paso a paso del código de
> `client/src` y `contracts/Marketplace.sol`; no se ejecutó el sistema.
> Complementa a `specs/000-reconocimiento/mapa-sistema.md` (mapa de módulos);
> aquí se documenta el ciclo de vida completo de cada caso de uso.

## 0. Alcance y topología de la sesión

La aplicación web es una SPA React: `client/src/index.js` monta
`<BrowserRouter><App/></BrowserRouter>` (index.js:11-17) con
`serviceWorker.register()` (index.js:18). La barra de navegación ofrece
cuatro destinos: Home `/`, Tutorial `/tutorial`, Marketplace `/marketplace`
y Profile `/profile` (NavigationItems.js:7-10), montados por el Toolbar en
el Layout (Layout.js:10). Las rutas que renderiza `App` son esas cuatro más
`/profile/Forms`, `/profile/MyDatasets` y `/profile/MyDeals` (App.js:69-124).

Intervienen tres backends, todos fuera del navegador:

- **Contrato Marketplace** (Ethereum): todo el estado financiero y de
  permisos (contracts/Marketplace.sol). El cliente lo carga como artefacto
  `truffle-contract` (App.js:5-6, 40-43).
- **Base índice Firebase** (`https://data-storage123.firebaseio.com/`,
  axios-orders.js:3-5): metadatos de búsqueda.
- **IPFS**: nodo local 127.0.0.1:5001 y clúster 127.0.0.1:9094
  (ipfs.js:4-11).

`server.js` (Express, puerto 3001) **no participa en ningún flujo de la
aplicación web**: no existe ninguna referencia a `3001` ni a `/api` en
`client/src` fuera de artefactos compilados (búsqueda de `3001|/api` en
client/src: solo client/src/contracts/Marketplace.json:4106, 30742, que son
metadatos de compilación). Se excluye de este documento.

Convención de este documento: cada caso de uso se describe como una lista
ordenada de pasos; las bifurcaciones verificadas en el código se enumeran
como casos (A, B, C...). Los puntos donde dos caminos hacen lo mismo con
código distinto se marcan con **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** y se
recogen en el índice de la sección 8.

---

## 1. Caso de uso: abrir la aplicación (conexión de cartera y lectura de roles)

Entradas: ninguna del usuario (solo el navegador y su extensión/cartera).

1. Al cargar, `App.componentDidMount` pide una instancia web3
   (App.js:34). `getWeb3` espera al evento `load` de la ventana
   (getWeb3.js:6) y se bifurca:
   - **Caso A (navegador moderno con `window.ethereum`)**: crea `Web3`
     sobre `window.ethereum`, llama `window.ethereum.enable()` (que puede
     mostrar el popup de permisos de MetaMask) y resuelve (getWeb3.js:8-17).
     Si el usuario rechaza el acceso, la promesa se rechaza
     (getWeb3.js:15-17) y `componentDidMount` interrumpe: el estado queda
     con `web3: null` (App.js:22-29) y las rutas se renderizan con
     `contract`, `accounts` y roles nulos. **SUPOSICIÓN**: sin captura del
     error en App.js:32-59, el rechazo produce una promesa rechazada sin
     gestionar (error de consola), sin mensaje al usuario.
   - **Caso B (navegador legacy con `window.web3`)**: usa el provider
     inyectado sin pedir permisos (getWeb3.js:20-25).
   - **Caso C (sin cartera)**: crea un `HttpProvider` contra
     `http://127.0.0.1:9545` (el nodo de desarrollo de Truffle)
     (getWeb3.js:27-33).
   - **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** A, B y C son tres caminos para
     obtener "una instancia web3", con código distinto y semántica distinta
     (A pide permiso; B y C no). Ver índice 8.1.
2. Obtiene las cuentas: `web3.eth.getAccounts()` (App.js:37). **SUPOSICIÓN**:
   si no hay cuentas (cartera bloqueada o nodo sin cuentas), `accounts[0]`
   es `undefined` y las lecturas de rol y todos los `from` posteriores
   usan `undefined`; el código no contempla este caso (App.js:44-49).
3. Crea la instancia del contrato desde el artefacto
   `client/src/contracts/Marketplace.json` (App.js:40-43).
4. Lee los roles de la cuenta `accounts[0]`:
   `checkAdminStatus` (App.js:44 → Marketplace.sol:406-411),
   `checkDataOwnerStatus` (App.js:45 → Marketplace.sol:413-417) y deriva
   `buyer = !(admin || dataOwner)` **en el cliente**, no en el contrato
   (App.js:46-49).
5. Guarda todo en el estado (App.js:53-58). Los roles solo se leen aquí:
   ninguna transacción posterior reevalúa el rol; un cambio de rol on-chain
   (p. ej. aprobar a un data owner) no se refleja hasta recargar la página
   (evidencia: no hay otra llamada a `checkAdminStatus`/`checkDataOwnerStatus`
   en client/src; única lectura en App.js:44-45).

---

## 2. Caso de uso: navegación y páginas estáticas

Entradas: clic en el menú (NavigationItems.js:7-10) o URL directa.

- **Home** (`/`): render estático con imágenes y textos de marketing; el
  único enlace es "Go to tutorial!" (ancla `<a href="/tutorial">`,
  Home.js:47). No toca contrato ni backends (Home.js:9-88).
- **Tutorial** (`/tutorial`): página estática (App.js:75-79).
- Cualquier otra ruta no matchea ninguna `Route` del `Switch` (App.js:67-126)
  y renderiza solo el Toolbar. **SUPOSICIÓN**: no hay página 404; el
  contenido queda en blanco.

---

## 3. Caso de uso: abrir Profile (despacho por rol)

Entradas: clic en "Profile" o URL `/profile`.

1. `Profile` recibe `admin`, `dataOwner`, `buyer`, `accounts` y `contract`
   (App.js:89-97) y hace tres `if` encadenados que asignan la MISMA
   variable `message` (Profile.js:13-32):
   - `admin` true → renderiza `Admin` (Profile.js:13-18).
   - `dataOwner` true → **sobrescribe** `message` con `DataOwner`
     (Profile.js:20-25).
   - `buyer` true → **sobrescribe** `message` con `Buyer` (Profile.js:27-32).
2. Como App deriva `buyer = !(admin || dataOwner)` (App.js:46-49), los
   casos observables son:
   - **Caso A (solo admin)**: se muestra `Admin`.
   - **Caso B (solo data owner)**: se muestra `DataOwner`.
   - **Caso C (admin y data owner a la vez)**: `message` queda asignado por
     el último `if` que aplique: se muestra **solo `DataOwner`**; la vista
     Admin es inalcanzable para esa cuenta desde /profile
     (Profile.js:13-25). Rareza registrada como A-11.
   - **Caso D (usuario sin roles)**: `buyer` true → se muestra `Buyer`
     (Profile.js:27-32), que es la puerta de entrada del comprador.
   - **Caso E (cuentas/roles undefined por fallo en el paso 1)**:
     **SUPOSICIÓN**: los tres if evalúan falsy y `message` queda `null`
     (Profile.js:11): página en blanco.
3. Dentro de `DataOwner` hay tres enlaces a las vistas de operativa:
   `/profile/Forms`, `/profile/MyDatasets`, `/profile/MyDeals`
   (DataOwner.js:18-40). Las vistas de comprador y admin no tienen menú
   propio: todas sus acciones viven en su única página.

Nota transversal: ninguna ruta está protegida; `/profile/Forms`,
`/profile/MyDatasets` y `/profile/MyDeals` se sirven a cualquier cuenta y el
propio contrato decide con `require` si la transacción es legítima
(App.js:99-124; modificadores en Marketplace.sol:45-63). Las vistas de
vendedor sí se auto-apagan: `MyDatasets` y `MyDeals` solo cargan datos si
`props.dataOwner` es true (MyDatasets.js:21; MyDeals.js:23); `Forms` recibe
el prop `dataOwner` (App.js:101-104) pero **no lo usa en ningún punto**
(Forms.js:26-708, sin referencia a `this.props.dataOwner`).

---

## 4. Caso de uso: operativa del Admin

Entradas: direcciones tecleadas, selección en el desplegable de solicitudes,
clics en botones.

### 4.0 Carga

1. `Admin.componentDidMount` lee la lista de solicitudes de data owner:
   `getDataOwnerRequestStatusArray()` (Admin.js:18 →
   Marketplace.sol:441-446) y la vuelca en `dataOwnerRequestKV` con id/val
   (Admin.js:19-25).
2. Lee `checkMKOwnerStatus(accounts[0])` (Admin.js:27 →
   Marketplace.sol:420-425); si es true, se muestra el modal "Withdraw
   contract fees" (Admin.js:206-215). El flag `propietary` solo lo tiene
   el desplegador del contrato (constructor Marketplace.sol:39-42).

### 4.1 Añadir admin

1. Entrada: dirección en el input (Admin.js:132-134) →
   `addAdminAddressHandler` guarda en estado (Admin.js:46-49).
2. Botón "Add" → `addAdminStatusHandler` →
   `contract.addAdmin(address, {from: accounts[0]})` (Admin.js:72-75).
3. Contrato: `onlyAdmin` + `whenNotPaused`, `require(administrators[admin]
   == false)`, marca true, emite `AdminAdded` (Marketplace.sol:111-118).
   - Caso de fallo: si quien firma no es admin, o la dirección ya lo era,
     o el contrato está pausado → revert (Marketplace.sol:112-115).
   - Divergencia UI/contrato: el botón está disponible para cualquier
     cuenta que llegue a la vista Admin, pero el contrato solo lo permite a
     un admin (Marketplace.sol:112); la UI no lo comprueba antes de enviar.

### 4.2 Quitar admin

1. Entrada: dirección (Admin.js:147-149) → botón "Remove" →
   `removeAdminStatusHandler` → `contract.removeAdmin(address)`
   (Admin.js:82-85).
2. Contrato: el modificador es **`onlyOwner`** (el propietario del
   marketplace), no `onlyAdmin` (Marketplace.sol:120-127). Así, un admin
   sin ser propietario verá su transacción revertirse.
   - Caso de fallo adicional: dirección que no es admin → revert
     (Marketplace.sol:124); contrato pausado → revert.

### 4.3 Aprobar o rechazar una solicitud de data owner (dos variantes de un mismo gesto)

Entrada: selección en el `<select>` de solicitudes; el value es un JSON
serializado a mano con `val` (dirección) e `id` (índice), que el handler
re-parsea (Admin.js:162-175, 56-65).

**Variante A — Aprobar** ("¿OK?" → `acceptDataOwnerRequestHandler`):
1. Si `selected`, envía `addDataOwnerStatus(address, index)`
   (Admin.js:87-93). Contrato: `onlyAdmin`, `require(dataOwnerStatus[owner]
   == false)`, marca true y **elimina la solicitud del array** moviendo el
   último elemento a `index` y recortando (Marketplace.sol:129-141).
2. **Incondicionalmente** (haya o no selección, y sin esperar la mina) muta
   la copia local: mueve el último elemento a `this.state.index` y recorta
   (Admin.js:94-99).
   - Caso de fallo on-chain: dir ya data owner, no-admin, o pausado →
     revert (Marketplace.sol:130-133), pero la lista local se recorta igual
     (Admin.js:94-99 se ejecuta fuera del `if`): la UI puede desincronizarse
     del contrato.
   - Caso de fallo UI: si nunca se seleccionó, `index` es `null` y
     `newArr[null] = newArr[newArr.length-1]` corrompe el array local
     (Admin.js:94-97 con `index: null` de Admin.js:13). **SUPOSICIÓN**:
     añade una entrada `null` y después recorta, con resultado dependiente
     del motor JS.

**Variante B — Rechazar** ("Reject" → `rejectDataOwnerRequestHandler`):
1. Si `selected`, envía `removeDataOwnerStatusRequest(index)`
   (Admin.js:102-106). Contrato: `onlyAdmin`, mismo algoritmo de borrado
   por índice (Marketplace.sol:161-170).
2. Muta la copia local con el **mismo código** que la variante A
   (Admin.js:107-112 vs Admin.js:94-99).

- **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** Aceptar y rechazar comparten el
  mismo efecto local (sacar la solicitud de la lista) implementado dos veces
  con código idéntico duplicado; y en el contrato, `addDataOwnerStatus`
  (Marketplace.sol:135-139) y `removeDataOwnerStatusRequest`
  (Marketplace.sol:165-168) hacen el mismo borrado de array con el mismo
  patrón, duplicado también allí. Ver índice 8.2.
- Botón "Refresh list" relee la lista on-chain (Admin.js:32-44), única vía
  de recuperación tras una desincronización.

### 4.4 Quitar la condición de data owner a alguien

1. Entrada: dirección (Admin.js:194-196) → botón "Remove" →
   `removeDataOwnerStatus` (Admin.js:115-118).
2. Contrato: `onlyAdmin`, `require(dataOwnerStatus[owner] == true)` y
   `require(datasetsByOwner[owner].length == 0)` (Marketplace.sol:143-151).
   - Caso de fallo: el data owner tiene datasets registrados → revert; hay
     que retirar primero sus datasets (uso 6.2 "Remove dataset").

### 4.5 Retirar las comisiones

1. Solo visible si `checkMKOwnerStatus` fue true (Admin.js:27, 206-215).
2. Botón "Withdraw" → `withdrawFeesHandler` → `contract.ownerWithdrawal()`
   (Admin.js:77-80). Contrato: `onlyOwner` + `whenNotPaused`, transfiere
   `fees` acumuladas y las pone a 0 (Marketplace.sol:223-230).
   - Caso de fallo: `fees == 0` no revierte (transfer de 0 es válido);
     no-propietario → revert (Marketplace.sol:224).
   - Las `fees` se acumulan en cada retiro de vendedor: 5 % del saldo de la
     transacción (Marketplace.sol:295-297).

---

## 5. Caso de uso: operativa del comprador (Buyer)

Entradas: clave privada ECIES (hex), clics en botones. El comprador puede
ser un usuario sin roles (caso D de la sección 3) o pedir ser vendedor.

### 5.0 Solicitar ser data owner

Botón "Request" → `requestDataOwnerStatus` →
`contract.requestDataOwnerStatus({from: accounts[0]})` (Buyer.js:105-108).
Contrato: `whenNotPaused`, `require(dataOwnerStatus[msg.sender] == false)`,
apila la dirección en `requestedDataOwnerStatus` (Marketplace.sol:153-159).
Esa solicitud aparecerá en la vista Admin (uso 4.3). Casos de fallo: ya es
data owner → revert; pausado → revert. Tras ser aprobado, el nuevo rol solo
aparece al recargar (sección 1, paso 5).

### 5.1 Carga de la página

1. Lee su lista de datasets comprados: `getBuyerDatasetsList` y
   `getBuyerDatasetsCount` (Buyer.js:37-39 → Marketplace.sol:485-497).
2. Lee el periodo de retirada y el tiempo actual del contrato:
   `getWithdrawalPeriod` (5 minutos; Marketplace.sol:35, 534-539) y
   `getTime` (Buyer.js:54-55 → Marketplace.sol:541-546).
3. Para cada dataset: lee comprador/propietario
   (`getBuyerTransactionsHistory`, Buyer.js:58 → Marketplace.sol:591-596),
   estado de contraseña (`getPasswordUploadStatus`, Buyer.js:59 →
   Marketplace.sol:499-504), estado de retirada (`getWithdrawalStatus`,
   Buyer.js:60 → Marketplace.sol:520-525), checkpoint temporal
   (`getWithdrawalCheckpointStartBuyer`, Buyer.js:61 →
   Marketplace.sol:555-560) y precio (Buyer.js:62 →
   Marketplace.sol:598-603). Decodifica el hash de 32 bytes a base58 con el
   prefijo "1220" (Buyer.js:64-68).
4. Bifurcación por transacción:
   - **Caso A (deal activo, `withdrawalStatus === false`)**: entra en la
     lista de activos con `pwdStatus` y checkpoints (Buyer.js:74-84).
   - **Caso B (deal cerrado, retida ya autorizada/marcada)**: entra en
     "My closed deals" solo con id, owner y precio (Buyer.js:86-94).

### 5.2 Deal activo sin contraseña (`pwdStatus === false`)

Estado UI: "Pending: Password by DataOwner" y cuenta atrás de recuperación
(Buyer.js:387-391). Acciones disponibles y sus caminos:

- **"Download file"** → `getFileFromIPFS`: como `decryptedIV` y
  `decryptedKey` son null (Buyer.js:27-28), la función retorna sin hacer
  nada (guard en Buyer.js:173). Descarga imposible hasta tener claves.
- **"Private key"** → `showDecryptDataBox` exige `pwdStatus === true`
  (Buyer.js:132-137): el modal no se abre. Camino bloqueado por diseño.
- **"Amount recovery"** → `recoverAmountHandler` →
  `contract.recoverTransactionBalance(owner, id32bytes)` (Buyer.js:110-115).
  Contrato: `onlyBuyer`, `require(passwordSentbyDataOwner == false)` y
  `require(now > withdrawalCustodyBuyer.time + 5 minutos)`; devuelve el
  saldo íntegro y revierte todo el estado de compra (borra
  `transactionsHistoryBuyer`, `dataBuyer`, entra en `transactionsHistory`
  y `datasetsByBuyer` para quitar la entrada, borra `transactionStatus`)
  (Marketplace.sol:306-354).
  - Caso A (dentro de los 5 minutos): revert (Marketplace.sol:310-311); la
    UI muestra la cuenta atrás (Buyer.js:390).
  - Caso B (pasado el periodo y sin contraseña enviada): recupera el
    importe y el deal desaparece de sus listas al recargar
    (Marketplace.sol:314-353).
  - Caso de fallo residual: si el vendedor ya envió contraseña
    (`passwordSentbyDataOwner == true`), el require falla siempre
    (Marketplace.sol:310) aunque pase el periodo.
- **"Allow withdrawal"** → `allowWithdrawHandler` exige `pwdStatus === true`
  (Buyer.js:123-130): sin contraseña no hace nada (no alerta).

### 5.3 Deal activo con contraseña enviada (`pwdStatus === true`)

Estado UI: "Pending: Allow withdrawal by Buyer" y "Recovery disabled"
(Buyer.js:387-391). Flujo nominal de descifrado:

1. **"Private key"** → modal (Buyer.js:371-383) → introduce la clave
   privada ECIS en hex (Buyer.js:144-147) → "OK" → `submitPrivateKey`:
   - Lee del contrato la IV y la clave cifradas (base64):
     `getEncryptedIV` y `getEncryptedKey` (Buyer.js:151-152 →
     Marketplace.sol:506-518).
   - Descifra ambas con `ecies.decrypt(userPrivateKey, ...)` dentro de un
     `try` (Buyer.js:156-158).
   - **Caso A (clave correcta)**: convierte hex → Uint8Array, guarda
     `decryptedIV`/`decryptedKey` en estado, alerta "Private key submitted"
     (Buyer.js:159-165).
   - **Caso B (clave incorrecta o formato inválido)**: el `catch` alerta
     "Invalid private key" y no se guarda nada (Buyer.js:166-168); el resto
     del flujo queda bloqueado (el guard de Buyer.js:173 lo impide).
2. **"Download file"** → `getFileFromIPFS` (Buyer.js:171-317):
   - Crea el stream de escritura con StreamSaver ("filename1",
     Buyer.js:180-181).
   - Lista los ficheros del directorio IPFS: `ipfs.ls(id)` (Buyer.js:306-314;
     el `id` es el hash base58 decodificado del directorio creado en la
     publicación, ver 6.1).
   - Por cada parte: crea un `decrypt_stream` Enigma AES con la clave y la
     IV descifradas (Buyer.js:202-207), lee la parte desde IPFS con
     `ipfs.getReadableStream` (Buyer.js:210), reensambla los trozos en un
     `Readable` manual y los canaliza al descifrador, cuyo output se
     escribe en el writer (Buyer.js:212-295). Al terminar la última parte
     cierra el writer y apaga el spinner (Buyer.js:281-284).
   - Caso de fallo: error de `ipfs.ls` → solo console.log (Buyer.js:307-309).
3. **"Allow withdrawal"** → `allowWithdrawHandler` →
   `contract.allowWithdrawal(id32bytes)` (Buyer.js:123-130). Contrato:
   `onlyBuyer`, `require(passwordSentbyDataOwner == true)`, marca
   `allowWithdrawalbyDataPurchaser = true` (Marketplace.sol:214-221). A
   partir de aquí el vendedor puede retirar (uso 6.3, puerta 1) y el deal
   pasa a "cerrado" en la siguiente carga (Buyer.js:74-94).
4. **"Reject password"**: existe el handler
   (`contract.rejectPassword(id32bytes)`, Buyer.js:117-121; contrato:
   `onlyBuyer`, borra IV/clave y marca `rejected[buyer][id] = true`,
   Marketplace.sol:202-212), pero su botón vive en un `<Modal
   show={this.state.invalid}>` y `invalid` solo se pone a `false` en todo
   el fichero (Buyer.js:32, 175): **camino inalcanzable desde la UI**
   (mapa-sistema 5.1.6). Consecuencia on-chain: si `rejected` es true, el
   vendedor no puede ni subir contraseña ni retirar
   (Marketplace.sol:194, 292).

### 5.4 Deals cerrados (uso 5.1, caso B)

- **"Decrypt file"** → mismo `getFileFromIPFS` del paso 5.3.2
  (Buyer.js:415-417), que exige haber pasado antes por el modal de clave
  privada del propio bloque cerrado (Buyer.js:423-441).
- **Enlace "Download"**: `<a href={this.state.dataFile} download>` con
  `dataFile` nunca asignado (Buyer.js:29, 418): apunta a vacío.
  - **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** Descargar el dataset tiene dos
    caminos con código distinto: el streaming Enigma+IPFS
    (Buyer.js:171-317) y el enlace `<a>` muerto (Buyer.js:418). Solo el
    primero funciona. Ver índice 8.3.
- Los dos modales de clave privada (activo Buyer.js:371-383 y cerrado
  Buyer.js:429-441) son el **mismo UI con código duplicado**: mismos
  handlers `privateKeyHandler`/`submitPrivateKey` (Buyer.js:144-169).
  Ver índice 8.4.

---

## 6. Caso de uso: operativa del vendedor (DataOwner)

### 6.1 Publicar un dataset (Forms)

Entradas: tipo de datos (GENOMICS/DICOM), campos del formulario, seed
(opcional), fichero local. Es el flujo más largo de la aplicación.

1. **Elección de tipo**: dos cabeceras de acordeón con onClick:
   GENOMICS → `displayFormGenomicsHandler` (`genomics: true, dicom: false`)
   y DICOM → `displayFormDICOMHandler` (`dicom: true, genomics: false`)
   (Forms.js:195-205, 663-695). Ambos muestran el MISMO `form` variable
   (Forms.js:608-651) poblado de `searchFormGenomics` (Address bloqueada
   con la cuenta, Age, Country, Data BAM/VCF, Gender, Price;
   Forms.js:50-100) o `searchFormDICOM` (Address, Data XR/PET, Instrument,
   Region, Resolution, Price; Forms.js:102-153).
   - **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** Todo el manejo del formulario
     está duplicado por rama: `inputChangedHandler` (Forms.js:219-244) y
     `clearFormHandler` (Forms.js:246-272) repiten los mismos bucles dentro
     de dos ifs `genomics`/`dicom` que hacen lo mismo (copiar el formulario
     activo, actualizarlo, guardarlo). Ver índice 8.5.
2. **Seed**: input de contraseña + botón OK (Forms.js:635-642).
   - Caso A (seed no vacía): `submitSeed` marca `seedConfirmed: true`
     (Forms.js:279-283) y aparece el selector de fichero (Forms.js:564-576).
   - Caso B (seed vacía): no hay confirmación ni mensaje; el flujo se
     detiene silenciosamente (Forms.js:280-282).
   - La seed **no interviene en nada posterior**: la clave AES se genera
     aleatoriamente con `Enigma.AES.create_key()` (Forms.js:355) y la seed
     no se vuelve a leer (mapa-sistema 5.1.7).
3. **Selección de fichero y arranque del cifrado**: `getFileHandler`
   guarda el fichero (Forms.js:285-291) y el botón OK lanza
   `ipfsUploading` (Forms.js:572, 294-537):
   1. `Enigma.init()` (Forms.js:349); genera clave AES aleatoria
      (Forms.js:355) e inicializa AES (Forms.js:357); genera IV aleatoria
      de 16 bytes (Forms.js:359).
   2. Abre el fichero en un stream de lectura por trozos de 30 000 000
      bytes (Forms.js:363-364) y lo canaliza al stream cifrador
      (Forms.js:365, 400). La clase `tagAddition` (Forms.js:367-380) está
      definida pero NO se usa (su pipe está comentado, Forms.js:399).
   3. Cada trozo cifrado se nombra `part_XXXX.txt` según el contador
      (Forms.js:404-440) y se sube al nodo IPFS con
      `ipfs.addReadableStream` (`streamFiles`, Forms.js:383-396); cada hash
      resultante se apila en `hashArray` (Forms.js:457); un `setInterval`
      de 2500 ms reanuda la lectura cuando la suba terminó
      (Forms.js:470-479). Caso de fallo de subida: solo console.log
      (Forms.js:445-447) y el flujo queda detenido (la lectura no se
      reanuda).
   4. Al terminar el cifrado (`aes_stream.on('end')`), un `setInterval` de
      5000 ms espera a `finished` y guarda la IV y la clave en hex en el
      estado (Forms.js:484-500).
   5. `createIpfsDirectory(hashArray)` (Forms.js:298-347): parte del hash
      de un directorio vacío IPFS codificado a mano
      `QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn` (Forms.js:301) y
      enlaza cada parte con `ipfs.object.patch.addLink`
      (Forms.js:313-323); al final fija (pin) el directorio resultante en
      el clúster (Forms.js:328-333) y guarda `ipfsHash` como bytes32
      (prefijo `0x` + hex sin el prefijo multihash) con
      `uploadedData: false` (Forms.js:335-342).
4. **Registro on-chain e indexación**: `componentDidUpdate` detecta
   `uploadedData === false` (Forms.js:156-157) y:
   1. Reconstruye `formData` con los valores del formulario activo + `id`
      (Forms.js:162-176). De nuevo dos bloques gemelos para genomics y
      dicom: **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** (índice 8.5).
   2. Convierte el precio a wei con `BigNumber(10^18 * Price)`
      (Forms.js:180) y llama `contract.registerDataset(ipfsHash, finalPrice,
      {from: accounts[0]})` (Forms.js:182-183). Contrato:
      `onlyDataOwnerStatus`, `whenNotPaused`, `require(dataOwner[msg.sender]
      [id] != true)`; guarda el dataset en `datasetsByOwner`,
      `registeredDatasetsId`, `dataOwner` y `datasetById[id].price`
      (Marketplace.sol:174-188).
      - Casos de fallo: cuenta sin `dataOwnerStatus` → revert
        (Marketplace.sol:175-176); dataset ya registrado por el mismo
        vendedor → revert (Marketplace.sol:178); **SUPOSICIÓN**: precio
        vacío → `BigNumber(NaN)` → la TX se revierte por argumento
        inválido.
   3. Publica los metadatos en Firebase: `axios.post(".json", formData)`
      (Forms.js:185; baseURL axios-orders.js:3-5). No hay tratamiento de
      error ni de éxito de esta petición.
   4. Restablece el estado y alerta "Dataset uploaded" (Forms.js:186-191).
5. **Presentación de claves**: con `finalRead`, la página muestra la clave
   y la IV **en texto plano** para que el vendedor las copie a mano
   (Forms.js:578-589); tendrá que reintroducirlas en MyDeals (uso 6.3).
6. Los spinners "Loading and encrypting" / "Sending to IPFS" existen pero
   los flags `loading` y `encrypting` nunca se ponen a true en Forms.js
   (estado inicial Forms.js:36-37; ninguna asignación en 156-537): nunca se
   muestran.
7. Enlace "Back to profile" (Forms.js:698-701).

### 6.2 Gestionar mis datasets (MyDatasets)

Entradas: nuevo precio, clics "Remove dataset" / "Change price" / "Confirm".

1. **Carga**: solo si `props.dataOwner` (MyDatasets.js:21): lee lista y
   conteo (`getOwnerDatasetsList`/`getOwnerDatasetsCount`,
   MyDatasets.js:22-24 → Marketplace.sol:471-483) y el precio de cada uno
   (MyDatasets.js:33 → Marketplace.sol:598-603); decodifica hashes a base58
   (MyDatasets.js:34-38). Si no es data owner, `loaded` queda false y la
   página se queda vacía (MyDatasets.js:13, 91-93, 150-155).
2. **Cambiar precio**: "Change price" abre el BoxModal del dataset
   (MyDatasets.js:57-60, 111-128; BoxModal solo se muestra para el dataset
   activo, BoxModal.js:7-13) → input (MyDatasets.js:67-70) → "Confirm" →
   `submitNewPrice`: re-codifica el id a bytes32 (MyDatasets.js:73) y envía
   `contract.updateDatasetPrice(id32bytes, newPrice)` (MyDatasets.js:74-76).
   Contrato: `onlyDataOwner(id)`, actualiza `datasetById[id].price` y emite
   `PriceUpdated` (Marketplace.sol:275-282). Alerta "Price updated"
   (MyDatasets.js:77). Nota: el nuevo precio en wei se calcula como
   `10^18 * valor` (MyDatasets.js:74), igual que en la publicación.
3. **Retirar dataset**: "Remove dataset" → `removeDatasetHandler` →
   `contract.removeDataset(id32bytes)` (MyDatasets.js:80-87). Contrato:
   `onlyDataOwner(id)`, `require(transactionsHistory[msg.sender][id].length
   == 0)` y solo entonces lo quita de `registeredDatasetsId` (patrón
   mover-último-y-recortar), de `datasetsByOwner`, pone `dataOwner[...][id]
   = false` y borra `datasetById[id]` (Marketplace.sol:356-389).
   - Caso de fallo: el dataset tiene al menos una compra en su historial →
     revert (Marketplace.sol:361); hay que esperar a que la compradora
     recupere el importe (uso 5.2) o el vendedor retire (uso 6.3), que
     vacían `transactionsHistory` (Marketplace.sol:326-336).

### 6.3 Gestionar mis ventas (MyDeals)

Entradas: IV y clave (las copiadas en 6.1.5), clics "Upload keys" /
"Withdraw".

1. **Carga**: solo si `props.dataOwner` (MyDeals.js:23): por cada dataset
   propio lee su historial de compradores (`getOwnerTransactionsHistory`,
   MyDeals.js:47 → Marketplace.sol:584-589) y precio (MyDeals.js:48); por
   cada comprador lee estado de retirada (MyDeals.js:58 →
   Marketplace.sol:520-525), si el vendedor ya retiró
   (`getTransactionWithdrawStatus`, MyDeals.js:59 → Marketplace.sol:527-532),
   checkpoint (MyDeals.js:61 → Marketplace.sol:548-553) y estado de
   contraseña (MyDeals.js:62 → Marketplace.sol:499-504).
2. **Bifurcación por transacción**:
   - **Caso A (vendedor ya retiró: `transactionBalanceWithdraw == true`)**:
     va a "My closed deals" (id, buyer, precio; MyDeals.js:79-85, 234-259).
   - **Caso B (deal vivo)**: va a la lista activa con `withdraw`,
     `pwdStatus`, periodo y checkpoint (MyDeals.js:67-77). Los datasets sin
     transacciones no se listan (MyDeals.js:88-93). Estado UI: "Pending:
     Password confirmation by Buyer" o "Withdrawal allowed." según
     `withdraw`, más la cuenta atrás de retirada si hay contraseña
     (MyDeals.js:216-221).
3. **Subir la contraseña del dataset** ("Upload keys" → BoxModal con dos
   inputs "Decryption key..." e "IV..." (type password), MyDeals.js:184-214)
   → "Confirm" → `submitNewKeys` (MyDeals.js:127-152):
   1. Lee la clave pública registrada del comprador:
      `getPublicKey(buyer)` (MyDeals.js:129 → Marketplace.sol:638-643).
   2. **Caso A (comprador SIN clave pública registrada, `publicKey ===
      ""`)**: alerta "Invalid public key from buyer" y fin (MyDeals.js:149-151).
      El deal queda estancado: el comprador solo puede recuperar su dinero
      tras el periodo si nadie envió contraseña (uso 5.2). Este caso es
      la consecuencia normal de comprar por DICOM (ver índice 8.6 y
      anomalía A-08).
   3. **Caso B (con clave pública)**: cifra la IV y la clave con
      `ecies.encrypt(bufferPublicKey, ...)` en base64 (MyDeals.js:135-142)
      y envía `contract.passwordUpload(buyer, id32bytes, encryptedIV,
      encryptedKey)` (MyDeals.js:146). Contrato: `onlyDataOwner(id)`,
      `require(passwordSentbyDataOwner[buyer][id] == false &&
      rejected[buyer][id] == false)`, guarda ambas cadenas on-chain y abre
      el custodio del vendedor (`withdrawalCustodyOwner.time = now`)
      (Marketplace.sol:190-200).
      - Casos de fallo: contraseña ya enviada o comprador rechazó → revert
        (Marketplace.sol:194); pausado → revert.
      - La IV y la clave cifradas quedan en el estado público del contrato
        (anomalía A-06, Marketplace.sol:23-24, 196-197).
4. **Retirar el dinero** ("Withdraw" → `withdrawHandler` →
   `contract.withdrawTransactionBalance(buyer, id32bytes)`, MyDeals.js:154-159).
   Contrato (Marketplace.sol:284-304): `onlyDataOwner(id)`; el `require`
   tiene DOS puertas disjuntas (OR) y una condición común:
   - **Puerta 1**: el comprador autorizó la retirada
     (`allowWithdrawalbyDataPurchaser[buyer][id] == true`, uso 5.3.3), o
   - **Puerta 2**: pasaron los 5 minutos desde que el vendedor subió la
     contraseña (`now > withdrawalCustodyOwner.time + withdrawalWaitPeriod`),
   - y en ambos casos: no retirado antes
     (`transactionBalanceWithdraw == false`) y el comprador no rechazó la
     contraseña (`rejected[buyer][id] == false`).
   - Efecto: 95 % para el vendedor, 5 % a `fees` para el propietario
     (Marketplace.sol:295-297), marca `allowWithdrawalbyDataPurchaser = true`,
     saldo a 0, `transactionBalanceWithdraw = true` y transfiere
     (Marketplace.sol:298-301).
   - Casos de fallo: dentro del periodo sin autorización del comprador →
     revert (Marketplace.sol:288-292); `rejected == true` → revert; ya
     retirado → revert (por `transactionBalanceWithdraw == true`).
   - **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** Las puertas 1 y 2 conducen al
     mismo retiro por caminos distintos (autorización explícita del
     comprador vs mero paso del tiempo). Ver índice 8.7.
5. Enlace "Back to profile" (MyDeals.js:251-256).

---

## 7. Caso de uso: buscar y comprar en el Marketplace

Entradas: filtros de búsqueda, casilla "Allow partial matching?", clic
"Search" / "Buy". Accesible a cualquier cuenta (App.js:81-87).

### 7.0 Carga

`Marketplace` renderiza `GenomicsForm` y `DicomForm` SIEMPRE dos veces:
una fuera del acordeón (Marketplace.js:28-39, renderizado condicionado a
estado que nunca cambia) y otra dentro de las tarjetas del acordeón
Bootstrap (Marketplace.js:48-83). Los handlers
`genomicsFormHandler`/`dicomFormHandler` que alimentarían el render
condicionado no están conectados a ningún onClick (Marketplace.js:12-20):
- **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** El mismo par de formularios se
  obtiene por dos vías: el render condicional muerto (Marketplace.js:24-39)
  y el acordeón estático (Marketplace.js:48-83). Ver índice 8.8.
Cada formulario carga el índice completo al montar:
`axios.get(".json")` (GenomicsForm.js:78-91; DicomForm.js:74-87). Caso de
fallo de red: catch con console.log, `dataDB` queda `null` (GenomicsForm.js:88-90).
**SUPOSICIÓN**: buscar con `dataDB == null` rompe en `searchHandler`.

### 7.1 Búsqueda (dos algoritmos)

Botón "Search" → `searchHandler` (GenomicsForm.js:93-166; DicomForm.js:89-162).
Dos caminos según la casilla "Allow partial matching?" (Checkbox,
GenomicsForm.js:299-301):

- **Caso A (casilla marcada — "partial matching")**: recoge TODOS los
  campos del formulario, incluidos los vacíos (GenomicsForm.js:99-102);
  filtra la base completa una vez por campo con igualdad exacta
  (`formData[key] === el[key]`) y CONCATENA los resultados de todos los
  filtros (un registro pasa si coincide con AL MENOS UN criterio; los
  criterios vacíos aportan arrays vacíos que no estorban); elimina
  duplicados (GenomicsForm.js:104-120). Semántica de UNIÓN (OR).
- **Caso B (casilla sin marcar — "total matching")**: recoge solo los
  campos NO vacíos (GenomicsForm.js:132-136) y marca cada registro de la
  base como `false` si algún campo pedido no coincide, `true` en caso
  contrario (GenomicsForm.js:138-149); solo pasan los registros
  `boolMatch === true`. Semántica de INTERSECCIÓN (AND sobre los campos
  no vacíos).
- **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** Ambos caminos implementan "buscar
  en el índice y devolver resultados", con dos algoritmos distintos
  (unión de filtros por campo vs intersección por registro). Coinciden
  con 0 o 1 criterio relleno y DIFIEREN a partir de 2 (ver
  contradiccion-02-busqueda-parcial-vs-total.md). El código de ambos
  caminos está duplicado línea a línea entre GenomicsForm.js:93-166 y
  DicomForm.js:89-162 (ver contradiccion-03-busqueda-genomics-dicom.md).

### 7.2 Resultados

- **Caso A (hay resultados)**: lista de `SearchResults` (id, Address,
  precio en ETH, botón "Buy"; SearchResults.js:5-25) (GenomicsForm.js:321-344).
- **Caso B (sin resultados)**: "No results were founded." y vuelta al
  formulario (GenomicsForm.js:345-357).
- "Back to form page" vuelve al formulario (GenomicsForm.js:209-213,
  340-343). "Clear search" limpia (GenomicsForm.js:215-230).

### 7.3 Comprar — camino GENOMICS (flujo completo)

Botón "Buy" → `buyHandler` de GenomicsForm (GenomicsForm.js:232-267):

1. `contract.purchaseDataset(id, ownerAddress, {from: accounts[0],
   value: 10^18 * price})` (GenomicsForm.js:233). Contrato
   (Marketplace.sol:232-273): `whenNotPaused`, `require(msg.value >=
   datasetById[id].price)` (Marketplace.sol:236); **si manda más del
   precio, devuelve el sobrante al comprador en la misma TX**
   (Marketplace.sol:239-243); registra la transacción (`transactionStatus`,
   `transactionsHistory`, `transactionsHistoryBuyer`), apila el id en
   `datasetsByBuyer`, marca `dataBuyer`, `passwordSentbyDataOwner = false`,
   `allowWithdrawalbyDataPurchaser = false`, abre el custodio del COMPRADOR
   (`withdrawalCustodyBuyer.time = now`, base de su derecho de recuperación)
   y pone `rejected = false` (Marketplace.sol:246-270).
   - Casos de fallo: precio pagado menor → revert (Marketplace.sol:236);
     el mismo comprador ya compró ese dataset a ese vendedor → revert
     (Marketplace.sol:237); pausado → revert. La alerta "Dataset
     Purchased" (GenomicsForm.js:235) se muestra también si la TX se
     rechaza en MetaMask: **SUPOSICIÓN** (truffle-contract resuelve igual
     tras revert solo si la TX se mina; con rechazo del usuario la promesa
     se rechaza y el `await` lanzaría antes de la alerta).
2. Lee `getPublicKey(accounts[0])` (GenomicsForm.js:237 →
   Marketplace.sol:638-643).
   - **Caso A (ya tiene clave pública registrada)**: `return` — no se
     registra de nuevo (GenomicsForm.js:238-240).
   - **Caso B (sin clave pública)**: alerta advirtiendo que debe enviar la
     TX de registro o no recibirá la contraseña, y que podrá recuperar los
     fondos "after the withdrawal period (up to 5 days)"
     (GenomicsForm.js:242-245). **Rareza**: el contrato fija el periodo en
     **5 minutos** (Marketplace.sol:35), no 5 días; la advertencia de la UI
     no coincide con el contrato. Registrada como A-09.
3. Solo en el caso B: recupera la transacción de compra con
   `web3.eth.getTransaction(receipt.tx)` (GenomicsForm.js:247), reconstruye
   la TX cruda con `ethereumjs-tx` (nonce, gasPrice, gasLimit, to, value,
   data, chainId, r, s, v; GenomicsForm.js:250-261), extrae la clave
   pública del remitente con `getSenderPublicKey()` (GenomicsForm.js:263-264)
   y la registra on-chain: `contract.registerPublicKey(ownerAddress, id,
   pubkeyStr, {from: accounts[0]})` (GenomicsForm.js:265). Contrato:
   `whenNotPaused`, `require(transactionStatus[owner][id][msg.sender]
   .purchased == true)` y `require(publicKeyStatus[msg.sender] == false)`;
   guarda la clave y marca el flag (Marketplace.sol:391-400). Alerta "User
   public key registered" (GenomicsForm.js:266). Con esto, el vendedor podrá
   cifrarle la IV/clave (uso 6.3.3, caso B).
   - Nótese la técnica: la clave pública ECIES se recupera de la firma de
     la propia transacción de compra, no se pide al usuario.

### 7.4 Comprar — camino DICOM (flujo corto)

Botón "Buy" → `buyHandler` de DicomForm (DicomForm.js:228-235): SOLO
`purchaseDataset` (DicomForm.js:232) y alerta "Dataset purchased"
(DicomForm.js:234). **No hay registro de clave pública, ni lectura de
`getPublicKey`, ni reconstrucción de TX.**

- **[MISMO-OBJETIVO, CÓDIGO DISTINTO]** Los dos caminos de compra (GENOMICS
  y DICOM) ejecutan la misma operación de negocio — comprar un dataset —
  con código distinto: el camino GENOMICS añade el registro de la clave
  pública ECIES del comprador (GenomicsForm.js:237-266) y el camino DICOM
  no hace nada de eso (DicomForm.js:228-235). Consecuencia observable: un
  comprador que solo haya usado DICOM no tiene clave pública registrada y
  el vendedor no puede entregarle la contraseña (uso 6.3.3, caso A). Este
  es el hallazgo principal de este documento: registrado como anomalía A-08.
  Ver índice 8.6.

### 7.5 Cierre del ciclo

Tras la compra, el dataset aparece en "My active deals" del comprador al
recargar (uso 5.1) y en "My Deals" del vendedor (uso 6.3.1); el ciclo
completo del mercado es: publicar (6.1) → comprar (7.3/7.4) → entregar
contraseña (6.3.3) → descifrar y autorizar retirada (5.3) → retirar dinero
(6.3.4), con recuperaciones de fondos (5.2, dentro del periodo) y
reversiones de contraseña (5.3.4, inalcanzable en UI).

---

## 8. Índice de puntos donde dos (o más) caminos hacen lo mismo con código distinto

| # | Caminos | Qué "lo mismo" hacen | Evidencia |
|---|---------|----------------------|-----------|
| 8.1 | `window.ethereum` / `window.web3` / fallback `127.0.0.1:9545` | Obtener una instancia web3 | getWeb3.js:8-17 / 20-25 / 27-33 |
| 8.2 | Aceptar solicitud vs rechazar solicitud (admin) | Sacar la solicitud de la lista (local y on-chain) con el mismo algoritmo, escrito dos veces en la UI y dos veces en el contrato | Admin.js:94-99 vs 107-112; Marketplace.sol:135-139 vs 165-168 |
| 8.3 | Streaming Enigma+IPFS vs enlace `<a href={dataFile}>` (comprador, deals cerrados) | Descargar el dataset; el segundo camino está muerto (`dataFile` nunca asignado) | Buyer.js:171-317 vs Buyer.js:418; Buyer.js:29 |
| 8.4 | Modal de clave privada en deals activos vs cerrados (comprador) | Mismo formulario y mismos handlers, duplicado | Buyer.js:371-383 vs 429-441 (handlers 144-169) |
| 8.5 | Rama genomics vs rama dicom en Forms | Construir/actualizar/limpiar el formulario activo: mismos bucles dentro de dos `if` con objetos de estado distintos | Forms.js:162-168 vs 170-176; 219-244; 246-272 |
| 8.6 | Compra por GENOMICS vs compra por DICOM | Comprar un dataset: solo GENOMICS registra la clave pública ECIES del comprador | GenomicsForm.js:232-267 vs DicomForm.js:228-235 |
| 8.7 | Puerta 1 (autorización del comprador) vs puerta 2 (5 minutos de custodia) en el retiro del vendedor | Permitir `withdrawTransactionBalance` | Marketplace.sol:288-292 (OR de dos condiciones) |
| 8.8 | Render condicional muerto vs acordeón Bootstrap en Marketplace | Mostrar GenomicsForm y DicomForm | Marketplace.js:24-39 vs 48-83 |
| 8.9 | Partial matching vs total matching (búsqueda) | Buscar en el índice Firebase; algoritmos distintos y duplicados entre GenomicsForm y DicomForm | GenomicsForm.js:98-127 vs 131-165; DicomForm.js:94-123 vs 127-161 |

Cada punto anterior con divergencia real está desarrollado, comparado paso
a paso y cuantificado en los ficheros
`specs/000-reconocimiento/contradiccion-01..14-*.md` (14 duplicidades de
conceptos de negocio).

---

## 9. Rarezas y hallazgos nuevos de este recorrido (pendientes de registro)

Los hallazgos no se corrigen (Principio III). Por decisión del negocio
(2026-11-17) el registro de anomalías se elaborará más adelante; los
hallazgos nuevos de este recorrido quedan listados aquí a la espera de ese
registro:

- **Compra DICOM sin registro de clave pública**: solo el camino GENOMICS
  registra la clave pública ECIES del comprador (GenomicsForm.js:237-266 vs
  DicomForm.js:228-235). Consecuencia: deals DICOM sin contraseña posible
  (MyDeals.js:129, 149-151).
- **"Up to 5 days" vs 5 minutos**: la UI avisa de un periodo de recuperación
  de 5 días y el contrato fija 5 minutos (GenomicsForm.js:244-245 vs
  Marketplace.sol:35).
- **Semánticas de búsqueda enfrentadas**: "partial matching" es una unión
  de criterios y "total matching" una intersección; para la misma entrada
  producen resultados distintos a partir de 2 criterios
  (contradiccion-02).
- **Vista Admin oculta para admin+dataOwner**: sobrescritura de `message`
  en Profile (Profile.js:13-25).
- Observaciones ya documentadas y re-confirmadas aquí por el recorrido:
  A-02 (server.js fuera de todo flujo web), A-03/A-04 (tests comentados),
  A-05 (endpoint demo), A-06 (IV/clave on-chain), y las zonas oscuras
  5.1/5.2 del mapa-sistema (enlace muerto Buyer.js:418, modal `invalid`
  inalcanzable, seed sin uso, spinners nunca activados en Forms).
