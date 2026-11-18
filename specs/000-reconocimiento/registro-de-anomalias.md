# Registro de anomalías consolidado — Reconocimiento (000)

> Fase: documentación y protección (constitución v1.0.0,
> `.specify/memory/constitution.md`). Fecha: 2026-11-17. Este fichero
> consolida TODOS los hallazgos del reconocimiento sin dejar huérfanas.
> Nada se corrige (Principio III).

## 0. Fuentes correlacionadas y su estado

| Fuente | Estado | Cobertura |
|---|---|---|
| `reglas-de-negocio.md` (RN-01 a RN-51) | Leída íntegra | DUDOSAS/ACCIDENTALES y reglas protegidas: mapeadas en A-01 a A-34 |
| `contradiccion-01..14-*.md` | Leídas íntegras | Mapeadas en A-02, A-11, A-16, A-18 a A-28 |
| `registro-riesgos.md` (R1 a R23) | Leído íntegro | Mapeadas en A-01 a A-21, A-29, A-33, A-34 |
| `memoria-historica.md` (secciones 1-5) | Leída íntegra | Discrepancias y "no tocar": A-07, A-14, A-15, A-21, A-23, A-24, A-29 a A-40 |
| `entrevista-negocio.md` | **EXISTE desde 2026-11-18** (acta de la entrevista del 2026-11-18; conduce la actualización de este registro del mismo día) | Cerró 19 cuestiones, dejó 5 abiertas y descartó la arqueología de datos (ver «Actualización» de cada entrada y la sección «Estado tras la entrevista») |
| Arqueología de datos (consultas a Firebase/cadena) | **NO EJECUTADA** | No hay testigo DATOS en ninguna entrada |

Consecuencia de regla innegociable: solo se dispone del testigo CÓDIGO
(más los dos testimonios de sesión del 2026-11-17 ya documentados en
memoria-historica 2.2 y la constitución ratificada). **Ninguna anomalía
puede clasificarse INTENCIONAL salvo las que reúnan CÓDIGO + NEGOCIO**;
todas las candidatas a INTENCIONAL quedan PENDIENTES con su pregunta.

Leyenda de testigos: **CÓDIGO** (fichero:líneas), **DATOS** (consulta y
resultado; no disponible en todo el registro), **NEGOCIO** (quién y cuándo).

---

## A-01 — El comprador con contraseña inválida pierde el dinero: no puede rechazarla ni recuperar

- Descripción: la defensa del comprador ante una entrega inválida es
  inalcanzable (modal ligado a un flag que nunca se activa) y la
  recuperación exige que no se haya enviado contraseña, así que el
  vendedor cobra a los 5 minutos con entrega basura.
- Testigos: CÓDIGO — Buyer.js:32, 175, 362-365 (modal `invalid` muerto);
  Marketplace.sol:310 (recovery exige `passwordSent == false`);
  Marketplace.sol:288-292 (retiro del vendedor por mero plazo);
  contradiccion-01/flujo-aplicacion 5.2-5.3. DATOS: no disponible.
  NEGOCIO: no disponible.
- Clasificación: **BUG A SECAS** (la inaccesibilidad del rechazo es
  defecto inequívoco; la semántica de "enviar = cobrar" es DUDOSA y queda
  subsumida en A-33).
- Depende de: todo comprador real; el texto del Tutorial ya emitido
  (Tutorial.js:157-166) promete el flujo de rechazo que este bug anula.
- Tratamiento: corregir en fase de modernización (cablear el rechazo o
  rediseñar custodia), con precaución: es dinero en custodia — cualquier
  cambio de reglas de liberación afecta a deals abiertos; NO retroactivo
  para deals ya cerrados.
- Decisión pendiente: ¿quién decide la política de disputas (rechazo,
  arbitraje)? Responsable: negocio.
- **Actualización 2026-11-18** (acta entrevista-negocio.md, P2/P2a/P2b,
  testigo NEGOCIO: RG): decidido — política de disputas = sistema de
  validación del buen actor, automático primero y humano en apelación, con
  el dinero **congelado hasta el veredicto** (nadie cobra aunque venza el
  plazo). El sistema de validación nunca llegó a implementarse (testimonio
  del negocio; coincide con la promesa de Tutorial.js:211-213). La
  inaccesibilidad del rechazo sigue BUG A SECAS; la decisión de política
  queda CERRADA.

## A-02 — La compra por DICOM no registra la clave pública: deals sin entrega posible

- Descripción: los dos caminos de compra hacen lo mismo con código
  distinto; solo GENOMICS registra la clave pública ECIES del comprador,
  sin la cual el vendedor no puede entregar contraseña.
- Testigos: CÓDIGO — GenomicsForm.js:232-267 vs DicomForm.js:228-235;
  MyDeals.js:129, 149-151; Marketplace.sol:391-400, 638-643;
  contradiccion-01. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **BUG A SECAS** (divergencia de caminos equivalentes).
- Depende de: compradores del formulario DICOM; el vendedor (MyDeals).
- Tratamiento: corregir en modernización (portar el registro a DicomForm o
  unificar); no retroactivo: deals DICOM ya abiertos solo tienen salida por
  recuperación (A-01).
- Decisión pendiente: ¿DICOM es una vía de negocio viva o en desuso?
  Responsable: negocio.
- **Actualización 2026-11-18** (acta, P4, NEGOCIO: RC): DICOM es **vía
  comercial viva** — hay que arreglar el registro de clave pública. CERRADA
  con prioridad elevada; los deals DICOM ya creados siguen sin salida más
  que la recuperación.

## A-03 — Un dataset retirado sigue comprable «gratis» y sin entrega

- Descripción: la baja borra el struct (precio→0) y la compra no verifica
  vigencia: el comprador paga según el índice, recupera todo y queda
  registrado como comprador de algo que nadie puede entregar.
- Testigos: CÓDIGO — Marketplace.sol:385 (delete) y 236-243 (compra sin
  check de vigencia + refund); Forms.js:185 (el índice nunca se depura);
  RN-12. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **BUG A SECAS**.
- Depende de: compradores que encuentren datasets retirados en el índice;
  historial on-chain (deals fantasma permanentes).
- Tratamiento: corregir en modernización (check de vigencia en
  `purchaseDataset` y limpieza del índice); los deals fantasma ya creados
  requieren limpieza retroactiva manual (decisión de negocio).
