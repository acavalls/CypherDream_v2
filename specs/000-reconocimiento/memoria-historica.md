# Memoria histórica — Reconocimiento (000)

> Fase: documentación y protección (constitución v1.0.0,
> `.specify/memory/constitution.md`). Fecha: 2026-11-17. Método: lectura de
> TODOS los comentarios y código comentado del proyecto (client/src,
> contracts, test, migrations, server.js, truffle.js, ipfs-config, README),
> cruzado con el historial git. Nada se corrige (Principio III).

**Sobre las fechas**: ningún comentario del código fuente lleva fecha. Las
fechas aproximadas se derivan de dos fuentes: (a) el snapshot original del
repositorio es `bbc383e4` del **2026-11-16** ("Project snapshot", git log),
así que todo comentario de código es anterior a esa fecha; (b) evidencia
indirecta interna (duplexExample.js cita artículos de diciembre de 2018 en
duplexExample.js:51, 91, 106; react-scripts 3.0.1 es de mediados de 2019,
client/package.json:19), que sugiere que el código se escribió hacia
**2019**. Todo lo fechado como "~2019" es **SUPOSICIÓN** razonada. Los
eventos de la sesión de trabajo del agente sí tienen fecha cierta
(2026-11-17).

**Sobre "quién"**: no hay ni un solo nombre de persona en ningún comentario
del proyecto. Los responsables aparecen como roles: "el autor del código"
(anónimo), "CypherDream" (persona jurídica implícita en el Tutorial), "el
negocio" (interlocutor de la sesión actual). Esta ausencia es en sí misma
un hallazgo (ver 5.1).

---

## 1. Decisiones de negocio visibles en los comentarios

