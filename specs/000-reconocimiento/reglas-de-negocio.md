# Reglas de negocio — Reconocimiento (000)

> Fase: documentación y protección (constitución v1.0.0,
> `.specify/memory/constitution.md`). Fecha: 2026-11-17. Nada se corrige
> (Principio III). Alcance: los módulos con criticidad **Alta** del
> mapa-sistema (Marketplace.sol, zeppelin Ownable/Destructible/Pausable,
> App.js, getWeb3.js, Profile.js, Admin.js, Forms.js, MyDatasets.js,
> MyDeals.js, Buyer.js, GenomicsForm.js/DicomForm.js, axios-orders.js,
> ipfs.js) y las utilidades de las que dependen (bs58, BigNumber,
> eth-ecies, @cubbit/enigma, @cubbit/web-file-stream, streamsaver,
> ethereumjs-tx, artefactos truffle-contract).
>
> Método: lectura estática y cálculo mental/real de los ejemplos (los
> números marcados «dato real» se calcularon ejecutando Node contra las
> mismas fórmulas del código). Los ejemplos son contrafácticos: describen
> lo que el código HARÍA, no lo que ha pasado.
>
> Clasificación: **INTENCIONAL** (señales de decisión deliberada:
> comentarios, coherencia interna, testigos históricos), **ACCIDENTAL**
> (efecto colateral de la implementación) o **DUDOSA** (indecidible desde
> el código; se convierte en pregunta al negocio).

---

## A. Identidad, roles y permisos

**RN-01 — El desplegador del contrato nace admin y propietario a la vez.**
- Regla: quien instala el mercado obtiene automáticamente ambos poderes (gobernar y cobrar).
- Ejemplo: la cuenta que ejecuta `truffle migrate` puede, desde el minuto cero, aprobar vendedores y retirar comisiones; ninguna otra cuenta lo puede hacer hasta que él nombre admins.
- Evidencia: constructor `Marketplace()` en contracts/Marketplace.sol:39-42; lectura del flag en `checkMKOwnerStatus` (Marketplace.sol:420-425).
- Clasificación: INTENCIONAL — asignación explícita en el constructor, coherente con el modal de comisiones de Admin.js:206-215.

**RN-02 — Dar de alta admins es potestad de cualquier admin; quitarlos, solo del propietario.**
- Regla: la jerarquía es asimétrica: los admins se multiplican entre sí, pero solo el propietario puede revocarlos.
- Ejemplo: admin A (no propietario) da de alta a B; si A quiere deshacerse de B, su TX `removeAdmin` revierte: solo el propietario puede.
- Evidencia: `addAdmin` con `onlyAdmin` (Marketplace.sol:111-118) vs `removeAdmin` con `onlyOwner` (Marketplace.sol:120-127).
- Clasificación: INTENCIONAL — asimetría deliberada ya presente en los tests históricos (test/TestMarketplace.js:38-56).

**RN-03 — No existen administradores duplicados.**
- Regla: una dirección ya admin no puede volverse a dar de alta.
- Ejemplo: `addAdmin(A)` con A ya admin revierte.
- Evidencia: `require(administrators[admin] == false)` en Marketplace.sol:115.
- Clasificación: INTENCIONAL — guard explícito.

**RN-04 — Ser vendedor se solicita; la petición puede duplicarse en la lista y las duplicadas quedan zombis.**
- Regla: cualquier cuenta sin condición de vendedor puede solicitarla; una cuenta puede apilarse varias veces en la lista de solicitudes y, aprobada una, las demás quedan como entradas muertas que solo pueden rechazarse una a una.
- Ejemplo: la cuenta B pulsa "Request" tres veces → `requestedDataOwnerStatus = [B, B, B]`; el admin aprueba la primera (`addDataOwnerStatus(B, 0)`) → B ya es vendedor; las dos entradas restantes ya no pueden aprobarse (el require `dataOwnerStatus[owner] == false` revierte, Marketplace.sol:133) y solo pueden rechazarse por índice.
- Evidencia: `requestDataOwnerStatus` (Marketplace.sol:153-159, sin chequeo de duplicado en el array) y `addDataOwnerStatus` (Marketplace.sol:129-141).
- Clasificación: ACCIDENTAL — el guard de estado existe, el guard de lista no.

**RN-05 — No se puede degradar a un vendedor con inventario.**
- Regla: retirar la condición de vendedor exige que no tenga ningún dataset registrado.
- Ejemplo: vendedor con 1 dataset → `removeDataOwnerStatus` revierte; tras retirar sus datasets (`removeDataset`) la baja prospera.
- Evidencia: `require(datasetsByOwner[owner].length == 0)` en Marketplace.sol:148; testigo histórico del orden de operaciones en test/TestMarketplace.js:229-269.
- Clasificación: INTENCIONAL — guard explícito con test histórico que lo ejercita.

**RN-06 — La aprobación y el rechazo de solicitudes operan por posición, no por identidad.**
- Regla: el admin aprueba o rechaza «la solicitud número N», con N calculado en su navegador; el contrato confía ciegamente en ese número.
- Ejemplo: dos admins conectados a la vez; A ve la lista [X, Y] y aprueba el índice 0 (X); entre medias B rechazó el índice 0 (Y, con swap del último); la aprobación de A, minada después, cae sobre un índice ya desplazado → se aprueba a la persona equivocada o revierte.
- Evidencia: `addDataOwnerStatus(owner, index)` y `removeDataOwnerStatusRequest(index)` (Marketplace.sol:129-141, 161-170); índice enviado desde la UI (Admin.js:87-93, 102-106) sobre una copia local mutada fuera de la transacción (Admin.js:94-99, 107-112).
- Clasificación: DUDOSA — no se sabe si la selección por índice es un diseño aceptado o un descuido; riesgo R9 del registro-riesgos.