- Decisión pendiente: ¿se purgan los deals fantasma existentes?
  Responsable: negocio.
- **Actualización 2026-11-18** (acta, P6 y P25, NEGOCIO: RG/RI): regla de
  negocio nueva confirmada — *un dataset retirado no debe estar disponible
  en el catálogo* (hoy el índice nunca se depura, Forms.js:185). La purga
  retroactiva queda DESCARTADA: «todos los datos se han perdido y no tenían
  valor» (P25, RI); no hay deals fantasma que cuantificar ni purgar.

## A-04 — El pago se decide con el índice Firebase, que no está autenticado, y a un owner sin verificar propiedad

- Descripción: el comprador envía value, id y owner tal cual los devuelve
  el índice; el contrato solo exige `msg.value >= price` del owner
  indicado, sin comprobar que sea el propietario del dataset: un índice
  manipulado o desincronizado redirige el pago o lo congela.
- Testigos: CÓDIGO — GenomicsForm.js:232-235, DicomForm.js:232;
  Marketplace.sol:232-273 (sin check de propiedad), 284-286
  (`onlyDataOwner` al retirar); axios-orders.js:3-5; RN-15, RN-41.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (riesgo de integridad por dependencia de
  confianza no verificada).
- Depende de: Firebase (servicio externo), compradores y vendedores.
- Tratamiento: documentar sin especificar en esta fase; en modernización,
  verificación de propiedad on-chain antes de pagar.
- Decisión pendiente: ¿el índice Firebase es propiedad del negocio y debe
  seguir siendo fuente de pago? (mapa-sistema 5.3). Responsable: negocio.

## A-05 — Credenciales de despliegue versionadas en el repositorio

- Descripción: `secret.js` (mnemónico de cartera) está en git y el ID de
  proyecto de Infura está publicado en `truffle.js`.
- Testigos: CÓDIGO — truffle.js:1 y 23; secret.js en raíz (contenido no
  leído por política); R3. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (riesgo).
- Depende de: cualquier poseedor del repositorio; carteras de despliegue.
- Tratamiento: corregir en modernización (rotación de credenciales +
  retirada del versionado); la rotación no es retroactiva: el material ya
  publicado debe considerarse comprometido.
- Decisión pendiente: ¿rotar credenciales ya? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P3, NEGOCIO: RS): APLAZADA — «cuando
  el sistema vaya a producción, se pensará cómo gestionarlo». Información
  nueva: el negocio no considera el sistema en producción (primera
  evidencia del estado real de despliegue). La exposición del material
  versionado persiste mientras tanto (R3 sigue vivo).

## A-06 — La publicación toca dos sistemas sin atomicidad: contrato e índice pueden quedar a medias

- Descripción: `registerDataset` y el POST a Firebase no comparten
  transacción ni manejo de fallo: dataset registrado e invisible, o
  indexado e inexistente.
- Testigos: CÓDIGO — Forms.js:182-191 (sin catch ni verificación);
  Marketplace.sol:174-188; R5. DATOS: no disponible. NEGOCIO: no
  disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: vendedores (publicación), compradores (búsqueda).
- Tratamiento: corregir en modernización (reconciliación o outbox);
  sanitizar los ítems a medias ya existentes (DATOS pendiente de arqueología).
- Decisión pendiente: ¿arqueología de datos del índice vs cadena para
  cuantificar ítems a medias? Responsable: negocio/aporta datos.
- **Actualización 2026-11-18** (acta, P25, NEGOCIO: RI): DESCARTADA —
  «todos los datos se han perdido y no tenían valor»; no hay ítems a medias
  que cuantificar ni sanitizar. La corrección estructural (atomicidad
  contrato/índice) sigue en modernización.

## A-07 — El Tutorial promete garantías que el contrato no implementa (plazos de 4/5 días, reenvío tras rechazo, arbitraje, baneos, descentralización total)

- Descripción: la documentación pública emitida a usuarios describe una
  política (4 días, rechazo con reenvío, árbitro, baneos por 3 rechazos,
  red p2p pura) que el contrato no contiene; además la propia UI de compra
  dice «5 days» frente a los 5 minutos del contrato.
- Testigos: CÓDIGO — Tutorial.js:86, 148, 163-166, 174, 180, 194, 211-213,
  227-230; Home.js:42-44; GenomicsForm.js:244-245; Marketplace.sol:35,
  194, 306-311; ausencia de funciones de ban/arbitraje en
  contracts/Marketplace.sol (1-646); R23, R16; memoria-historica 1.6-1.8.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **BUG HISTÓRICO CON DEPENDIENTES** — dependiente principal:
  el documento Tutorial YA EMITIDO a usuarios.
- Depende de: expectativas de usuarios y reguladores; el propio flujo de
  soporte que se apoyaría en el Tutorial.
- Tratamiento: corregir en modernización (alinear documento y contrato,
  previa decisión de cuál de las dos políticas es la de negocio); el
  documento publicado no es retroactivamente corregible en manos de
  terceros.
- Decisión pendiente: ¿cuál es la política real de plazos y disputas:
  5 minutos, 4 días o 5 días? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P1/P1b y P2, NEGOCIO: RG): RESUELTA —
  plazo de negocio = **5 días**, aplicado a los DOS relojes (recuperación
  del comprador desde el pago; cobro del vendedor desde la entrega).
  El contrato (5 minutos, Marketplace.sol:35) y el Tutorial (4 días,
  Tutorial.js:86) quedan como desviaciones documentales; la cifra de la UI
  («up to 5 days», GenomicsForm.js:244-245) era la correcta. Política de
  disputas: validación automática + apelación humana + dinero congelado
  hasta veredicto (ver A-01).

## A-08 — El precio no tiene ninguna validación: 0 es un producto gratuito y NaN revierte en silencio

- Descripción: registro y cambio de precio aceptan cualquier entero
  (incluido 0); precio vacío produce NaN y revierte la publicación sin
  mensaje.
- Testigos: CÓDIGO — Marketplace.sol:174-188, 275-282 (sin require de
  precio); Forms.js:180, MyDatasets.js:74; RN-09; R8. DATOS: no
  disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: vendedores (publicaciones), compradores (pagos).
- Tratamiento: corregir en modernización (validación de precio mínimo);
  no retroactivo para precios ya fijados.
