# Mapa del sistema — Reconocimiento (000)

> Fase: documentación y protección (constitución v1.0.0,
> `.specify/memory/constitution.md`). Toda afirmación lleva su evidencia
> (fichero:líneas). Lo no verificable se marca **SUPOSICIÓN**.
> Fecha: 2026-11-17. Método: lectura estática de código; no se ejecutó el
> sistema ni se dispuso de testimonio del negocio salvo el input original.

## 1. Visión general

CypherDream es una plataforma de compraventa de datos biológicos
(genómicos BAM/VCF e imagen médica DICOM) donde: el dueño de datos cifra el
fichero en su navegador, lo sube a IPFS, registra el hash y precio en un
contrato Ethereum y publica los metadatos en una base índice externa; el
comprador paga en ETH al contrato, recibe cifradas la IV y la clave
simétrica mediante la clave pública que registró, y descifra el fichero en
su navegador. Evidencia del flujo: client/src/containers/Views/DataOwner/Forms/Forms.js:349-503 (cifrado y subida),
contracts/Marketplace.sol:232-273 (compra), Marketplace.sol:190-200 (envío
de IV/clave), client/src/containers/Views/Buyer/Buyer.js:144-317
(descifrado y descarga). La publicidad de la plataforma lo confirma en
términos de negocio (client/src/containers/Home/Home.js:34-44).

## 2. Mapa por módulo

### 2.1 Capa blockchain

| Módulo | Responsabilidad (negocio) | Depende de | Dependen de él | Criticidad |
|---|---|---|---|---|
| `contracts/Marketplace.sol` | Es la ley del mercado: define quién puede vender, a qué precio, cómo se paga, cómo se entrega la "llave" del dataset y cómo se retira el dinero con 5 % de comisión (Marketplace.sol:294-297) y 5 min de espera (Marketplace.sol:35) | zeppelin local (Marketplace.sol:3-7) | Todo el cliente, server indirectamente, tests | **Alta**: sin él no hay mercado; es el único estado financiero del negocio |
| `contracts/Migrations.sol` | Permite actualizar el sistema de despliegue de Truffle de forma controlada (pragma 0.4.23) | — | `migrations/1_initial_migration.js` | Baja: andamiaje de despliegue, sin lógica de negocio |
| `installed_contracts/zeppelin` (Ownable, Destructible, Pausable) | Aporta al mercado: un único dueño máximo (Ownable.sol), capacidad de cerrarlo y vaciarlo (Destructible) y un interruptor de parada (Pausable; usado por todos los flujos vía `whenNotPaused`) | — | Marketplace.sol:3-7 | **Alta** (solo esos 3): control de acceso y emergencia del negocio |
| `migrations/2_deploy_contracts.js` | Manual de instalación del mercado: despliega y enlaza las piezas | contratos anteriores | Despliegue en desarrollo | Media: sin él no hay red desplegada, pero no participa en operación |
| `build/contracts/*.json` y `client/src/contracts/*.json` | "Ficha técnica" del mercado ya instalado que el navegador usa para hablar con él (Marketplace.json idéntico en ambos sitios, verificado por md5) | compilación de contracts | App.js:6, truffle-contract | Media: punto de acople obligatorio cliente-cadena; desincronizarlo rompería la app |

### 2.2 Backend / infraestructura