| # | Fecha aprox. | Qué pasó o qué se decidió | Quién aparece implicado | Dónde está el comentario | Pregunta al negocio |
|---|--------------|---------------------------|-------------------------|--------------------------|---------------------|
| 1.1 | ~2019 (antes del snapshot) | El vendedor se llamaba "store owner" y su solicitud se llamaba `requestStoreOwner`; se renombró a "Data Owner" (`requestDataOwnerStatus`). El renombre afectó a API, tests y UI. | Autor anónimo del contrato | test/TestMarketplace.js:58-82 (API antigua comentada); test/TestMarketplace.sol:20-24 (artefacto congelado con el nombre antiguo, NUNCA actualizado) | ¿Por qué se renombró "store owner" a "data owner" y quedó un test Solidity sin tocar? ¿Hay más restos de esa era? |
| 1.2 | ~2019 (evolución dentro del snapshot) | `registerDataset` primero NO llevaba precio (los tests antiguos lo llaman solo con el hash); después se añadió el parámetro precio. | Autor anónimo del contrato | test/TestMarketplace.js:102 (sin precio) vs TestMarketplace.js:140 (con precio) | ¿El precio por dataset fue una decisión posterior? ¿Hubo otra forma de fijar precios antes? |
| 1.3 | ~2019 (evolución) | `passwordUpload` primero solo marcaba un booleano (sin IV ni clave); después se amplió para almacenar IV y clave cifradas on-chain. | Autor anónimo del contrato | test/TestMarketplace.js:171, 325, 634 (sin IV/clave) vs contracts/Marketplace.sol:190-200 (con IV/clave) | ¿Cuándo y por qué se decidió guardar las claves cifradas del comprador en la cadena? (relacionado con el riesgo de privacidad A-06) |
| 1.4 | ~2019 (evolución) | El periodo de custodia era de **10 segundos** en la era de los tests; hoy el contrato fija **5 minutos** (Marketplace.sol:35). El Tutorial y la UI hablan de 4 días y 5 días. Tres épocas, tres cifras. | Autor anónimo del contrato; autor del Tutorial | test/TestMarketplace.js:337, 419, 492, 569, 644 ("withdrawalWaitPeriod = 10 seconds"); Tutorial.js:86, 148, 163, 174, 194; GenomicsForm.js:244-245 ("up to 5 days") | ¿Cuál es la cifra de negocio real prevista: 10 s, 5 min, 4 días o 5 días? ¿La cambio de 10 s a 5 min fue decisión deliberada? |
| 1.5 | ~2019 (evolución) | Antes se permitía registrar el MISMO dataset dos veces (el test antiguo lo hace y espera contador 2); el contrato actual lo prohíbe (`require(dataOwner[msg.sender][id] != true)`). | Autor anónimo del contrato | test/TestMarketplace.js:106-109 (doble registro esperado) vs contracts/Marketplace.sol:178 (prohibición actual) | ¿La prohibición de duplicados se añadió tras un incidente real? |
| 1.6 | ~2019 | El Tutorial documenta una política de plazos de **4 días** para todo el ciclo (subir claves, rechazar, retirar) que NO existe en el contrato: ninguna función del contrato aplica 4 días. | CypherDream (autor del Tutorial) | Tutorial.js:86 ("after 4 days"), Tutorial.js:148 ("up to 4 days"), Tutorial.js:163 ("up to 4 days in order to reject them"), Tutorial.js:194 ("You will have 4 days") | ¿Los "4 días" del Tutorial fueron una decisión de negocio que nunca llegó al contrato, o una promesa de marketing? |
| 1.7 | ~2019 | El Tutorial promete un mecanismo de **baneo** ("CypherDream will ban any Ethereum account that accumulates 3 valid rejected keys"; "could ban" por datasets corruptos): el contrato no tiene ninguna función de ban. | CypherDream (autor del Tutorial) | Tutorial.js:227-230 | ¿El baneo se pretendía aplicar fuera de la cadena (lista manual de admins) o quedó en el aire? |
| 1.8 | ~2019 | El Tutorial promete **arbitraje**: si el comprador rechaza las claves, "CypherDream will determine the corresponding good actor and who will get the deal tokens". El contrato no tiene árbitro ni función para resolver disputas. | CypherDream (autor del Tutorial) | Tutorial.js:211-213 | ¿Quién ejercería ese arbitraje y con qué poder técnico sobre los fondos? |
| 1.9 | ~2019 | Se decidió pedir una **"seed" alfanumérica al vendedor** antes de subir el fichero (el Tutorial la documenta como paso obligatorio), pero el código no la usa para nada (la clave AES se genera aleatoria). La seed existe como decisión de UI/UX, no como criptografía. | Autor de Forms y del Tutorial | Tutorial.js:111 ("introduce an alphanumeric seed"); Forms.js:274-283 (recogida); Forms.js:355 (clave aleatoria, la seed no interviene) | ¿Para qué se diseñó la seed? ¿Debía derivar la clave de cifrado? |
| 1.10 | ~2019 | Comentario interno que menciona un contrato **MyERC721** ("so that it is acceptable to MyERC721 contract"): el proyecto pensaba tokenizar los datasets (NFT) y no hay rastro de ese contrato en el repositorio. | Autor de Forms | Forms.js:180 (comentario del cálculo de precio) | ¿Existió o se planificó un contrato MyERC721? ¿La tokenización de datasets sigue en la hoja de ruta? |
| 1.11 | ~2019 | Se decidió mover la infraestructura IPFS de un **servidor remoto** (IP pública 209.250.245.197, hoy comentada) a **localhost** (127.0.0.1:5001 y clúster 9094). | Autor de ipfs.js | ipfs.js:5 (host remoto comentado) vs ipfs.js:6-7 (localhost activo) | ¿209.250.245.197 fue el nodo IPFS de producción? ¿Sigue operativo y con datasets reales? |
| 1.12 | ~2019 | Se decidió **integrar Bootstrap** (imports CSS/JS/Popper) y después se desistió de importarlo, aunque todo el JSX sigue usando clases Bootstrap y `data-toggle` de acordeón que necesitan bootstrap.js. | Autor de index.js | client/src/index.js:7-9 (imports comentados: bootstrap css, bootstrap.bundle, popper.js); uso vivo de clases en Marketplace.js:48-83, Tutorial.js:44, Forms.js:663-695 | ¿Por qué se abandonó el import de Bootstrap? ¿Los acordeones funcionaron alguna vez colapsando? |
| 1.13 | ~2019 | Se decidió que la **red de despliegue real sería Rinkeby** con HDWalletProvider (bloque completo escrito y comentado en truffle.js); en desarrollo se usa localhost:8545. | Autor de truffle.js | truffle.js:21-35 (configuración rinkeby comentada) | ¿Rinkeby es la red objetivo? ¿Por qué está desactivada? (Rinkeby ya no existe como testnet: ¿a qué red migraría el negocio?) |