- Decisión pendiente: ¿existe precio mínimo de negocio? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P9, NEGOCIO: RC): NO existe precio
  mínimo — el precio 0 es funcionalidad legítima (datasets gratuitos de
  promoción). El precio 0 deja de ser hallazgo; solo el precio vacío→NaN
  con fallo silencioso (Forms.js:180) queda como defecto. CERRADA.

## A-09 — Dos vendedores pueden registrar el mismo CID; el precio global del id lo sobrescribe el último

- Descripción: la unicidad es por pareja (vendedor, id); el precio es
  global por id y cada registro lo pisa.
- Testigos: CÓDIGO — Marketplace.sol:178 (guard por-propietario) y 184-185
  (sobrescritura); RN-08; R15. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: catálogo del índice (colisiones de id visibles en búsqueda).
- Tratamiento: corregir en modernización (unicidad global); colisiones ya
  creadas requieren decisión manual.
- Decisión pendiente: ¿puede el mismo dataset venderse por varios
  propietarios? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P8 y P16, NEGOCIO: RC/RT): NO —
  unicidad GLOBAL: solo puede venderlo quien lo registró primero (regla de
  negocio decidida; el código actual solo la garantiza por vendedor,
  Marketplace.sol:178). Matiz: la seed, cumpliendo su función declarada
  (variar el identificador, P16), mitiga de facto el choque de
  identificadores entre vendedores con el mismo fichero de origen. CERRADA.

## A-10 — El reparto 95/5 trunca por separado y deja wei sin atribuir

- Descripción: `balance*95/100` y `balance*5/100` con división entera
  suman menos que el balance para importes no múltiplos de 20 wei; el
  resto queda bloqueado en el contrato (el propietario solo retira `fees`).
- Testigos: CÓDIGO — Marketplace.sol:294-297 y 223-230; dato real
  calculado (99 wei → 94+4=98); RN-30. DATOS: no disponible (pendiente:
  consultar balances reales de deals cerrados). NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: el propietario del contrato (pérdida ínfima acumulable).
- Tratamiento: documentar sin especificar; en modernización, recalcular el
  reparto con un solo truncado.
- Decisión pendiente: — (requiere DATOS, no decisión).
- **Actualización 2026-11-18** (acta, P25, NEGOCIO: RI): sin objeto — los
  datos de operativa pasada se han perdido y no tenían valor; no hay
  balances reales que consultar. La corrección del reparto sigue en
  modernización.

## A-11 — La concesión de vendedores opera por índice desfasado, admite duplicadas zombis y desincroniza UI y contrato

- Descripción: el admin aprueba/rechaza «la posición N» calculada en su
  navegador; el contrato confía en N; la UI muta su copia
  incondicionalmente; una cuenta puede apilarse en la lista y las
  duplicadas quedan zombis.
- Testigos: CÓDIGO — Admin.js:13, 56-65, 87-99, 102-112 (índice local +
  mutación incondicional, código duplicado); Marketplace.sol:129-141,
  153-159, 161-170 (borrado por índice duplicado; sin guard de duplicados
  en la lista); contradiccion-07; RN-04, RN-06; R9. DATOS: no disponible.
  NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** — la desincronización y las zombis son
  ACCIDENTAL claras; el diseño «aprobación por posición» es DUDOSA.
  Pregunta que la desbloquea: ¿la aprobación por posición es un diseño
  aceptado o un descuido? ¿Debe la aprobación ir por dirección?
  Responsable: negocio.
- **Actualización 2026-11-18** (acta, P13, NEGOCIO: RG): RESUELTA — la
  aprobación y el rechazo deben operar **por identidad** (dirección
  concreta). El diseño actual «por posición» queda clasificado como
  **descuido** (no diseño aceptado): la parte DUDOSA se cierra como
  ACCIDENTAL; desincronización y zombis siguen ACCIDENTAL. Corrección en
  modernización.

## A-12 — El proyecto no tiene ninguna prueba automatizada viva

- Descripción: los tests de contratos están íntegramente comentados y
  desactualizados (firma antigua, periodo de 10 s) y el test de humo del
  cliente renderiza App fuera del router.
- Testigos: CÓDIGO — test/TestMarketplace.js:8-707 (comentado, con API
  `storeOwner` antigua en 58-82 y «10 seconds» en 337, 419, 492, 569,
  644); test/TestMarketplace.sol:20-24 (API muerta); App.test.js:5-8;
  R4; memoria-historica 1.4. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda).
- Depende de: cualquier evolución futura del contrato o del cliente.
- Tratamiento: corregir en modernización (tests de caracterización primero,
  como marca la constitución); no retroactivo.
- Decisión pendiente: —.

## A-13 — Deuda de dependencias: avisos públicos conocidos, stack sin soporte, dependencias muertas, una transitiva importada directamente y node_modules en git

- Descripción: axios 0.18 (avisos conocidos en <0.21.1, pendiente de
  verificación con audit), web3 beta, node-sass/React/CRA EOL; jquery y
  cuatro paquetes raíz sin uso; `@cubbit/web-file-stream` importada sin
  estar declarada; node_modules y builds versionados.
- Testigos: CÓDIGO — client/package.json:6-25, 47-51; package.json:13-26
  (raíz); Forms.js:15; client/package-lock.json:919-923; R7, R14, R19,
  R20, R21; mapa-sistema 5.1.8, 5.2.17-18. DATOS: no disponible
  (pendiente: `npm audit`). NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda).
- Depende de: cualquier build/instalación futura; superficie de ataque del
  navegador del usuario.
- Tratamiento: corregir en modernización (upgrade controlado con tests de
  caracterización previos); no retroactivo.
- Decisión pendiente: —.

## A-14 — La clave simétrica se muestra en claro y se gestiona a mano entre pantallas

- Descripción: tras publicar, key e IV se muestran en texto plano para
  copiarlas y se reintroducen a mano en MyDeals; un error activa A-01 y
  una pérdida deja el dataset irrecuperable.
- Testigos: CÓDIGO — Forms.js:578-589 (render deliberado en claro);
  MyDeals.js:198-214 (reintroducción); R13. DATOS: no disponible.
  NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (candidata INTENCIONAL: el render es
  deliberado, pero solo hay un testigo). Pregunta: ¿el flujo manual
  copiar/reintroducir es una decisión de diseño aceptada o un pendiente de
  automatizar? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P14, NEGOCIO: RG): flujo manual
  aceptado de momento; **sustituirlo es prioridad en modernización**.
  Requisito nuevo de negocio: **las claves solo deben ser accesibles por el
  vendedor, para nadie más** — el render en claro (Forms.js:578-589)
  contradice ese requisito. Clasificación cerrada: deuda confirmada con
  requisito de seguridad añadido (refuerza R13).