## B. Catálogo: registro, precio y baja

**RN-07 — Solo los vendedores publican, y el producto es el hash de un directorio IPFS de partes cifradas.**
- Regla: publicar = registrar en el contrato el identificador del directorio IPFS que contiene el fichero cifrado troceado, junto a un precio en wei.
- Ejemplo: un fichero de 70 MB se cifra y trocea en 3 partes de ~30 MB (chunk 30 000 000 bytes), se sube cada parte a IPFS, se enlazan sobre el directorio vacío y el hash resultante (bytes32) es el «id» del producto.
- Evidencia: `registerDataset` (Marketplace.sol:174-188); construcción del directorio en Forms.js:298-347 y conversión a bytes32 en Forms.js:335-342.
- Clasificación: INTENCIONAL — flujo completo coherente entre cliente y contrato.

**RN-08 — Un vendedor no puede duplicar su dataset; dos vendedores sí pueden vender el mismo CID, y el precio del id lo fija el último en registrar.**
- Regla: la unicidad del catálogo es por pareja (vendedor, dataset); el precio es un valor global por dataset que cada nuevo registro sobrescribe.
- Ejemplo: A registra id X a 2 ETH; B registra el mismo X a 5 ETH → `getDatasetPrice(X)` devuelve 5 para todos; la compra de A según el índice pagará 5 y el dinero quedará en custodia de quien el índice indique como propietario.
- Evidencia: guard por-propietario `require(dataOwner[msg.sender][id] != true)` (Marketplace.sol:178) y sobrescritura `datasetById[id].price = price` (Marketplace.sol:184-185).
- Clasificación: ACCIDENTAL — el guard protege al mismo vendedor pero no el id global; los testigos históricos no lo contemplan.

**RN-09 — El precio no tiene mínimo ni validación: 0 es un producto gratuito.**
- Regla: se acepta cualquier entero como precio, incluido 0 y (vía `BigNumber` con entrada vacía) NaN, que revierte la publicación.
- Ejemplo: vendedor publica con precio 0 → comprador envía 1 ETH → `msg.value >= 0` y refund del 1 ETH completo → compra «gratis» con todo el flujo de entrega activo.
- Evidencia: ausencia total de validación en `registerDataset` (Marketplace.sol:174-188) y `updateDatasetPrice` (Marketplace.sol:275-282); único control: `msg.value >= datasetById[id].price` en la compra (Marketplace.sol:236).
- Clasificación: ACCIDENTAL — nada sugiere que el precio 0 sea una oferta deseada; SUPOSICIÓN pendiente del negocio.

**RN-10 — El precio se puede cambiar en cualquier momento, incluso con compras en custodia, sin afectarlas.**
- Regla: la modificación de precio es retroactiva-cero: cada compra conservó su importe al pagarlo.
- Ejemplo: B compra a 2 ETH; el vendedor sube el precio a 5; la retirada del dinero de B pagará 2 - 5 % = 1,9 ETH, no 4,75.
- Evidencia: `updateDatasetPrice` (Marketplace.sol:275-282); el balance quedó fijado en la compra (`balance += total`, Marketplace.sol:247) y el retiro usa ese balance (Marketplace.sol:294-295).
- Clasificación: INTENCIONAL — el balance se congela en el momento del pago por diseño del struct.

**RN-11 — Solo se puede retirar del catálogo un dataset sin historial de compras.**
- Regla: basta una compra (aunque luego el comprador recupere su dinero) para bloquear la baja hasta que el historial se vacíe.
- Ejemplo: B compra y recupera el importe → la recuperación borra la entrada del historial (Marketplace.sol:326-336) → ahora el vendedor SÍ puede retirar el dataset.
- Evidencia: `require(transactionsHistory[msg.sender][id].length == 0)` en Marketplace.sol:361; limpieza del historial en `recoverTransactionBalance` (Marketplace.sol:326-336).
- Clasificación: INTENCIONAL — guard explícito.

**RN-12 — Tras la baja, el dataset sigue siendo comprable «gratis» y no entregable.**
- Regla: retirar un dataset del catálogo no lo saca del mercado: el struct borrado deja el precio en 0 y la compra no verifica que el dataset siga vivo; el comprador recupera lo pagado pero queda registrado como comprador de algo que nadie puede entregarle.
- Ejemplo: dataset X retirado (queda en el índice Firebase); comprador paga 2 ETH según el índice → precio on-chain 0 → refund de 2 ETH en la misma TX → `dataBuyer=true` y deal activo sin contraseña posible (el vendedor ya no es `dataOwner(id)`).
- Evidencia: `delete datasetById[id]` (Marketplace.sol:385) sin limpiazgo del índice (Forms.js:185 no tiene borrado); compra sin chequeo de vigencia y con refund (Marketplace.sol:236-243).
- Clasificación: ACCIDENTAL — consecuencia compuesta de dos decisiones independientes (borrar el struct; no comprobar vigencia).