## 2. Incidentes mencionados

| # | Fecha aprox. | Qué pasó | Quién aparece implicado | Dónde está el comentario | Pregunta al negocio |
|---|--------------|----------|-------------------------|--------------------------|---------------------|
| 2.2 | 2026-11-17 (sesión actual, fecha cierta) | El negocio decidió **borrar el registro de anomalías** ("lo haremos más adelante"). Decisión documental, no técnica. | El negocio (interlocutor de la sesión, sin nombre) | git commit 71331e2d (baja del fichero); decisión en conversación del 2026-11-17 | ¿Cuándo se quiere retomar el registro de anomalías y con qué alcance? |
| 2.3 | ~2019 (sin fecha en el código) | El endpoint `POST /api` de server.js quedó en estado de **demo sin terminar**: ancla a mano un CID concreto y responde un json de broma; sus logs ("HOLA!", "ATPC") no describen lo que hace. Era conocido como punto a retomar. | Autor de server.js | server.js:18-29 (endpoint demo), server.js:19-22 (logs "HOLA!"/"ATPC"); mapa-sistema 5.2.12 | ¿Cuál era el rol productivo previsto de server.js y por qué quedó a medias? |
| 2.4 | ~2019 | `test/TestMarketplace.sol` quedó **congelado en una API que ya no existe**: llama a `requestStoreOwner`/`getStoreOwnerRequestLength`, funciones que el contrato actual ni siquiera tiene; compilarlo rompería. Nadie lo retiró ni actualizó. | Autor de los tests | test/TestMarketplace.sol:20-24 (llamadas a API muerta); contraste con contracts/Marketplace.sol:153-170 (API actual) | ¿Se quiere conservar como referencia histórica o retirarlo del proyecto? |

## 3. Advertencias del tipo "no tocar" y sus motivos

| # | Fecha aprox. | Advertencia y motivo declarado | Quién aparece implicado | Dónde está el comentario | Pregunta al negocio |
|---|--------------|-------------------------------|-------------------------|--------------------------|---------------------|
| 3.1 | ~2019 | "el fichero api y config deben ir en el directorio .ipfs del proyecto ipfs": advertencia de instalación del nodo IPFS (copiar los ficheros de ipfs-config/ al directorio del nodo). Motivo implícito: sin ellos el nodo no responde. | Autor del leeme | ipfs-config/leeme:1 | ¿Quién monta el nodo IPFS y dónde? ¿Los ficheros api/config actuales son de producción? |
| 3.2 | ~2019 | "This is necessary for avoiding the issue with worker window": en config-overrides.js se fija `globalObject = 'this'` en el output de webpack por un problema concreto de los web workers; es una advertencia de que tocar eso rompe los workers. | Autor de config-overrides.js | client/config-overrides.js:53-54; también 4 ("Add worker-loader by hijacking configuration") y 57 (consola de depuración comentada) | ¿El "issue with worker window" sigue vigente con el toolchain actual? (los workers están abandonados, ver 4.1) |
| 3.3 | ~2019 | "// This must be the dataset symmetric pwd." en MyDeals: advertencia semántica de que el campo "iv" que se pide al vendedor ES la contraseña simétrica del dataset, no un vector de inicialización cualquiera. | Autor de MyDeals | MyDeals.js:133 | ¿La nomenclatura iv/key confundió a vendedores reales durante las pruebas? |
| 3.4 | ~2019 | Advertencia al comprador en la UI: "In case that you reject the TX, you won't receive the password for decryption. Anyways, you will be able to recover your funds after the withdrawal period (up to 5 days)". Es la única "letra pequeña" operativa del flujo de compra. | Autor de GenomicsForm | GenomicsForm.js:242-245 | ¿Quién redactó este aviso y por qué se eligió "5 days" si el contrato fija 5 minutos? |

## 4. Trabajos abandonados