## A-15 — La «seed» que el Tutorial documenta como paso obligatorio no interviene en el cifrado

- Descripción: se pide una seed alfanumérica al vendedor y la clave AES se
  genera aleatoria: la seed no se usa en ningún punto posterior.
- Testigos: CÓDIGO — Tutorial.js:111; Forms.js:274-283 (recogida),
  355-359 (clave e IV aleatorias, sin uso de seed); RN-44;
  memoria-historica 1.9. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (DUDOSA). Pregunta: ¿para qué se diseñó la
  seed (¿debía derivar la clave?) y debe mantenerse en la UI?
  Responsable: negocio.
- **Actualización 2026-11-18** (acta, P16/P16b, NEGOCIO: RT, marcado como
  creencia): la seed se diseñó **para variar el hash final y evitar
  identificadores repetidos del mismo dataset** (no para derivar la clave).
  Se MANTIENE en la UI pero cumpliendo esa función (tarea de modernización:
  hoy no interviene en nada; la variación ocurre de facto por la clave
  aleatoria, Forms.js:355). Discrepancia intención/implementación
  documentada. CERRADA.

## A-16 — Los plazos que ve el usuario están congelados y pueden salir negativos

- Descripción: el tiempo se lee una vez al montar y la cuenta atrás no
  avanza; con custodia inexistente el cálculo produce minutos negativos
  enormes; la fórmula existe duplicada (con variante en horas comentada).
- Testigos: CÓDIGO — Buyer.js:54-55, 390; MyDeals.js:44, 63-65, 219-220;
  Marketplace.sol:548-560 (checkpoint 0 sin tratar); dato real calculado
  (−16666661 mins); contradiccion-06; RN-45, RN-46; R10. DATOS: no
  disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: decisiones de compradores y vendedores basadas en el plazo
  mostrado.
- Tratamiento: corregir en modernización (temporizador vivo y manejo de
  vacío); cosmético, sin retroactividad.
- Decisión pendiente: —.

## A-17 — La subida de ficheros no tiene temporizadores: un fallo de IPFS cuelga la UI sin diagnóstico

- Descripción: si la suba de una parte falla (solo console.log) el flujo
  espera indefinidamente los flags `upload`/`finished`.
- Testigos: CÓDIGO — Forms.js:442-447, 470-479, 484-500; R11.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: vendedores (inventario nuevo) y soporte.
- Tratamiento: corregir en modernización (timeouts y estados de error);
  sin retroactividad.
- Decisión pendiente: —.

## A-18 — La conexión de cartera no gestiona sus fallos y no verifica la red

- Descripción: el rechazo del permiso de MetaMask deja la app muda
  (promesa rechazada sin captura) y ninguna rama valida red/chainId; tres
  ramas con semánticas distintas para el mismo paso.
- Testigos: CÓDIGO — getWeb3.js:8-33 (tres ramas; rechazo 15-17 sin
  captura en App.js:32-59); App.js:40-43; contradiccion-13.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **BUG A SECAS** (fallo de usuario no gestionado).
- Depende de: todos los usuarios (primer contacto con la app).
- Tratamiento: corregir en modernización (mensajes de error y validación
  de red); sin retroactividad.
- Decisión pendiente: —.

## A-19 — El botón «Download» de los deals cerrados apunta a un href vacío

- Descripción: el enlace usa `state.dataFile`, que nunca se asigna; la
  descarga real es el streaming Enigma (otra implementación del mismo
  concepto).
- Testigos: CÓDIGO — Buyer.js:29, 418 vs 171-317; contradiccion-10.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **BUG A SECAS** (promesa de UI muerta).
- Depende de: compradores de deals cerrados.
- Tratamiento: corregir en modernización (retirar el enlace o cablearlo);
  sin retroactividad.
- Decisión pendiente: —.

## A-20 — El buscador tiene dos semánticas enfrentadas: unión (parcial) vs intersección (total)

- Descripción: la misma entrada de búsqueda devuelve conjuntos distintos
  según la casilla; coinciden con 0-1 criterios y divergen con 2+.
- Testigos: CÓDIGO — GenomicsForm.js:98-127 (unión) vs 131-165
  (intersección); idéntico en DicomForm.js:94-123 vs 127-161; ejemplo
  calculado (R1/R2/R3: parcial → 3 resultados, total → 0);
  contradiccion-02; RN-40. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (candidata INTENCIONAL: la casilla conmuta
  deliberadamente, pero falta el segundo testigo). Pregunta: ¿es correcta
  la semántica de negocio de cada modo y sus nombres para el usuario?
  Responsable: negocio.
- **Actualización 2026-11-18** (acta, P15, NEGOCIO: RG): confirmados los
  DOS modos con sus nombres actuales («partial» = al menos un criterio;
  «total» = todos). Reclasificada: **INTENCIONAL** (dos testigos: CÓDIGO +
  NEGOCIO). La divergencia unión/intersección es diseño aceptado. CERRADA.

## A-21 — server.js está roto por dependencia ausente y su rol productivo nunca se definió

- Descripción: requiere `ipfs-cluster-api` no declarada (no arranca) y su
  único endpoint ancla un CID fijo y responde un json de prueba; la web no
  lo llama.
- Testigos: CÓDIGO — server.js:5-6, 18-29; package.json:13-26 (ausente);
  flujo-aplicacion sección 0 (sin referencias a 3001/api en client/src);
  contradiccion-09; R12; memoria-historica 2.3. DATOS: no disponible.
  NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (el fallo de build es ACCIDENTAL; el rol
  previsto es DUDOSA). Pregunta: ¿cuál era el rol productivo previsto de
  server.js y se conserva? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P17, NEGOCIO: RT, marcado como
  creencia): server.js fue **banco de pruebas**, sin papel productivo;
  «creo que montaba (fuera de este repositorio) un clúster IPFS para hacer
  las pruebas». CERRADA: el fallo de build sigue ACCIDENTAL; el rol
  previsto queda documentado como pruebas (ver memoria-historica 7).