**RN-13 — Las bajas y recuperaciones reordenan las listas con «mover el último al hueco».**
- Regla: las colecciones on-chain no conservan orden estable: cualquier baja intercambia el elemento eliminado por el último.
- Ejemplo: historial [B, C, D]; B recupera su dinero → el historial queda [D, C].
- Evidencia: patrón swap-delete en `addDataOwnerStatus` (Marketplace.sol:135-139), `removeDataOwnerStatusRequest` (165-168), `recoverTransactionBalance` (329-336, 341-348) y `removeDataset` (364-379).
- Clasificación: INTENCIONAL — patrón aplicado sistemáticamente en las cinco bajas.

## C. Compra y custodia

**RN-14 — Se paga el precio exacto o más: lo justo no devuelve nada, lo menor revierte, lo mayor devuelve el sobrante en la misma transacción.**
- Regla: el límite es `>=` (el valor justo entra); el sobrante se calcula y devuelve antes de registrar nada.
- Ejemplo (precio 2 ETH): se envían 2 ETH exactos → sin reembolso; 2,05 ETH (dato real del redondeo del cliente: 2049999999999999700 wei) → refund de 49999999999999700 wei; 1,9999 ETH → la compra revierte y no se mueve nada.
- Evidencia: `require(msg.value >= datasetById[id].price)` y bloque de refund (Marketplace.sol:236-243).
- Clasificación: INTENCIONAL — el `if (msg.value > total)` con refund es explícito y está probado en los tests históricos (test/TestMarketplace.js:147-159).

**RN-15 — El pago se liga a la dirección de vendedor que diga el índice, sin verificar que sea el propietario del dataset.**
- Regla: comprar a un owner erróneo (o ya degradado) acepta el dinero y lo congela para ese owner, que no podrá retirarlo.
- Ejemplo: el índice apunta al owner 0xAAA (desde entonces degradado por el admin) → `purchaseDataset(X, 0xAAA)` con valor 2 ETH prospera (no comprueba `dataOwner[0xAAA][X]`) → el dinero queda en `transactionStatus[0xAAA][X][comprador]` y solo `withdrawTransactionBalance` de 0xAAA podría moverlo, lo que revierte por `onlyDataOwner`.
- Evidencia: `purchaseDataset` (Marketplace.sol:232-273, sin check de propiedad) vs `withdrawTransactionBalance` con `onlyDataOwner(id)` (Marketplace.sol:284-286).
- Clasificación: ACCIDENTAL — la custodia por owner era necesaria, la ausencia de verificación no parece deliberada; SUPOSICIÓN pendiente del negocio.

**RN-16 — El mismo comprador no paga dos veces por el mismo dataset del mismo vendedor; recomprar exige recuperar antes.**
- Regla: la compra es única por trío (vendedor, dataset, comprador); tras una recuperación (que borra el trío) se puede volver a comprar.
- Ejemplo: B compra X a A → segunda compra revierte; B recupera su dinero (borra el trío, Marketplace.sol:351) → B puede recomprar X.
- Evidencia: `require(transactionStatus[owner][id][msg.sender].purchased != true)` (Marketplace.sol:237) y borrado del trío en la recuperación (Marketplace.sol:351).
- Clasificación: INTENCIONAL — guard explícito contra el doble pago.

**RN-17 — Lo que queda en custodia es el precio, no lo pagado.**
- Regla: si el comprador manda más del precio, la custodia registra solo el precio.
- Ejemplo: precio 2 ETH, se envían 2,5 → refund 0,5 y `balance = 2 ETH`; el retiro del vendedor moverá 1,9 (95 %) y 0,1 irá a comisiones.
- Evidencia: `transactionStatus[...].balance += total` tras el refund (Marketplace.sol:239-247).
- Clasificación: INTENCIONAL — coherente con RN-14.

**RN-18 — Pagar confiere el derecho de acceso de inmediato, aunque nadie haya entregado nada.**
- Regla: al pagar, el comprador ya es «data buyer» del dataset; la entrega de claves es un paso separado y posterior del vendedor.
- Ejemplo: B paga y en el mismo bloque se listaría ya en su página «My active deals» con estado «Pending: Password by DataOwner», aunque el vendedor tarde días o nunca.
- Evidencia: `datasetsByBuyer.push` y `dataBuyer = true` (Marketplace.sol:260-261) frente a la entrega diferida (`passwordUpload`, Marketplace.sol:190-200); render en Buyer.js:339-401.
- Clasificación: INTENCIONAL — separación pago/entrega es el corazón del diseño (custodia + speedbump).

**RN-19 — Al pagar se abre una custodia propia del comprador de 5 minutos, base de su derecho de recuperación.**
- Regla: el reloj de recuperación del comprador arranca en el pago, no en la entrega.
- Ejemplo: B paga en t=0; el vendedor no hace nada; B puede recuperar a partir de t = 5:00:01 (ver frontera en RN-34).
- Evidencia: `withdrawalCustodyBuyer[owner][id][msg.sender].time = now` (Marketplace.sol:267).
- Clasificación: INTENCIONAL — simétrico del speedbump del vendedor (comentario "WITHDRAWAL SPEEDBUMP" en MyDeals.js:60).