| # | Fecha aprox. | Trabajo abandonado y restos que dejó | Quién aparece implicado | Dónde está el comentario | Pregunta al negocio |
|---|--------------|--------------------------------------|-------------------------|--------------------------|---------------------|
| 4.1 | ~2019 | **Web workers para cifrar en segundo plano**: se montó toda la infraestructura (worker-loader secuestrando la config de babel, worker de ejemplo con CryptoJS) y se abandonó antes de conectarla: los imports están comentados en Forms. | Autor de Forms y de config-overrides.js | Forms.js:19-23 (comentarios del helper), Forms.js:20-21 (imports comentados), Forms.js:523-536 ("PLAYING WITH WORKERS", código comentado); MySomething.worker.js:3-12 (worker completo, referenciado en CRA issue 1277, Forms.js:23); client/config-overrides.js:4-54 (infra viva pero sin cliente) | ¿Se abandonó por rendimiento o por complejidad? ¿El cifrado en hilo principal es aceptable para ficheros grandes? |
| 4.2 | ~2019 | **Experimentos con streams de Node** (duplexExample.js): cinco ejemplos copiados de tutoriales externos (YouTube, github issue 1076, dos artículos de ar.al de diciembre 2018) para aprender Transform/pipeline; incluida una clase `chunkCorrector` duplicada dos veces. Sin ninguna referencia en el proyecto. | Autor de Forms (aprendizaje) | duplexExample.js:1-196 (todo comentado); referencias externas en duplexExample.js:2, 29, 51, 106 | ¿Fue material de aprendizaje de una persona concreta? ¿Hay decisiones de diseño de Forms que dependan de esos experimentos? |
| 4.3 | ~2019 | **Vías alternativas de subida a IPFS**: se probaron `ipfs.addFromStream` y un segundo `addReadableStream` como alternativas a la solución final; quedaron comentadas bajo el rótulo "ALTERNATIVE IPFS UPLOAD". | Autor de Forms | Forms.js:505-520 ("ALTERNATIVE IPFS UPLOAD", dos bloques comentados) | ¿Se evaluó alguna de las alternativas para producción? ¿Por qué se prefirió la actual por trozos? |
| 4.4 | ~2019 | **Componente IndexDB** (visor del índice Firebase): componente completo, huérfano; su único import está comentado en GenomicsForm y su render devuelve un objeto (no renderizaría nada). | Autor de GenomicsForm/IndexDB | GenomicsForm.js:12 (import comentado); IndexDB.js:4-30 (componente entero) | ¿El visor del índice se abandonó o se integrará en el Marketplace? |
| 4.5 | ~2019 | **Cuenta atrás en horas**: versión anterior del contador de retirada mostraba horas (división /3600, sufijo 'hours'); se sustituyó por minutos (/60) dejando la anterior comentada en línea. | Autor de MyDeals | MyDeals.js:219 (variante en horas comentada) vs MyDeals.js:220 (variante en minutos activa) | ¿El cambio horas→minutos acompañó al cambio del periodo de custodia (10 s→5 min)? |
| 4.6 | ~2019 | **Getter `getTransactionInfo` del contrato**: se escribió, se comentó entero y quedó en el fuente; devolvía buyer/owner/id/balance/purchased de una transacción. | Autor del contrato | contracts/Marketplace.sol:613-622 (bloque comentado) | ¿Se retiró por gas, por privacidad o por falta de uso? ¿Hace falta una vista de transacción para soporte? |
| 4.7 | ~2019 | **Prototipo de recuperación de clave pública desde la firma de la TX** dentro de los tests: el test de `registerPublicKey` contiene anidado su propio bloque comentado que reconstruye la TX con ethereumjs-tx y extrae la pubkey (`getSenderPublicKey`). Ese prototipo terminó siendo código de producción en GenomicsForm, pero el prototipo original quedó enterrado en el test comentado. | Autor de los tests y de GenomicsForm | test/TestMarketplace.js:656-707 (prototipo comentado, anidado en 689-705); versión en producción en GenomicsForm.js:247-265 | ¿La técnica pubkey-from-signature se consideró un compromiso aceptable de privacidad? (cualquiera puede reconstruir la pubkey de cualquier TX) |
| 4.8 | ~2019 | **Logs de depuración** comentados en Buyer (withdrawalPeriod/checkpoint/time) y consola de config de webpack comentada. | Autores de Buyer y config-overrides.js | Buyer.js:70-72; client/config-overrides.js:56-57 | — (sin pregunta; restos rutinarios) |
| 4.9 | ~2019 | **Botón/UI no conectados**: en Marketplace los handlers `genomicsFormHandler`/`dicomFormHandler` existen pero ningún onClick los invoca; en Buyer el estado `dataFile` y el modal `invalid` quedaron sin cablear. | Autores de Marketplace y Buyer | Marketplace.js:12-20 (handlers muertos); Buyer.js:29 (dataFile), Buyer.js:32, 175 (invalid), Buyer.js:418 (enlace); flujo-aplicacion.md 5.4, 8.3, 8.8 | ¿Estos caminos (descarga por enlace, rechazo de contraseña) se abandonaron o están pendientes de cablear? (el rechazo afecta al riesgo R1 del registro de riesgos) |