## A-22 — Los módulos de búsqueda y de publicación están duplicados (fork completo y ramas internas)

- Descripción: DicomForm es un fork de GenomicsForm con una omisión
  (clave pública); dentro de Forms cada handler está escrito dos veces por
  rama genomics/dicom.
- Testigos: CÓDIGO — contradiccion-03 y contradiccion-14 (comparaciones
  paso a paso); GenomicsForm.js/DicomForm.js; Forms.js:162-176, 219-244,
  246-272, 546-562. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda).
- Depende de: futuras correcciones (cada cambio debe aplicarse ×2; la
  omisión de A-02 demuestra que ya falló una vez).
- Tratamiento: corregir en modernización (unificación tras decidir A-02);
  sin retroactividad.
- Decisión pendiente: —.

## A-23 — La conversión ETH↔wei multiplica en float antes de nada y puede desviarse del decimal escrito

- Descripción: `10^18 * precio` en coma flotante produce desviaciones de
  hasta ~10³ wei (autosconsistentes entre vendedor y comprador); hay tres
  implementaciones del mismo concepto.
- Testigos: CÓDIGO — Forms.js:180, MyDatasets.js:74, GenomicsForm.js:233,
  DicomForm.js:232; divisiones de muestra (MyDatasets.js:43, MyDeals.js:74,
  Buyer.js:82, 91); datos reales calculados («0.07» → 70000000000000010
  wei); contradiccion-04; RN-23. DATOS: no disponible. NEGOCIO: no
  disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: precios publicados y pagos (todos).
- Tratamiento: corregir en modernización (conversión exacta por string);
  los precios ya fijados requieren verificación retroactiva con DATOS.
- Decisión pendiente: —.
- **Actualización 2026-11-18** (acta, P25, NEGOCIO: RI): la verificación
  retroactiva de precios queda SIN OBJETO — datos perdidos y sin valor.
  La corrección de la conversión sigue en modernización.

## A-24 — Un comentario cita un contrato MyERC721 que no existe en el proyecto

- Descripción: el formato del precio se justifica «so that it is
  acceptable to MyERC721 contract»: rastro de un plan de tokenización sin
  rastro en el repo.
- Testigos: CÓDIGO — Forms.js:180; ausencia de MyERC721 en contracts/ y
  client/src (búsqueda sin resultados); memoria-historica 1.10.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (DUDOSA). Pregunta: ¿existió o está
  planificado MyERC721? ¿La tokenización sigue en la hoja de ruta?
  Responsable: negocio.
- **Actualización 2026-11-18** (acta, P19, NEGOCIO: DIR): SIN RESPUESTA
  CONCLUYENTE — no está decidido si existió o sigue en hoja de ruta. Sigue
  ABIERTA; pasa a la agenda de la próxima ronda (acta, sección «Pendiente
  para próxima ronda»).

## A-25 — El roundtrip de identificador bytes32↔base58 está copiado en diez puntos

- Descripción: la misma transformación (prefijo «1220», slice(2), bs58)
  replicada sin utilidad común en cinco contenedores.
- Testigos: CÓDIGO — MyDatasets.js:34-38, 73, 82; MyDeals.js:49-53, 144,
  155; Buyer.js:64-68, 111, 118, 125, 150; Forms.js:335; contradiccion-05.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda).
- Depende de: cualquier cambio de formato futuro (riesgo de divergencia
  entre pantallas).
- Tratamiento: corregir en modernización (utilidad única).
- Decisión pendiente: —.

## A-26 — El Marketplace monta los formularios dos veces cada uno y conserva handlers muertos

- Descripción: render condicional sin cablear + acordeón estático: 4
  instancias vivas y 4 descargas del índice por visita.
- Testigos: CÓDIGO — Marketplace.js:7-20, 24-39, 48-83; contradiccion-11;
  memoria-historica 4.9. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda).
- Depende de: rendimiento y claridad de la página de compra.
- Tratamiento: corregir en modernización; sin retroactividad.
- Decisión pendiente: —.

## A-27 — El modal de clave privada está duplicado y sus dos copias obedecen a condiciones distintas

- Descripción: misma UI y handlers en deals activos (protegido por
  pwdStatus) y cerrados (true hardcodeado).
- Testigos: CÓDIGO — Buyer.js:371-383 vs 423-441, 132-137; contradiccion-12.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda).
- Depende de: flujo de descifrado del comprador.
- Tratamiento: corregir en modernización (componente único).
- Decisión pendiente: —.

## A-28 — La lectura del índice existe tres veces y una de ellas es un componente huérfano roto

- Descripción: IndexDB encapsula la carga del catálogo pero nadie lo usa y
  su render es un objeto; GenomicsForm y DicomForm la repiten inline (dos
  GET por visita al montar las 4 instancias).
- Testigos: CÓDIGO — IndexDB.js:4-30 (render roto en 26); GenomicsForm.js:12
  (import comentado), 78-91; DicomForm.js:74-87; contradiccion-08;
  memoria-historica 4.4. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (código muerto).
- Depende de: consumo de red del Marketplace.
- Tratamiento: documentar sin especificar; decisión de borrado en
  modernización.
- Decisión pendiente: —.

## A-29 — Nueve trabajos abandonados quedan enterrados en el árbol (workers, streams de tutorial, vías alternativas de IPFS, getter comentado, logs)

- Descripción: infraestructura de workers viva sin cliente (worker-loader +
  MySomething.worker), cinco ejemplos de tutoriales en duplexExample, dos
  vías de subida alternativas comentadas, getTransactionInfo comentado y
  logs de depuración muertos.
- Testigos: CÓDIGO — MySomething.worker.js:1-12; client/config-overrides.js:4-54;
  duplexExample.js:1-196; Forms.js:505-536; Marketplace.sol:613-622;
  Buyer.js:70-72; memoria-historica 4.1-4.8. DATOS: no disponible.
  NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda).
- Depende de: nadie identificado (peso y confusión para auditoría).
- Tratamiento: documentar sin especificar; borrado en modernización.
- Decisión pendiente: —.

## A-30 — Bootstrap se abandonó sin retirar su uso: los acordeones dependen de un JS que no está

- Descripción: los imports de bootstrap.css/js/Popper están comentados
  mientras todo el JSX usa clases y `data-toggle` de Bootstrap.