**RN-20 — Comprar de nuevo es la única forma de desbloquear un rechazo de contraseña.**
- Regla: el flag `rejected` solo se resetea al pagar; ninguna función del contrato lo limpia por otro camino.
- Ejemplo: B rechaza la contraseña → el vendedor no puede reenviar (Marketplace.sol:194) → el único reenvío posible pasa por recompra (que exige que B recupere primero, RN-16).
- Evidencia: `rejected[msg.sender][id] = false` únicamente en `purchaseDataset` (Marketplace.sol:270); bloqueo en `passwordUpload` (Marketplace.sol:194).
- Clasificación: DUDOSA — el Tutorial promete reenvío sin recompra (Tutorial.js:211-213); conflicto no decidible desde el código.

**RN-21 — La clave pública de cifrado del comprador se deduce de la firma de su propia transacción de compra y solo se registra una vez en la vida.**
- Regla: no se pide la clave: se recupera criptográficamente de la TX; quien ya la registró nunca podrá cambiarla.
- Ejemplo: B compra → el cliente reconstruye la TX cruda (nonce, r, s, v) → `getSenderPublicKey()` → `registerPublicKey`; si B ya tenía clave pública, la llamada se omite (y si la intenta a mano, revierte por `publicKeyStatus`).
- Evidencia: `registerPublicKey` con `require(purchased == true)` y `require(publicKeyStatus == false)` (Marketplace.sol:391-400); reconstrucción en GenomicsForm.js:247-265; omisión si ya existe (GenomicsForm.js:237-240).
- Clasificación: INTENCIONAL — técnica prototipada deliberadamente en los tests históricos (test/TestMarketplace.js:656-707) antes de pasar a producción.

**RN-22 — Un comprador sin clave pública registrada es un comprador al que nadie puede entregarle la contraseña.**
- Regla: la entrega exige clave pública registrada; sin ella el vendedor aborta con aviso.
- Ejemplo: compra por el camino DICOM (que nunca registra clave pública, DicomForm.js:228-235) → vendedor introduce IV/clave → `getPublicKey` devuelve "" → alerta «Invalid public key from buyer» y el deal queda estancado.
- Evidencia: guard en MyDeals.js:129-151; causa raíz en flujo-aplicacion.md 7.4 (discrepancia GenomicsForm vs DicomForm).
- Clasificación: ACCIDENTAL — efecto colateral de la divergencia entre los dos caminos de compra.

**RN-23 — La conversión ETH↔wei del cliente multiplica en coma flotante ANTES de nada más, y puede desviarse del decimal exacto.**
- Regla: «precio en ETH» se convierte con `Math.pow(10,18) * precio` (float primero; `BigNumber` después, o nada en la compra), lo que produce wei con desviaciones de hasta ~10³ wei respecto al decimal escrito, autosconsistentes porque vendedor y comprador usan la misma fórmula.
- Ejemplo (datos reales calculados con Node contra la misma fórmula): "8.2" ETH → 8199999999999999000 wei (8.199999999999999…); "0.07" ETH → 70000000000000010 wei (+10 wei por exceso); "2.05" ETH → 2049999999999999700 wei. Como vendedor y comprador aplican la misma conversión, el contrato ve el mismo número en ambos lados y la compra no revierte por esta causa.
- Evidencia: Forms.js:180 (`new BigNumber(Math.pow(10, 18) * formData["Price"])` — el float se calcula antes de envolver), MyDatasets.js:74 (idéntico), GenomicsForm.js:233 y DicomForm.js:232 (`value: Math.pow(10, 18) * price` sin BigNumber).
- Clasificación: ACCIDENTAL — además, el comentario de Forms.js:180 justifica el formato «so that it is acceptable to MyERC721 contract», un contrato que no existe en el proyecto (hallazgo de discrepancia; memoria-historica 1.10).

## D. Entrega de claves

**RN-24 — La entrega es única e irrevocable: tras un rechazo del comprador, el vendedor no puede volver a intentar.**
- Regla: por cada compra, el vendedor envía exactamente una vez; si el comprador rechazó (o ya se envió), la TX revierte.
- Ejemplo: vendedor envía IV/clave erróneas → comprador rechaza (`rejected=true`) → nuevo intento de `passwordUpload` revierte por el require compuesto.
- Evidencia: `require(passwordSentbyDataOwner[buyer][id] == false && rejected[buyer][id] == false)` en Marketplace.sol:194.
- Clasificación: DUDOSA — el contrato es tajante, pero el Tutorial promete lo contrario («You will have 4 days for submitting the decryption key and IV again», Tutorial.js:211-213). DISCREPANCIA comentario/código: hallazgo.

**RN-25 — La entrega abre el reloj de custodia del vendedor (5 minutos) en el momento de enviar.**
- Regla: el speedbump del vendedor no arranca con la compra ni con la autorización: arranca al subir la contraseña.
- Ejemplo: comprador autoriza al instante → el vendedor aún no puede retirar si aún no envió la contraseña (no hay custodyOwner con tiempo); la envía en t → retiro posible desde t + 5 min (frontera en RN-29).
- Evidencia: `withdrawalCustodyOwner[msg.sender][id][buyer].time = now` (Marketplace.sol:198).
- Clasificación: INTENCIONAL — la UI lo describe («Time remaining to withdraw...» cuando pwdStatus, MyDeals.js:220).

**RN-26 — La IV y la clave cifradas quedan publicadas en el estado público del contrato.**
- Regla: la entrega escribe en la cadena dos cadenas legibles por cualquiera, opacas solo por el cifrado ECIES del comprador.
- Ejemplo: cualquier tercero puede llamar `getEncryptedIV(buyer, id)` y leer el base64 (inútil sin la clave privada del comprador, pero público).
- Evidencia: mappings (Marketplace.sol:23-24), escritura (196-197), getters públicos (506-518).
- Clasificación: INTENCIONAL como mecanismo (getters deliberados), con riesgo de privacidad registrado (A-06 del mapa-sistema).