| Módulo | Responsabilidad (negocio) | Depende de | Dependen de él | Criticidad |
|---|---|---|---|---|
| `server.js` | Guardián del almacén: recibe peticiones y fija un CID concreto en el clúster IPFS local (server.js:20); hoy es un end-point de prueba (`POST /api` responde un json`, server.js:27) | Express, `ipfs-cluster-api` (¡no declarada!, server.js:5) | Nadie en el código cliente (el cliente habla con IPFS directamente, client/src/ipfs.js:4-11) | Baja: funcionalmente decorativo hoy; su rol real es SUPOSICIÓN pendiente del negocio |
| `ipfs-config/` | Configuración de instalación del nodo IPFS (leeme: "el fichero api y config deben ir en el directorio .ipfs del proyecto ipfs") | nodo IPFS externo | infraestructura off-chain | Media: sin clúster IPFS no hay datasets accesibles |
| `secret.js` | Credenciales de despliegue (mnemónico usado por la red rinkeby comentada, truffle.js:23); NO leer su contenido | — | truffle.js:1 | **Alta por riesgo** (anomalía A-01): quien la posea controla carteras de despliegue |

### 2.3 Cliente web — esqueleto

| Módulo | Responsabilidad (negocio) | Depende de | Dependen de él | Criticidad |
|---|---|---|---|---|
| `client/src/index.js` | Puerta de entrada: monta la web y el enrutador | React, App, serviceWorker | — | Media |
| `client/src/App.js` | Recepcionista y control de acceso informal: conecta la cartera del usuario (getWeb3), lee sus roles del contrato (admin, dueño de datos, comprador, App.js:44-49) y reparte las páginas | getWeb3, contracts/Marketplace.json, Layout, contenedores | todas las rutas | **Alta**: sin conexión a cadena no hay producto |
| `client/src/utils/getWeb3.js` | Traductor con la cartera del usuario (MetaMask o nodo local 127.0.0.1:9545) | web3 | App.js:4 | **Alta** |
| `client/src/hoc/Layout/`, `components/Navigation/` | Escaparate y cartelería: menú con Home, Tutorial, Marketplace, Profile (NavigationItems.js:7-10) | UI básica | App | Baja |
| `client/src/containers/Home/Home.js` | Marketing: explica qué es CypherDream y enlaza al resto | imágenes propias | App | Baja |
| `client/src/containers/Tutorial/Tutorial.js` | Manual de usuario estático (cómo comprar, recuperar fondos, etc., Tutorial.js:149-195) | — | App | Baja |
| `client/src/containers/Profile/Profile.js` | Distribuidor por rol: muestra la vista de Admin, Dueño de datos o Comprador según lo que diga el contrato (Profile.js:13-32) | Views/* | App | **Alta**: es la puerta a toda la operativa |

### 2.4 Cliente web — roles de negocio

| Módulo | Responsabilidad (negocio) | Depende de | Dependen de él | Criticidad |
|---|---|---|---|---|
| `Views/Admin/Admin.js` | Gestión del personal del mercado: alta/baja de administradores, aprobación o rechazo de vendedores (data owners) y cobro de comisiones (Admin.js:72-118, 206-215) | contrato, Modal | Profile | **Alta**: controla quién puede vender y quién cobra la comisión |
| `Views/DataOwner/DataOwner.js` | Menú del vendedor: publicar dataset, mis datasets, mis ventas (DataOwner.js:15-41) | NavLink | Profile | Media |
| `Views/DataOwner/Forms/Forms.js` | Publicación del dataset: cifra el fichero en el navegador (Enigma AES), lo trocea y sube a IPFS, lo ancla al clúster, registra hash+precio on-chain y publica metadatos en la base índice (Forms.js:180-192, 294-503) | ipfs.js, Enigma, bs58, axios-orders, contrato | App (ruta /profile/Forms) | **Alta**: es el flujo que crea el inventario del mercado |
| `Views/DataOwner/MyDatasets/MyDatasets.js` | Catálogo del vendedor: cambiar precio y retirar datasets (MyDatasets.js:72-87) | contrato, bs58 | App | Alta |
| `Views/DataOwner/MyDeals/MyDeals.js` | Venta y entrega: cifra IV+clave con la clave pública del comprador (ECIES) y las publica on-chain; retira el dinero (MyDeals.js:127-159) | contrato, eth-ecies, bs58 | App | **Alta**: sin esto el comprador jamás recibe el dataset |
| `Views/Buyer/Buyer.js` | Compra y consumo: lista compras activas/cerradas, descifra IV+clave con su clave privada, descarga y descifra el dataset desde IPFS, gestiona reembolsos y autorizaciones de retirada (Buyer.js:110-169, 171-317) | contrato, ipfs.js, Enigma, eth-ecies, streamsaver | Profile | **Alta**: es la promesa de valor para el comprador |
| `Marketplace/Marketplace.js` | escaparate de búsqueda: agrupa los formularios de búsqueda GENOMICS y DICOM (Marketplace.js:48-83) | GenomicsForm, DicomForm | App | Media |
| `GenomicsForm/GenomicsForm.js` y `DicomForm/DicomForm.js` | Buscador del catálogo (base índice Firebase) y compra: filtra resultados, lanza `purchaseDataset` y registra la clave pública del comprador (GenomicsForm.js:79-120, 233-265) | axios-orders, SearchResults, contrato, ethereumjs-tx/util | Marketplace.js | **Alta**: es el punto donde el comprador gasta dinero |
| `axios-orders.js` | Enlace con el índice de búsqueda externo (Firebase `data-storage123.firebaseio.com`, axios-orders.js:4) | axios | Forms, GenomicsForm, DicomForm, IndexDB | **Alta** (por lo que depende de él): sin índice no hay búsqueda; es un servicio EXTERNO ajeno al repo (SUPOSICIÓN: Firebase del negocio) |
| `ipfs.js` | Conexión con el almacenamiento: nodo IPFS local (5001) y clúster (9094) (ipfs.js:4-11) | ipfs-http-client, ipfs-cluster-api | Forms, Buyer | **Alta**: sin IPFS no hay datos |
| `components/UI/*` (Modal, Spinner, Input, etc.) | Mobiliario de la interfaz | — | vistas y formularios | Baja |
| `components/SearchResults/SearchResults.js` | Tarjeta de resultado de búsqueda con botón de compra | — | GenomicsForm, DicomForm | Media |
| `serviceWorker.js`, `App.test.js` | Andamiaje de Create React App (test humo por defecto, App.test.js:5-8) | — | — | Baja |

## 3. Diagrama de dependencias (texto)

```
                          ┌──────────────────────────────┐
                          │   INSTALACIÓN / DESPLIEGUE   │
                          │  migrations/ → Migrations.sol│
                          │  secret.js ──> truffle.js    │
                          └──────────────┬───────────────┘
                                         v
  installed_contracts/zeppelin ──hereda──> contracts/Marketplace.sol
  (Ownable, Destructible, Pausable)        (ley del mercado, ETH)
                                         │  build/contracts/*.json
                                         │  = client/src/contracts/*.json
                                         v
┌──────────────────────────── CLIENTE WEB (client/src) ─────────────────────┐
│ index.js → App.js ──(getWeb3: cartera usuario)─────────────────────────── │
│    │            │                                                        │
│    │            ├── Profile ──> Admin (personal y comisiones)            │
│    │            │            └─> DataOwner ─> Forms ─────────┐           │
│    │            │            └─> Buyer (compra y descarga)   │           │
│    │            │                                          │           │
│    │            └── Marketplace ──> GenomicsForm            │           │
│    │                             └────> DicomForm          │           │
│    │                                  │                    │           │
│    └── Home / Tutorial (estáticos)      │                    │           │
│                                         v                    v           │
│                          axios-orders ──> Firebase          │           │
│                          (índice de búsqueda, EXTERNO)      │           │
│                                                             v           │
│                                     ipfs.js ──> nodo IPFS 5001          │
│                                            └────> clúster IPFS 9094      │
└─────────────────────────────────────────────────────────────────────────-┘
                                         ▲
                          server.js ─────┘  (fija CID en clúster; hoy demo)
```

Flujo de negocio nominal:
`Forms (cifra+sube IPFS+registra on-chain+indexa en Firebase)` →
`GenomicsForm/DicomForm (busca en Firebase, compra on-chain)` →
`MyDeals (envía IV+clave cifradas on-chain)` →
`Buyer (descifra y descarga desde IPFS)` →
`MyDeals/ownerWithdrawal (retira el dinero; 5 % comisión)`.

## 4. Tecnologías y versiones reales

| Tecnología | Versión | Evidencia |
|---|---|---|
| Solidity (Marketplace) | `^0.4.24` | contracts/Marketplace.sol:1 |
| Solidity (Migrations) | `^0.4.23` | contracts/Migrations.sol:1 |
| Optimizador solc | activado, 200 runs | truffle.js:15-19 |
| Red de despliegue | development localhost:8545, gas 4698712, gasPrice 25 gwei | truffle.js:6-13; rinkeby COMENTADA truffle.js:21-35 |
| Truffle | no fijado en package.json (SUPOSICIÓN: instalación global) | package.json:13-26 |
| truffle-hdwallet-provider | `0.0.6` | package.json:24 |
| Node/Express server | Express `^4.16.3`, body-parser `^1.18.3` | package.json:17, 20 |
| ipfs-cluster-api (server) | **AUSENTE** (requerida en server.js:5) | package.json:13-26; anomalía A-02 |
| ipfs-cluster-api (cliente) | `0.0.5` | client/package.json:20 |
| ipfs-http-client | `^31.0.0` | client/package.json:19 |
| React | `^16.8.6` | client/package.json:11 |
| react-scripts / CRA | `3.0.1` | client/package.json:15 |
| react-app-rewired | `^2.1.3` | client/package.json:47 (devDependencies) |
| react-router-dom | `^5.0.0` | client/package.json:13 |
| web3 (cliente) | `^1.0.0-beta.35` | client/package.json:21 |
| truffle-contract | `^4.0.15` | client/package.json:20 |
| Cifrado: @cubbit/enigma | `^1.0.0` | client/package.json:5 |
| Cifrado: eth-ecies | `^1.0.3` | client/package.json:9 |
| Cifrado: crypto-js | `^3.1.9-1` | client/package.json:8 (solo referencia comentada, Forms.js:20) |
| bs58 | `^4.0.1` | client/package.json:7 |
| bignumber.js | `^8.0.1` (raíz y cliente) | package.json:15; client/package.json:6 |
| ethereumjs-tx / ethereumjs-util | `^1.3.7` / `^6.0.0` | package.json:18-19 |
| axios | `^0.18.0` | client/package.json:6 |
| streamsaver | `^1.0.2` (raíz) / `^2.0.2` (cliente) | package.json:23; client/package.json:16 |
| node-sass | `^4.12.0` | client/package.json:14 |
| jQuery | `^3.4.1` (sin uso detectado en client/src) | client/package.json:10 |
| @cubbit/web-file-stream | `^1.0.0` — SOLO transitiva de enigma, importada directamente en Forms.js:15 | client/package-lock.json:919-923 |
| Índice de búsqueda | Firebase Realtime DB externo | axios-orders.js:4 |
| zeppelin local | versión no declarada (vendida a mano en installed_contracts) | installed_contracts/zeppelin/ |

## 5. Zonas oscuras

Código muerto, huérfanos, funcionalidades a medias y rarezas detectadas en
el reconocimiento. Nada de esto se corrige (Principio III de la
constitución); queda registrado para el módulo siguiente.

### 5.1 Ficheros huérfanos y código muerto

1. **`containers/IndexDB/IndexDB.js`** — sin ningún import vivo; solo se
   referencia comentado en GenomicsForm.js:12. Además devuelve `this.state.data`
   (un objeto) como JSX (IndexDB.js:26), lo que no renderizaría nada.
2. **`containers/Views/DataOwner/Forms/duplexExample.js`** — 195 líneas de
   experimentos con streams (`Transform`, `pipeline`), sin ninguna referencia
   en todo el proyecto (búsqueda de "duplexExample" sin resultados salvo el
   propio fichero).
3. **`containers/Views/DataOwner/Forms/MySomething.worker.js`** — worker de
   prueba con CryptoJS; su único import está comentado (Forms.js:20). El
   andamiaje de workers sí está activo: `config-overrides.js` registra
   `worker-loader` para `*.worker.js` (config-overrides.js:4-40) y
   `worker-loader@^2.0.0` está en devDependencies (client/package.json:50).
4. **Estado y handlers muertos en Marketplace.js** — los handlers
   `genomicsFormHandler`/`dicomFormHandler` y el estado `genomicsForm`/`dicomForm`
   (Marketplace.js:7-20) no se usan en el render: los formularios se renderizan
   SIEMPRE dos veces (dentro y fuera del acordeón, Marketplace.js:28-39 y 59-79).
5. **Duplicación GenomicsForm/DicomForm** — dos contenedores casi gemelos
   (370 y 338 líneas) que copian la lógica de búsqueda; y los formularios de
   Forms.js (Forms.js:50-153) repiten los mismos campos de nuevo.
6. **Enlaces muertos en Buyer.js** — el estado `invalid` nunca se pone a `true`
   (solo a `false` en Buyer.js:32, 175), así que el modal de "Reject password"
   (Buyer.js:362-365) es inalcanzable; `dataFile` nunca se asigna, por lo que el
   enlace `<a href={this.state.dataFile}>` (Buyer.js:418) apunta a vacío.
7. **`seed` recogida y no usada** — Forms.js pide una "seed" al vendedor
   (Forms.js:635-642, handlers en 274-283) pero la clave AES se genera
   aleatoriamente con `Enigma.AES.create_key()` (Forms.js:355): la semilla no
   interviene en el cifrado.
8. **jQuery y otras dependencias sin uso detectado** — `jquery` (client), y en
   raíz `aes-wasm`, `stream-buffers`, `interface-ipfs-core`,
   `web-streams-polyfill` no aparecen en ningún import vivo de client/src,
   server.js ni test/ (búsqueda sin resultados). Las de raíz probablemente
   servían a los tests hoy comentados (SUPOSICIÓN).
9. **`truffle-hdwallet-provider`** solo se usa en el bloque de rinkeby
   COMENTADO (truffle.js:21-35); en desarrollo no interviene.
10. **Zeppelin: ~40 contratos vendidos, 3 usados** — de todo
    installed_contracts/zeppelin solo Ownable, Destructible y Pausable se
    importan (Marketplace.sol:3-7). El resto (crowdsale, tokens, math, etc.)
    es peso muerto.
11. **Estáticos posiblemente sin uso** — client/src contiene logo.jpg, logo.png,
    logo.svg además del logo del Toolbar (carpeta Toolbar/logo); solo se pudo
    verificar el uso de man.jpg, join_rev.jpg, dna.jpg (Home.js:3-5).

### 5.2 Funcionalidades a medias

12. **server.js es un end-point de demostración** — fija un CID codificado a
    mano (server.js:20) y responde con un json (server.js:27). Su rol
    productivo previsto es SUPOSICIÓN pendiente del negocio. Además requiere
    `ipfs-cluster-api` que no está declarada (anomalía A-02).
13. **Test humo del cliente probablemente roto** — App.test.js:5-8 renderiza
    `App` fuera del `BrowserRouter` (que solo se monta en index.js:11-15); con
    react-router v5, `Switch`/`Route` fuera de Router lanza error. SUPOSIÓN
    (no se ejecutó), pendiente de verificar en módulo de tests.
14. **Tests de contratos íntegramente comentados y desactualizados** —
    (anomalías A-03 y A-04): test/TestMarketplace.js:8-707 comentado; los
    comentarios suponen un periodo de retirada de 10 s (test/TestMarketplace.js:337)
    cuando el contrato fija 5 minutos (Marketplace.sol:35).
15. **Sin autenticación ni guardas de rutas** — las rutas /profile, /profile/Forms,
    etc. se sirven a cualquiera; solo el contenido cambia según los roles leídos
    del contrato (App.js:44-49). La seguridad real vive on-chain, no en el navegador.
16. **Claves de descifrado mostradas en claro al vendedor** — tras publicar,
    Forms.js muestra key e IV en texto plano en pantalla (Forms.js:578-589); el
    vendedor debe copiarlas a mano y reintroducirlas en MyDeals (MyDeals.js:127-152).
    Flujo funcional pero manual y frágil.
17. **Dependencia directa de un paquete transitivo** — Forms.js:15 importa
    `@cubbit/web-file-stream`, que solo está en el árbol como dependencia de
    @cubbit/enigma (client/package-lock.json:919-923); no está declarada en
    client/package.json. Funciona por hoisting de npm; es frágil.
18. **Build del cliente y node_modules rastreados en git** — el snapshot
    (bbc383e4) incluye client/node_modules (53 915 ficheros), node_modules raíz
    y client/build. Mala práctica de repositorio, relevante para auditoría.
19. **Inconsistencia de pragma** — Migrations.sol usa `^0.4.23`
    (Migrations.sol:1) frente a `^0.4.24` del resto (Marketplace.sol:1).
20. **Secretos en el repositorio** — secret.js (146 bytes) está versionado en
    git y referenciado por truffle.js:1 (anomalía A-01).

### 5.3 Preguntas abiertas (SUPOSICIONES) para el negocio

- ¿Qué rol debe tener server.js en producción? (hoy: demo, server.js:18-29)
- ¿La base índice Firebase `data-storage123.firebaseio.com` es propiedad del
  negocio y debe seguir siendo el índice de búsqueda? (axios-orders.js:4)
- ¿La "seed" que se pide al vendedor debía usarse para derivar la clave? (Forms.js:274-283)
- ¿Los datos reales (dataset biométrico del CID fijado en server.js:20 y el
  CID vacío base de Forms.js:301 `QmUNLLs...`) son de prueba? SUPOSICIÓN: sí.
- ¿Los tests comentados reflejan una versión anterior del contrato que debe
  restaurarse como referencia histórica? (test/TestMarketplace.js:8-707)