- Testigos: CÓDIGO — index.js:7-9 (imports comentados); uso vivo de
  clases/toggles en Marketplace.js:48-83, Tutorial.js:44, Forms.js:663-695;
  memoria-historica 1.12. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (deuda de UI).
- Depende de: navegación de las páginas con acordeón (Tutorial,
  Marketplace, Forms).
- Tratamiento: corregir en modernización (importar o migrar componentes);
  sin retroactividad.
- Decisión pendiente: —.

## A-31 — El test Solidity está congelado sobre una API que ya no existe

- Descripción: TestMarketplace.sol llama a `requestStoreOwner` y compañía,
  funciones que el contrato actual no tiene; compilarlo rompería.
- Testigos: CÓDIGO — test/TestMarketplace.sol:20-24 vs
  contracts/Marketplace.sol:153-170; memoria-historica 1.1, 2.4.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **ACCIDENTAL** (resto histórico).
- Depende de: nadie identificado (no se ejecuta).
- Tratamiento: documentar sin especificar; decisión de retirada en
  modernización.
- Decisión pendiente: ¿conservar como referencia histórica? Responsable:
  negocio.
- **Actualización 2026-11-18** (acta, P23, NEGOCIO: RT): conservar tal
  cual como referencia histórica (comentados, sin ejecutar). CERRADA.

## A-32 — [Anomalía positiva] Reglas protegidas de permisos y catálogo

- Descripción: conjunto de reglas con señales de deliberación que deben
  preservarse en modernización: desplegador = admin+propietario; asimetría
  alta/baja de admins; sin admins duplicados; baja de vendedor con
  inventario vacío; solo vendedores publican; precio congelado en la
  compra; baja solo sin historial; swap-delete sistemático.
- Testigos: CÓDIGO — Marketplace.sol:39-42, 111-118, 120-127, 143-151,
  174-188, 236-247, 275-282, 361; testigos históricos
  test/TestMarketplace.js:8-56, 202-270; RN-01, RN-02, RN-03, RN-05,
  RN-07, RN-10, RN-11, RN-13; reglas de índice y búsqueda deliberadas:
  RN-38 (taxonomías cerradas) y RN-39 (intersección). DATOS: no
  disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (candidatas INTENCIONAL; la regla del
  registro exige dos testigos). Pregunta: ¿confirmáis estas reglas como
  reglas de negocio a preservar tal cual? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P10/P10b, NEGOCIO: RG): CONFIRMADAS
  las siete con dos testigos → reclasificables como **INTENCIONAL**. Matiz
  de la regla 6: formulación del negocio = «retirable solo sin compras en
  curso» (las compras cerradas o recuperadas no bloquean), que coincide
  con el comportamiento del código. CERRADA.

## A-33 — [Anomalía positiva] Reglas protegidas de dinero y custodia

- Descripción: pago >= precio con devolución del sobrante; unicidad de
  compra por trío; custodia = precio; derecho de acceso al pagar;
  reloj de recuperación desde el pago; entrega única (con la excepción
  DUDOSA del reenvío tras rechazo, RN-20); reloj del vendedor desde la
  entrega; comisión 5 % solo en retiro; cierre irreversible; recuperación
  íntegra con deshacer compra; orden transfer-antes-de-estado en el refund
  (R22, observación, no regla).
- Testigos: CÓDIGO — Marketplace.sol:236-273, 190-200, 214-221, 284-304,
  306-354, 223-230; test/TestMarketplace.js:120-200, 272-352, 431-506;
  RN-14, 16-19, 21, 25-27, 29, 31-34, 36. DATOS: no disponible. NEGOCIO:
  no disponible.
- Clasificación: **PENDIENTE** (candidatas INTENCIONAL). Preguntas:
  (1) ¿confirmáis estas reglas tal cual? (2) ¿la entrega debe poder
  reenviarse tras rechazo (RN-20)? (3) ¿el orden transfer/refund es
  aceptable? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P7/P7b/P7c, NEGOCIO: RG):
  (1) CONFIRMADAS las seis reglas tal cual (con aclaración registrada:
  gas ≠ sobrante — el gas va al minero y no es devoluble; el sobrante es
  dinero del precio que vuelve al comprador) → reclasificables como
  **INTENCIONAL** (dos testigos). (2) RN-20 (reenvío tras rechazo) queda
  ABSORBIDA por la política de validación de disputas (P2): el rechazo
  deja de ser el mecanismo; diseño futuro. (3) El orden
  transfer-antes-de-estado (R22) queda como observación técnica, sin
  decisión de negocio. CERRADA.

## A-34 — [Anomalía positiva] Reglas protegidas de identidad, plazos, cliente y emergencia

- Descripción: identidad bytes32↔base58 con prefijo «1220»; receta física
  del dataset (directorio base, chunk 30 MB, nombres por umbrales); frontera
  estricta de plazos (`>`); rol comprador por negación con lectura única;
  pausa total de operativa con lecturas vivas; capacidad de destrucción del
  propietario (con la salvedad de reputación de R16/A-07).
- Testigos: CÓDIGO — Forms.js:301, 313-317, 335-342, 363, 414-440;
  MyDatasets.js:34-38; Marketplace.sol:35, 290, 311, 548-560;
  App.js:44-49; Pausable/Destructible (zeppelin);
  cuandoNotPaused sistemático (Marketplace.sol:111-400); RN-42, 43, 47,
  48, 50, 51. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (candidatas INTENCIONAL). Preguntas:
  (1) ¿confirmáis estas reglas y constantes tal cual? (2) ¿debe
  conservarse la capacidad destroy/destroyAndSend? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P11/P11c y P12, NEGOCIO: RG/RS):
  (1) reglas y constantes CONFIRMADAS (receta física; interruptor de
  emergencia: «siempre tiene que haber un mecanismo de seguridad»;
  conversión de identidad, con deseo de unificarla en un punto;
  refresco de roles deseado — ambos como tareas de modernización), SALVO
  la frontera de plazos: pasa a **inclusiva** («5 días o más»: en el
  segundo exacto del vencimiento ya se puede cobrar/recuperar), en
  contradicción con el `>` estricto actual (Marketplace.sol:290, 311).
  (2) destroy/destroyAndSend: **SE RETIRA** (R17 queda con decisión de
  mitigación). CERRADA.

## A-35 — La red de despliegue objetivo está sin decidir en el código (Rinkeby escrita y comentada)