**RN-27 — El comprador solo puede autorizar la retirada después de recibir contraseña.**
- Regla: la autorización es el «visto bueno» del comprador sobre la entrega y exige que exista.
- Ejemplo: B pulsa «Allow withdrawal» antes de que llegue la contraseña → la TX revierte; con contraseña enviada, marca `allowWithdrawalbyDataPurchaser = true` (irreversible: no hay retractación).
- Evidencia: `require(passwordSentbyDataOwner[msg.sender][id] == true)` en Marketplace.sol:218; escritura irreversible en 219.
- Clasificación: INTENCIONAL — guard y semántica de validación de entrega coherentes con el Tutorial (Tutorial.js:91).

## E. Retirada del vendedor y comisiones

**RN-29 — El vendedor retira si el comprador autorizó, o si pasaron 5 minutos desde su entrega; en ambos casos, solo si no retiró antes y el comprador no rechazó.**
- Regla: dos puertas en OR con dos candados comunes en AND.
- Ejemplo (frontera exacta, datos reales calculados): envío de contraseña en t; en `now == t + 300 s` el retiro revierte (300 > 300 es falso); en `t + 301` prospera (301 > 300 verdadero). Con autorización del comprador, el retiro es inmediato incluso en t + 1 s. Tras un rechazo del comprador, ninguna puerta sirve.
- Evidencia: require compuesto (Marketplace.sol:288-292); periodo `withdrawalWaitPeriod = 5 minutes` (Marketplace.sol:35).
- Clasificación: INTENCIONAL — speedbump diseñado (comentarios "WITHDRAWAL SPEEDBUMP" MyDeals.js:60; test histórico del caso sin autorización en test/TestMarketplace.js:272-352). Nota histórica: los tests comentados asumen 10 segundos (test/TestMarketplace.js:337) — DISCREPANCIA con el valor actual.

**RN-30 — El reparto es 95 % vendedor / 5 % comisión con división entera aplicada por separado; con importes no múltiplos de 20 wei se pierden wei sin atribuir.**
- Regla: `rest = balance*95/100` y `fee = balance*5/100` se truncan cada uno por su lado; la suma puede ser menor que el balance y el resto queda bloqueado en el contrato para siempre (el propietario solo retira el acumulador `fees`).
- Ejemplo (dato real calculado): balance 99 wei → rest 94, fee 4, total repartido 98; 1 wei queda en el contrato sin pertenecer a nadie. Con importes reales (múltiplos de 10^15 por los precios decimales habituales) la pérdida no aparece: 0,001 ETH → 950000000000000 + 50000000000000 exactos.
- Evidencia: Marketplace.sol:294-297 (divisiones) y `ownerWithdrawal` que solo transfiere `fees` (Marketplace.sol:223-230).
- Clasificación: ACCIDENTAL — efecto del redondeo por truncado con divisores 100; nadie lo documenta.

**RN-31 — La comisión solo se cobra cuando el vendedor retira; la recuperación del comprador no genera comisión.**
- Regla: el 5 % es un peaje de cobro del vendedor, no del ciclo completo.
- Ejemplo: B recupera sus 2 ETH íntegros (RN-34) → `fees` no se mueve; si el vendedor retira esos mismos 2 ETH → 0,1 ETH a `fees`.
- Evidencia: acumulación solo en `withdrawTransactionBalance` (Marketplace.sol:295-297); `recoverTransactionBalance` transfiere el balance completo (Marketplace.sol:314-316).
- Clasificación: INTENCIONAL — coherente con el papel de «comisión por venta completada» del comentario «5% txFee» (Marketplace.sol:296).

**RN-32 — Retirar cierra la operación de forma irreversible.**
- Regla: tras el retiro, la deal pasa a «cerrada» y no puede volver a abrirse (ni siquiera aparece en la lista activa).
- Ejemplo: vendedor retira → `transactionBalanceWithdraw = true` → en la próxima carga la deal sale en «My closed deals» y no admite nuevo retiro (require).
- Evidencia: flag (Marketplace.sol:300) y lectura para repartir listas (MyDeals.js:59, 79-85; Buyer.js:60, 86-94).
- Clasificación: INTENCIONAL.

**RN-33 — El propietario retira las comisiones cuando quiere; retirar con cuentas a cero no revierte.**
- Regla: `ownerWithdrawal` transfiere el acumulador y lo pone a 0; una transferencia de 0 es válida.
- Ejemplo: propietario pulsa «Withdraw» dos veces seguidas → la segunda transfiere 0 wei y no revierte.
- Evidencia: `msg.sender.transfer(fees); fees = 0;` (Marketplace.sol:227-228).
- Clasificación: INTENCIONAL — simple y coherente; sin guard anti-doble-pulsación porque no hace falta.

## F. Recuperación y rechazo del comprador

