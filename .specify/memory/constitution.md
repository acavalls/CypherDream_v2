<!--
  SYNC IMPACT REPORT
  ==================
  Versión: (contenido previo pertenecía a otro proyecto: "Constitución del
  Agente de Predicción Climática", sin vigencia aquí) → 1.0.0 para
  CypherDream_v2.
  Principios modificados: ninguno (adopción inicial para este proyecto a
  partir del input del negocio, 4 principios innegociables + 1 principio
  de idioma heredado de la práctica de gobernanza previa).
  Secciones añadidas:
    - Principios Fundamentales (5 principios)
    - Contexto y Evidencia del Sistema
    - Restricciones Adicionales
    - Flujo de Trabajo de Documentación y Protección
    - Anomalías Conocidas en el Momento de Ratificar
    - Gobernanza
  Secciones eliminadas: la constitución del proyecto anterior (agente
  climático Python/pytest); no aplica a este repositorio.
  TODOs/elementos diferidos:
    - PRINCIPIO IV (runner de tests): el input del negocio indicaba "runner
      nativo". Resuelto con evidencia: los tests existentes viven en `test/`
      y usan `artifacts.require` (test/TestMarketplace.js:1), por lo que el
      runner nativo de este proyecto es `truffle test`. package.json no
      define script de test (package.json:10), así que no se añade ninguno.
    - Falta testimonio del negocio (nombre y fecha) que ratifique esta
      constitución; se ratifica provisionalmente el 2026-11-17.
  Próxima revisión de cumplimiento: al inicio del módulo siguiente.
-->

# Constitución de CypherDream_v2 (mercado de datos biológicos en Blockchain)

## Principios Fundamentales

### I. El comportamiento actual es sagrado

Ningún cambio de comportamiento observable está permitido en esta fase, ni
siquiera cuando el comportamiento parezca un error. El sistema se documenta y
se protege tal como es. Corregirlo pertenece a un módulo posterior.

### II. Evidencia obligatoria

Toda afirmación sobre lo que el sistema hace DEBE ir acompañada de su
evidencia, que puede ser: fichero y líneas de código, dato real de la base de
datos, o testimonio del negocio (con nombre y fecha). Las suposiciones se
marcan explícitamente como SUPOSICIÓN y se convierten en preguntas.

### III. Los hallazgos no se corrigen, se registran

Los bugs, riesgos y rarezas detectados DEBEN registrarse en el registro de
anomalías con su clasificación correspondiente. Corregirlos es una decisión
del módulo siguiente, no de esta fase.

### IV. Cero dependencias nuevas y cero refactors

No se añade ningún paquete nuevo ni se reorganiza código en esta fase. Los
tests de caracterización usarán exclusivamente el runner nativo del proyecto
(`truffle test`; evidencia: test/TestMarketplace.js:1 usa `artifacts.require`
y package.json:10 no define ningún script de test alternativo).

### V. Español

Todo el contenido producido en esta fase (documentación, constitución,
registros, tests y comentarios) DEBE estar en español. Principio
heredado de la práctica de gobernanza previa del equipo; los comentarios ya
existentes en el código fuente se conservan tal cual (Principio I).

## Contexto y Evidencia del Sistema

CypherDream es "a biological data marketplace and a scientific services
platform" (README.md:1-2). El nombre interno del paquete es "newmarketplace"
(package.json:2). Componentes observados con su evidencia:

- **Contrato principal**: `contracts/Marketplace.sol`, Solidity
  `^0.4.24` (Marketplace.sol:1), hereda de Ownable, Destructible y Pausable
  de zeppelin local (Marketplace.sol:3-7,
  `installed_contracts/zeppelin/contracts/...`).
- **Funciones observables**: registro de datasets
  (Marketplace.sol:174-188), compra con devolución de sobrante
  (Marketplace.sol:232-273), envío de IV y clave cifradas del comprador
  almacenadas on-chain (Marketplace.sol:190-200, mappings en
  Marketplace.sol:23-24), retirada del vendedor con 5 % de comisión para el
  propietario del marketplace (Marketplace.sol:294-297) y periodo de espera
  `withdrawalWaitPeriod = 5 minutes` (Marketplace.sol:35), recuperación del
  importe por el comprador (Marketplace.sol:306-354), baja de dataset
  (Marketplace.sol:356-389) y registro de clave pública
  (Marketplace.sol:391-400).
- **Servidor HTTP**: Express con endpoint único `POST /api` que fija un CID
  IPFS en el clúster local y responde un json simple`
  (server.js:18-29; clúster en server.js:5-6).
- **Cliente**: aplicación en `client/` con React (client/src: App.js,
  containers, components) e integración IPFS (client/src/ipfs.js).
- **Tests existentes**: `test/TestMarketplace.js` y `test/TestMarketplace.sol`;
  el fichero JavaScript está íntegramente comentado (test/TestMarketplace.js:8-707).

Las afirmaciones anteriores proceden exclusivamente de lectura de código.
Cualquier afirmación sobre intencionalidad de diseño es SUPOSICIÓN hasta
disponer de testimonio del negocio.

## Restricciones Adicionales

- Está prohibido añadir dependencias durante esta fase: `package.json`,
  `package-lock.json` y `client/package.json` DEBEN permanecer intactos en
  cuanto a dependencias (evidencia de que existe cliente con su propio lock:
  client/package-lock.json).
- Está prohibido refactorizar: no se renombra, mueve ni reorganiza código
  fuente. Solo se permite añadir artefactos de documentación y tests de
  caracterización.
- Los tests de caracterización se ejecutarán únicamente con `truffle test`
  (runner nativo de Truffle, ya presente en el proyecto) usando `assert`
  nativo como en los tests existentes; no se configura Mocha, Chai ni
  ningún framework adicional.
- No se modifica `secret.js`, `truffle.js`, `truffle-config.js`, las
  migraciones (`migrations/`) ni los artefactos compilados (`build/`).
- No se despliega nada a redes nuevas: solo red `development` según
  truffle.js:6-13; la configuración de rinkeby está comentada
  (truffle.js:21-35) y se deja tal cual.

## Flujo de Trabajo de Documentación y Protección

1. Toda exploración del código DEBE documentar el comportamiento observado
   con su evidencia (Principio II).
2. Cada hallazgo (bug, riesgo, rareza) DEBE registrarse en el registro de
   anomalías (`.specify/memory/anomalies.md`) con clasificación, sin
   intentar corregirlo (Principio III).
3. Las SUPOSICIONES se marcan como tales y se listan como preguntas abiertas
   hasta disponer de evidencia o testimonio del negocio.
4. Los tests de caracterización se escriben en `test/` con el runner nativo
   y deben pasar contra el comportamiento actual, no contra el deseado.
5. La revisión de cumplimiento constitucional es obligatoria antes de dar por
   cerrada cualquier entrega de esta fase.

## Anomalías Conocidas en el Momento de Ratificar

Registradas aquí por ser previas a la ratificación; se trasladarán al
registro de anomalías en la primera pasada de documentación. Ninguna se
corrige en esta fase (Principio III).

| ID | Clasificación | Hallazgo | Evidencia |
|----|---------------|----------|-----------|
| A-01 | Riesgo (seguridad) | `secret.js` contiene material sensible y está en la raíz del repositorio bajo control de versiones | fichero `secret.js` en raíz; referenciado por truffle.js:1 |
| A-02 | Bug (build/runtime) | `server.js` requiere `ipfs-cluster-api`, que no figura en las dependencias de package.json | server.js:5; package.json:13-26 |
| A-03 | Rareza (tests) | `test/TestMarketplace.js` está íntegramente comentado y sus llamadas no coinciden con la firma actual del contrato (p. ej. `registerDataset` con distinto número de argumentos) | test/TestMarketplace.js:8-707; contracts/Marketplace.sol:174 |
| A-04 | Rareza (consistencia) | Los tests comentados asumen `withdrawalWaitPeriod = 10 seconds`; el contrato define 5 minutos | test/TestMarketplace.js:337; contracts/Marketplace.sol:35 |
| A-05 | Rareza (respuestas) | El endpoint `POST /api` fija un CID concreto y responde un a comportamiento que parece de prueba | server.js:18-29 |
| A-06 | Riesgo (privacidad) | La IV y la clave cifrada del comprador se almacenan en el estado on-chain del contrato | contracts/Marketplace.sol:23-24, 190-200 |

## Gobernanza

- Esta constitución prevalece sobre cualquier otra práctica, convención o
  instrucción del proyecto durante la fase de documentación y protección.
- Las enmiendas requieren: documentación del cambio, versión actualizada
  según versionado semántico y registro en el informe de sincronización.
- Versionado semántico: MAJOR para cambios incompatibles de gobernanza o
  redefinición/eliminación de principios; MINOR para nuevos principios o
  secciones o ampliación sustancial de la guía; PATCH para aclaraciones y
  correcciones de redacción sin impacto semántico.
- Toda revisión o PR DEBE verificar el cumplimiento de estos principios; la
  complejidad añadida debe justificarse frente a ellos.

**Versión**: 1.0.0 | **Ratificado**: 2026-11-17 | **Última modificación**: 2026-11-17