- Descripción: existe una configuración rinkeby completa comentada y el
  despliegue vivo es development; Rinkeby como testnet ya no existe.
- Testigos: CÓDIGO — truffle.js:21-35 vs 6-13; memoria-historica 1.13.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE**. Pregunta: ¿cuál es la red de destino real
  del negocio (mainnet, otra testnet, L2)? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P20, NEGOCIO: DIR): SIN RESPUESTA
  CONCLUYENTE — «tenemos que investigar» (mainnet vs red de bajo coste vs
  local). Sigue ABIERTA; agenda de la próxima ronda, ligada al camino a
  producción (misma condición que A-05).

## A-36 — El nodo IPFS remoto (209.250.245.197) fue desactivado sin constancia

- Descripción: ipfs.js tiene comentada una IP pública como host y usa
  localhost; no consta si ese nodo fue producción y qué datasets contiene.
- Testigos: CÓDIGO — ipfs.js:5 (host comentado) vs 6-11; memoria-historica
  1.11. DATOS: no disponible (pendiente: ¿responde ese nodo? ¿qué CID
  contiene?). NEGOCIO: no disponible.
- Clasificación: **PENDIENTE**. Pregunta: ¿fue producción? ¿hay datasets
  reales allí? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P18, NEGOCIO: RI): nunca fue
  producción — solo pruebas o nada. CERRADA (queda pendiente de
  verificación con DATOS solo si se quisiera confirmar que no queda nada
  accesible; la P25 indica que los datos se perdieron).

## A-37 — Las advertencias «no tocar» no tienen responsable ni ubicación en la documentación viva

- Descripción: cuatro avisos operativos (copiar api/config al .ipfs del
  nodo; globalObject de workers; «iv = contraseña simétrica»; la letra
  pequeña de la compra) viven solo como comentarios dispersos.
- Testigos: CÓDIGO — ipfs-config/leeme:1; client/config-overrides.js:4,
  53-54; MyDeals.js:133; GenomicsForm.js:242-245; memoria-historica 3.1-3.4.
  DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE** (candidatas INTENCIONAL: son avisos
  deliberados). Pregunta: ¿quién es el responsable operativo de cada
  advertencia (nodo IPFS, workers, soporte)? Responsable: negocio.
- **Actualización 2026-11-18** (acta, P21, NEGOCIO: DIR): SIN RESPUESTA
  CONCLUYENTE — no está decidido quién responde de las advertencias. Sigue
  ABIERTA; agenda de la próxima ronda.

## A-38 — El proyecto carece de autoría, fechas e historial: nace de un snapshot único

- Descripción: ningún comentario firma ni fecha nada; el primer commit es
  un snapshot monolítico («Project snapshot»), así que la cronología
  interna es reconstrucción.
- Testigos: CÓDIGO — git log (bbc383e4, 2026-11-16, único commit de
  código); búsqueda de autoría/fechas en comentarios: vacía;
  memoria-historica 5.1, 5.2. DATOS: no disponible. NEGOCIO: no disponible.
- Clasificación: **PENDIENTE**. Preguntas: ¿quién fue el equipo original?
  ¿Existe un repositorio anterior con el historial real? Responsable:
  negocio.
- **Actualización 2026-11-18** (acta, P22, NEGOCIO: DIR): no existe
  repositorio ni historial anterior — el snapshot (bbc383e4) es todo lo
  que hay; la cronología reconstruida en memoria-historica es la única
  memoria del sistema. La mitad restante (quién fue el equipo original)
  queda SIN RESPUESTA: el proyecto queda formalmente sin autoría
  atribuible. CERRADA parcialmente.

## A-39 — El bilingüismo es deliberado: comentarios históricos en inglés, contenido nuevo en español

- Descripción: el código y la UI están en inglés y la constitución obliga
  a español solo para contenido nuevo, conservando los comentarios
  históricos tal cual.
- Testigos: CÓDIGO — comentarios en inglés en todo client/src y
  contracts/Marketplace.sol; NEGOCIO — constitución v1.0.0 ratificada por
  el negocio el 2026-11-17, Principio V
  (.specify/memory/constitution.md:60-65). DATOS: no disponible.
- Clasificación: **INTENCIONAL** (dos testigos: CÓDIGO + NEGOCIO).
- Depende de: toda la documentación futura y el equipo de modernización.
- Tratamiento: especificar tal cual en las specs formales.
- Decisión pendiente: —.

## A-40 — [Proceso] El negocio retiró el registro de anomalías el 2026-11-17 con compromiso de retomarlo

- Descripción: decisión documental de la sesión: borrar el registro y
  retomarlo «más adelante»; este fichero es esa reanudación.
- Testigos: NEGOCIO — interlocutor de la sesión, 2026-11-17 («lo haremos
  más adelante»); CÓDIGO — git 71331e2d (baja) y memoria-historica 2.2.
  DATOS: no disponible.
- Clasificación: **INTENCIONAL** (dos testigos: NEGOCIO + CÓDIGO).
- Depende de: este mismo registro y el guion de entrevista.
- Tratamiento: especificar tal cual (este documento cumple el compromiso).
- Decisión pendiente: —.

## A-41 — Precedencia accidental de vistas en Profile: una cuenta admin+vendedor solo ve su faceta de vendedor

- Descripción: los tres `if` de Profile asignan la misma variable y el
  último gana; la vista Admin es inalcanzable para una cuenta con ambos
  roles.
- Testigos: CÓDIGO — Profile.js:13-32; App.js:46-49; RN-49;
  flujo-aplicacion sección 3 (caso C). DATOS: no disponible. NEGOCIO: no
  disponible.
- Clasificación: **ACCIDENTAL**.
- Depende de: cuentas con doble rol (posibles por diseño: RN-01 permite
  nombrar vendedor a un admin).
- Tratamiento: corregir en modernización (render de ambas vistas o
  conmutador).
- Decisión pendiente: ¿deben poder coexistir ambos roles visibles?
  Responsable: negocio.
- **Actualización 2026-11-18** (acta, P24/P24a, NEGOCIO: RG): RESUELTA por
  vía indirecta — regla de negocio nueva: **un admin nunca puede ser
  vendedor** («no tiene sentido que sea vendedor»); si una cuenta tiene
  ambos roles, se quita uno. El caso de doble rol desaparece y con él la
  pregunta de visibilidad. Contradice que el código lo permita (el
  contrato acepta nombrar data owner a cualquier cuenta). CERRADA.