**RN-34 — El comprador recupera el importe ÍNTEGRO solo si nunca se envió contraseña y pasaron 5 minutos estrictos desde el pago.**
- Regla: la recuperación es sin comisión y con frontera estricta.
- Ejemplo: B paga en t=0 y nadie entrega nada; en t = 5:00 exacto la recuperación revierte (la comparación es `now > t + 300`, dato real: falso en la frontera); en t = 5:00:01 recupera los 2 ETH completos y su compra se deshace (RN-36). Si el vendedor envió contraseña (aunque sea basura), la recuperación revierte siempre.
- Evidencia: `require(passwordSentbyDataOwner == false)` y `require(now > withdrawalCustodyBuyer.time + withdrawalWaitPeriod)` (Marketplace.sol:306-311); transferencia íntegra (314-316).
- Clasificación: INTENCIONAL — pero con DOS discrepancias de documentación: la UI promete «up to 5 days» (GenomicsForm.js:244-245) y el Tutorial promete «4 days» (Tutorial.js:86, 148). Hallazgo.

**RN-35 — Contraseña enviada, aunque inválida, basta para que el vendedor se quede el dinero a los 5 minutos.**
- Regla: la entrega, no la entrega VÁLIDA, es lo que activa el cobro del vendedor; la defensa del comprador (rechazar) no es alcanzable desde la interfaz.
- Ejemplo: vendedor envía una clave basura en t; B no puede recuperarla (RN-34, require falla); el rechazo de contraseña no está cableado en la UI (modal inalcanzable); en t + 5:01 el vendedor retira el 95 %.
- Evidencia: Marketplace.sol:288-292 y 310; modal ligado a `invalid` que nunca se activa (Buyer.js:32, 175, 362-365).
- Clasificación: ACCIDENTAL (la inaccesibilidad del rechazo) con un componente DUDOSA (si el contrato debía exigir validación del comprador). El Tutorial promete un arbitraje de CypherDream que no existe en el contrato (Tutorial.js:211-213) — DISCREPANCIA: hallazgo.

**RN-36 — La recuperación deshace la compra entera, no solo devuelve el dinero.**
- Regla: recuperar borra el rastro de la compra: historial, flag de comprador y listas, con reordenación swap-último.
- Ejemplo: historial [B, C]; B recupera → historial [C]; B deja de ver el dataset en «My active deals» y puede recomprarlo (RN-16).
- Evidencia: Marketplace.sol:318-353 (pasos A-E comentados en el propio código).
- Clasificación: INTENCIONAL — pasos enumerados y comentados por el autor («1. MAKING THE RECOVERY TX», «2. REVERTING THE PURCHASING DATASET STATE»).

**RN-37 — El contrato permite al comprador anular una contraseña recibida, pero esa vía no está conectada a la interfaz.**
- Regla: «rechazar contraseña» pone la entrega a falso, borra IV/clave y marca `rejected`; no devuelve el dinero ni permite reenvío (RN-20).
- Ejemplo: si B llamara `rejectPassword`, su recovery pasaría a ser posible tras los 5 min (passwordSent vuelve a false), pero el vendedor jamás podría reenviar.
- Evidencia: `rejectPassword` (Marketplace.sol:202-212); UI inalcanzable (Buyer.js:362-365 con `invalid` muerto).
- Clasificación: DUDOSA — no se sabe si se retiró de la UI a propósito (el Tutorial documenta un flujo de rechazo completo que el contrato solo soporta a medias: Tutorial.js:157-166). DISCREPANCIA: hallazgo.

## G. Índice de búsqueda y precios del índice

**RN-38 — El catálogo buscable vive solo en Firebase, con taxonomías cerradas hardcodeadas.**
- Regla: lo que se puede buscar y lo que se puede publicar está fijado por listas cerradas en el código: BAM-FILE/VCF y Male/Female para genómica; XR/PET, Shimadzu/LG Biocare, Leg/Pancreas para imagen; los precios y el id viajan tal cual en el registro del índice.
- Ejemplo: un vendedor no puede publicar un dataset «PET de Philips, región Hígado»: la UI no ofrece esas opciones; el contrato tampoco filtraría, pero el índice solo recibe lo que el formulario permite.
- Evidencia: tablas de opciones en Forms.js:50-153 (publicación), GenomicsForm.js:16-68 y DicomForm.js:11-64 (búsqueda); baseURL pública del índice en axios-orders.js:3-5.
- Clasificación: INTENCIONAL — listas cerradas explícitas en cinco formularios coherentes entre sí (publicar y buscar usan los mismos valores).

**RN-39 — Búsqueda «total»: todos los campos rellenados deben coincidir exactamente.**
- Regla: el campo vacío no filtra; el campo relleno filtra por igualdad exacta; un registro pasa si todos los campos pedidos coinciden.
- Ejemplo: buscar Data=VCF y Country=España sobre un registro cuyo Country es «SPAIN» → no coincide (igualdad exacta, sin normalización de mayúsculas).
- Evidencia: algoritmo boolMatch en GenomicsForm.js:131-165 (idéntico en DicomForm.js:127-161).
- Clasificación: INTENCIONAL — dos algoritmos deliberados con casilla que los conmuta (GenomicsForm.js:299-301).

**RN-40 — Búsqueda «parcial»: filtra también por los campos vacíos, lo que anula los resultados.**
- Regla: con la casilla de coincidencia parcial marcada, el filtro se aplica a TODOS los campos incluidos los vacíos: cualquier campo en blanco exige que el registro tenga ese campo vacío.
- Ejemplo: buscar solo Data=VCF (Address, Age, Country, Gender vacíos) → formData incluye `Address: ""` → ningún registro del índice tiene Address vacío → resultado: «No results were founded», aunque haya VCFs.
- Evidencia: recogida de TODOS los campos (GenomicsForm.js:100-102) y filtro por igualdad exacta campo a campo (112-118); idéntico en DicomForm.js:96-116.
- Clasificación: ACCIDENTAL — contradice el nombre «partial matching» que promete lo contrario (más resultados, no menos). DISCREPANCIA nombre/comportamiento: hallazgo.