## 5. Metahallazgos sobre la propia memoria

| # | Fecha aprox. | Qué se observa | Quién | Dónde | Pregunta al negocio |
|---|--------------|----------------|-------|-------|---------------------|
| 5.1 | siempre vigente | **Ningún comentario del proyecto atribuye decisiones a personas concretas** ni lleva fechas: la memoria histórica del sistema depende enteramente de conversaciones orales y de esta reconstrucción. | — | Todo el proyecto (búsqueda de autoría/fechas en comentarios: resultado vacío) | ¿Quién fue el equipo original y hay alguien que pueda ratificar la cronología de la sección 1? |
| 5.2 | 2026-11-16 | El repositorio empieza su historia con un único "Project snapshot" (bbc383e4) que engloba todo el código sin historial previo: no hay commits de desarrollo que permitan fechar las decisiones internas. | — | git log (primer commit bbc383e4, 2026-11-16) | ¿Existe un repositorio anterior con el historial real de desarrollo? ¿Se puede recuperar? |
| 5.3 | ~2019 | El código está comentado en inglés y la UI en inglés, mientras la constitución de esta fase exige español para todo contenido nuevo (Principio V): dos idiomas conviven por diseño (los comentarios originales se conservan tal cual). | Equipo de gobernanza actual | constitución, Principio V (.specify/memory/constitution.md:60-65); comentarios en inglés en todo client/src | ¿La documentación de negocio futura se redactará en español aunque el producto siga en inglés? |

## 6. Cronología condensada (lectura rápida)

1. **~2018-dic → ~2019** (SUPOSIÓN por referencias internas): época de
   aprendizaje — artículos de streams de diciembre de 2018 en
   duplexExample.js:51, 106; experimentos con workers (4.1, 4.2).
2. **~2019, era "store owner"**: contrato con API de tienda
   (TestMarketplace.sol:20-24; TestMarketplace.js:58-82), registros
   duplicados permitidos, `registerDataset` sin precio, `passwordUpload`
   booleano, custodia de 10 segundos (1.1, 1.2, 1.3, 1.4, 1.5).
3. **~2019, renombre y endurecimiento**: "Data Owner", precio por dataset,
   IV+clave on-chain, anti-duplicados (1.1-1.5); prototipo de pubkey desde
   la firma pasa a producción en GenomicsForm (4.7).
4. **~2019, decisiones de política pública**: Tutorial con plazos de 4
   días, arbitraje y baneos prometidos que no llegan al contrato (1.6,
   1.7, 1.8); seed al vendedor (1.9); plan ERC721 mencionado (1.10).
5. **~2019, abandono de vías**: Bootstrap sin importar (1.12), workers sin
   conectar (4.1), IndexDB huérfano (4.4), getters y caminos de UI sin
   terminar (4.6, 4.9); IPFS movido a localhost (1.11); Rinkeby preparada y
   desactivada (1.13).
6. **2026-11-16**: snapshot único del repositorio (bbc383e4), sin historial
   previo (5.2).
7. **2026-11-17**: ratificación de la constitución v1.0.0 (638ea8d9),
   reconocimiento del sistema (b623b499), flujo de aplicación (172db6f0),
   registro de riesgos (8b89fae0); decisión del negocio de retirar
   el registro de anomalías (2.2).