---

## Tabla resumen

> **Nota 2026-11-18**: esta tabla refleja el estado ANTES de la entrevista
> del 2026-11-18 (se conserva como foto histórica). Las decisiones
> pendientes que muestra quedaron resueltas, aplazadas o descartadas en la
> entrevista; el estado vigente de cada entrada es el de su línea
> «Actualización 2026-11-18» y del acta `entrevista-negocio.md`.

| ID | Clasificación | Tratamiento | Decisión pendiente |
|----|---------------|-------------|--------------------|
| A-01 | BUG A SECAS | corregir en modernización (custodia/disputas) | política de disputas (negocio) |
| A-02 | BUG A SECAS | corregir en modernización | ¿DICOM vivo o en desuso? (negocio) |
| A-03 | BUG A SECAS | corregir + limpieza retroactiva a decidir | purga de deals fantasma (negocio) |
| A-04 | ACCIDENTAL | documentar; verificar on-chain en modernización | ¿Firebase sigue siendo fuente de pago? (negocio) |
| A-05 | ACCIDENTAL | corregir en modernización | ¿rotar credenciales ya? (negocio) |
| A-06 | ACCIDENTAL | corregir en modernización | arqueología índice↔cadena (negocio/datos) |
| A-07 | BUG HISTÓRICO CON DEPENDIENTES | corregir (alinear doc y contrato) | política real de plazos y disputas (negocio) |
| A-08 | ACCIDENTAL | corregir en modernización | ¿precio mínimo? (negocio) |
| A-09 | ACCIDENTAL | corregir en modernización | ¿venta del mismo CID por varios? (negocio) |
| A-10 | ACCIDENTAL | documentar; recalcular en modernización | — |
| A-11 | PENDIENTE | documentar | ¿aprobación por posición o por dirección? (negocio) |
| A-12 | ACCIDENTAL | tests de caracterización en modernización | — |
| A-13 | ACCIDENTAL | upgrade controlado en modernización | — |
| A-14 | PENDIENTE | documentar | ¿flujo manual de claves aceptado? (negocio) |
| A-15 | PENDIENTE | documentar | ¿para qué era la seed? (negocio) |
| A-16 | ACCIDENTAL | corregir (cosmético) | — |
| A-17 | ACCIDENTAL | corregir en modernización | — |
| A-18 | BUG A SECAS | corregir (mensajes/red) | — |
| A-19 | BUG A SECAS | corregir (retirar o cablear) | — |
| A-20 | PENDIENTE | documentar | ¿semántica y nombres de cada modo? (negocio) |
| A-21 | PENDIENTE | documentar | ¿rol productivo de server.js? (negocio) |
| A-22 | ACCIDENTAL | unificar en modernización | — |
| A-23 | ACCIDENTAL | conversión exacta en modernización | — |
| A-24 | PENDIENTE | documentar | ¿MyERC721 y tokenización? (negocio) |
| A-25 | ACCIDENTAL | utilidad única en modernización | — |
| A-26 | ACCIDENTAL | corregir en modernización | — |
| A-27 | ACCIDENTAL | componente único en modernización | — |
| A-28 | ACCIDENTAL | documentar; borrado en modernización | — |
| A-29 | ACCIDENTAL | documentar; borrado en modernización | — |
| A-30 | ACCIDENTAL | corregir en modernización | — |
| A-31 | ACCIDENTAL | documentar; retirada a decidir | ¿conservar test histórico? (negocio) |
| A-32 | PENDIENTE | especificar tal cual si se confirma | confirmación de reglas (negocio) |
| A-33 | PENDIENTE | especificar tal cual si se confirma | confirmación + RN-20 + orden refund (negocio) |
| A-34 | PENDIENTE | especificar tal cual si se confirma | confirmación + ¿conservar destroy? (negocio) |
| A-35 | PENDIENTE | documentar | ¿red de destino? (negocio) |
| A-36 | PENDIENTE | documentar | ¿nodo 209.250.245.197 fue producción? (negocio) |
| A-37 | PENDIENTE | documentar; asignar responsables | responsables de las advertencias (negocio) |
| A-38 | PENDIENTE | documentar | ¿equipo original y repo previo? (negocio) |
| A-39 | INTENCIONAL | especificar tal cual | — |
| A-40 | INTENCIONAL | especificar tal cual | — |
| A-41 | ACCIDENTAL | corregir en modernización | ¿doble rol visible? (negocio) |

## Lista de clasificaciones PENDIENTES (agenda de la próxima conversación con el negocio)

> **Estado tras la entrevista del 2026-11-18** (acta
> `entrevista-negocio.md`): de las 13 cuestiones que integraban esta
> lista, quedaron CERRADAS 9 (A-11, A-14, A-15, A-20, A-21, A-32, A-33,
> A-34, A-36 y la mitad técnica de A-38), DESCARTADAS por falta de datos
> las arqueologías (A-03/06/10/23, acta P25) y APLAZADAS A-05 (acta P3).
> La lista NO queda vacía: las entradas vigentes son las que siguen.

**Entradas pendientes vigentes (agenda de la siguiente conversación):**

1. **A-24** — ¿Existió o está planificado MyERC721? ¿La tokenización sigue
   en la hoja de ruta? (acta P19, DIR: sin respuesta concluyente)
2. **A-35** — ¿Cuál es la red de destino real del negocio (mainnet, L2,
   otra)? «Tenemos que investigar» (acta P20, DIR)
3. **A-37** — ¿Quién responde operativo de cada advertencia «no tocar»?
   (acta P21, DIR: sin respuesta concluyente)
4. **A-38 (mitad humana)** — ¿Quién fue el equipo original? (acta P22,
   DIR: sin respuesta concluyente)

**Preguntas nuevas surgidas de la entrevista** (acta, sección «Pendiente
para próxima ronda»): estado real de la base índice Firebase tras la
pérdida de datos; existencia y ubicación del clúster IPFS de pruebas
fuera del repositorio; alcance exacto de la rotación de credenciales en
el camino a producción; quién ejercerá la apelación humana del sistema de
validación de disputas; en qué punto implementar la prohibición
admin-vendedor (solicitud vs concesión).

**Nota técnica no bloqueante**: `npm audit` (A-13) sigue pendiente como
tarea de análisis estático de dependencias; no requiere negocio.