**RN-41 — El importe que el comprador ofrece lo fija el índice, no el contrato.**
- Regla: el value de la compra se calcula con el precio del registro de Firebase; el contrato solo valida que alcance su propio precio.
- Ejemplo: contrato price 2 ETH, índice dice 1,5 → compra revierte (1,5 < 2); índice dice 2,5 → paga 2,5 y recibe 0,5 de vuelta (RN-14). Un índice desincronizado produce reverts inexplicables o sobrepagos devueltos.
- Evidencia: `value: Math.pow(10, 18) * price` con `price = res.Price` del índice (GenomicsForm.js:232-235, DicomForm.js:232); validación única del contrato en Marketplace.sol:236.
- Clasificación: ACCIDENTAL — dependencia de confianza no verificada (riesgo R6 del registro-riesgos).

## H. Identificadores, formatos y constantes

**RN-42 — La identidad del dataset es un roundtrip exacto bytes32 ↔ base58 con prefijo "1220".**
- Regla: la cadena que ve el usuario (id base58) y el bytes32 del contrato son la misma dirección IPFS con/sin el prefijo multihash; toda operación escribe en bytes32 y muestra en base58.
- Ejemplo: mostrar `0x23b4...aa4b` = prefijo "1220" + hex → base58; al comprar o retirar, el id base58 se re-decodifica (`bs58.decode(id).slice(2)`) para reconstruir el bytes32; cualquier carácter alterado rompe el roundtrip y la TX opera sobre un id inexistente.
- Evidencia: codificación en MyDatasets.js:34-38, MyDeals.js:49-53, Buyer.js:64-68; decodificación inversa en MyDatasets.js:73, 82; MyDeals.js:144, 155; Buyer.js:111, 118, 125, 150; origen en Forms.js:335.
- Clasificación: INTENCIONAL — patrón aplicado de forma consistente en los cinco contenedores.

**RN-43 — El formato físico del dataset está fijado por constantes mágicas: directorio base vacío, trozos de 30 MB, nombres por umbrales 10/100/1000, tamaño de enlace declarado 37.**
- Regla: todo dataset publicado sigue exactamente esta receta; cambiar cualquier constante rompe el emparejamiento con el descifrador del comprador.
- Ejemplo: un fichero de 65 MB → 3 partes (30000000 bytes cada una por `chunk_size`) → `part_0000.txt`, `part_0001.txt`, `part_0002.txt` (umbrales de renombrado en 10/100/1000) enlazadas sobre el directorio `QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn` con `size: 37` declarado en cada enlace (independiente del tamaño real de ~30 MB).
- Evidencia: Forms.js:301 (hash base), Forms.js:363 (chunk), Forms.js:414-440 (nombres), Forms.js:313-317 (size: 37).
- Clasificación: INTENCIONAL en su existencia (receta deliberada), ACCIDENTAL en los valores (el `size: 37` no describe el contenido real y no afecta al hash; SUPOSICIÓN que es un resto de depuración).

**RN-44 — El cifrado es AES con clave aleatoria de 32 bytes e IV aleatoria de 16; la «seed» pedida al vendedor no interviene.**
- Regla: la seguridad del dataset depende solo de la clave aleatoria generada en el navegador; la seed es un ritual de UI sin función criptográfica.
- Ejemplo: dos vendedores que introducen la misma seed obtienen claves completamente distintas; un vendedor que pierda la clave e IV mostradas no puede regenerarlas a partir de su seed.
- Evidencia: `Enigma.AES.create_key()` (Forms.js:355), IV aleatoria (Forms.js:359), sin uso de la seed en todo el flujo (Forms.js:274-283 la recoge; ningún uso posterior).
- Clasificación: DUDOSA — el Tutorial documenta la seed como paso obligatorio (Tutorial.js:111); o el código no implementa lo prometido o la seed tenía otro propósito. DISCREPANCIA: hallazgo (memoria-historica 1.9).

## I. Tiempos y plazos

**RN-45 — Todos los plazos del contrato corren sobre el tiempo del bloque; los plazos que ve el usuario son una foto congelada.**
- Regla: `now` es el timestamp del bloque; el cliente lee el tiempo UNA vez al montar la página y las cuenta atrás no avanzan mientras se mira.
- Ejemplo: el comprador carga Profile en t y ve «Time remaining → 4 mins»; se queda mirando 10 minutos y sigue viendo «4 mins» hasta recargar.
- Evidencia: `getTime()` leído una vez (Buyer.js:55; MyDeals.js:44) y restado estáticamente en el render (Buyer.js:390; MyDeals.js:220); `now` del contrato (Marketplace.sol:541-546).
- Clasificación: ACCIDENTAL — la decisión de leer una vez es de rendimiento, el efecto (cuenta atrás congelada) no parece buscado.

**RN-46 — Una custodia inexistente se cuenta como instante cero: la cuenta atrás mostrada es negativa y gigante.**
- Regla: los getters de checkpoint devuelven 0 cuando no hay custodia; el cálculo del cliente produce minutos negativos absurdos.
- Ejemplo (dato real calculado con la fórmula del código): checkpoint 0 con `time` de bloque ≈ 1.000.000.000 y periodo 300 → `parseInt(((0 - 1000000000) + 300) / 60)` = **-16666661 mins**.
- Evidencia: getters sin tratamiento de vacío (Marketplace.sol:548-560); fórmula en Buyer.js:390 y MyDeals.js:220.
- Clasificación: ACCIDENTAL — sin manejo del caso «aún no hay custodia».

**RN-47 — Las fronteras de todos los plazos son estrictas: el instante exacto del vencimiento NO vale.**
- Regla: `now > checkpoint + 5min` (mayor estricto): en el segundo exacto del vencimiento ni el vendedor retira ni el comprador recupera.
- Ejemplo (dato real calculado): con checkpoint + 300 s, `300 > 300` = false (revert); con +301 s, `301 > 300` = true (prospera).
- Evidencia: Marketplace.sol:290 y 311 (ambas comparaciones con `>` estricto).
- Clasificación: INTENCIONAL — mismo operador en ambos plazos, coherencia interna.

## J. Reglas del cliente

**RN-48 — «Comprador» es cualquier cuenta que no sea admin ni vendedor, y los roles solo se miran al cargar la página.**
- Regla: el rol no se declara: se deduce por negación de los otros dos, una única vez por carga.
- Ejemplo: al comprador que acaba de ser aprobado como vendedor le sigue apareciendo la vista de comprador hasta que recargue (F5).
- Evidencia: `buyer = !(admin || dataOwner)` (App.js:46-49); única lectura de roles en `componentDidMount` (App.js:32-59).
- Clasificación: INTENCIONAL — derivación deliberada (no hay `checkBuyerStatus` en el contrato); el refresco diferido es efecto colateral del punto de lectura único.

**RN-49 — Si una cuenta es admin y vendedor a la vez, solo ve su faceta de vendedor.**
- Regla: la precedencia de la vista es: data owner > admin > comprador (última asignación gana).
- Ejemplo: cuenta con ambos roles abre /profile → ve el menú del vendedor; la vista de administración es inalcanzable para esa cuenta.
- Evidencia: tres `if` que asignan la misma variable `message` (Profile.js:13-32).
- Clasificación: ACCIDENTAL — efecto de la asignación encadenada, no de una precedencia diseñada.

## K. Emergencia y ciclo de vida del mercado

**RN-50 — El propietario puede congelar toda la operativa con un interruptor; las consultas siguen.**
- Regla: en pausa, ninguna función de estado (publicar, comprar, entregar, retirar, recuperar, gestionar roles) funciona; todas las lecturas siguen respondiendo.
- Ejemplo: contrato pausado → el comprador aún ve sus deals y precios, pero toda TX de compra revierte.
- Evidencia: modificador `whenNotPaused` en todas las funciones de estado (Marketplace.sol:111-400, p. ej. 113, 122, 131, 145, 154, 163, 176, 192, 205, 216, 225, 233, 277, 286, 308, 358, 392); lecturas sin modificador (Marketplace.sol:406-643).
- Clasificación: INTENCIONAL — herencia de Pausable aplicada de forma sistemática (zeppelin vendido, Pausable.sol).

**RN-51 — El propietario puede cerrar el mercado y quedarse todo lo depositado.**
- Regla: la muerte del contrato transfiere el balance completo (custodias incluidas) al propietario o a quien él designe.
- Ejemplo: con 10 ETH en custodias de compradores, `destroyAndSend(0xZZZ)` drena los 10 ETH a 0xZZZ y el contrato deja de existir.
- Evidencia: herencia Destructible (Marketplace.sol:4, 7); `destroy`/`destroyAndSend` con `selfdestruct` (Destructible.sol:18-24).
- Clasificación: INTENCIONAL como capacidad técnica (heredada y no desactivada); DUDOSA como decisión de negocio visible al cliente (la publicidad promete descentralización total, Home.js:42-44 — DISCREPANCIA: hallazgo).

---

## Resumen de discrepancias comentario/código detectadas (hallazgos)

1. Tutorial promete 4 días; el contrato fija 5 minutos; la compra promete «5 days» (Tutorial.js:86, 148, 194; Marketplace.sol:35; GenomicsForm.js:244-245) — RN-24, RN-29, RN-34.
2. Tutorial promete reenvío de claves tras rechazo; el contrato lo bloquea (Tutorial.js:211-213 vs Marketplace.sol:194) — RN-20, RN-24.
3. Tutorial promete arbitraje y baneos; no existe en el contrato (Tutorial.js:211-213, 227-230) — RN-35.
4. Tests históricos asumen 10 segundos de custodia; hoy 5 minutos (test/TestMarketplace.js:337 vs Marketplace.sol:35) — RN-29.
5. «Partial matching» se comporta como filtro restrictivo con campos vacíos (GenomicsForm.js:100-120) — RN-40.
6. La seed documentada como paso obligatorio no participa en el cifrado (Tutorial.js:111 vs Forms.js:355) — RN-44.
7. El comentario del precio cita un contrato MyERC721 inexistente (Forms.js:180) — RN-23.
8. El marketing promete descentralización total; existe propietario con pausa, comisión 5 % y autodestrucción (Home.js:42-44 vs Marketplace.sol:223-230, Destructible.sol:18-24) — RN-51.
