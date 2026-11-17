# AGENTS.md — Guía para agentes en CypherDream_v2

## Qué es este proyecto

CypherDream es "a biological data marketplace and a scientific services
platform" (README.md:1-2). Internamente el paquete se llama `newmarketplace`
(package.json:2). Es un marketplace de datos biológicos sobre Ethereum con
almacenamiento off-chain en IPFS:

- **Contrato inteligente**: `contracts/Marketplace.sol` (Solidity `^0.4.24`,
  Marketplace.sol:1), hereda de Ownable, Destructible y Pausable de zeppelin
  local (Marketplace.sol:3-7). Gestiona registro de datasets, compra,
  entrega de IV/clave cifradas, retiradas con 5 % de comisión
  (Marketplace.sol:294-297) y periodo de espera de 5 minutos
  (Marketplace.sol:35).
- **Servidor HTTP**: `server.js`, Express con endpoint `POST /api` que fija
  un CID en el clúster IPFS local (server.js:5-6, 18-29).
- **Cliente**: `client/`, React 16 con react-app-rewired
  (client/package.json:25, scripts), integración IPFS y cifrado
  (client/src/ipfs.js; dependencias crypto-js, eth-ecies, @cubbit/enigma en
  client/package.json:5-18).

## Constitución (obligatoria antes de cualquier trabajo)

Lee y respeta `.specify/memory/constitution.md`. Resumen de los principios
innegociables en vigor (v1.0.0):

1. **El comportamiento actual es sagrado**: ningún cambio de comportamiento
   observable, aunque parezca un error.
2. **Evidencia obligatoria**: toda afirmación sobre el sistema DEBE llevar
   fichero y líneas de código, dato real, o testimonio del negocio (nombre y
   fecha). Lo no verificable se marca como SUPOSICIÓN y se convierte en
   pregunta.
3. **Los hallazgos no se corrigen, se registran**: bugs, riesgos y rarezas
   van al registro de anomalías (`.specify/memory/anomalies.md`) con su
   clasificación. Las anomalías A-01 a A-06 ya conocidas están listadas en
   la propia constitución; ninguna se corrige en esta fase.
4. **Cero dependencias nuevas y cero refactors**: no añadir paquetes ni
   reorganizar código. Los tests de caracterización usan solo el runner
   nativo (`truffle test`).
5. **Español de España**: todo contenido nuevo (docs, comentarios, tests,
   mensajes de commit) en español de España.

Esta guía no sustituye a la constitución: si hay conflicto, gana la
constitución.

## Comandos

| Acción | Comando | Evidencia |
|--------|---------|-----------|
| Compilar contratos | `truffle compile` | truffle.js:15-19 (optimizador activo) |
| Desplegar en desarrollo | `truffle migrate` (requiere red local en localhost:8545) | truffle.js:6-13; migrations/2_deploy_contracts.js |
| Tests de contratos | `truffle test` | test/TestMarketplace.js:1 usa `artifacts.require`; package.json:10 no define script de test |
| Servidor HTTP | `npm start` (ejecuta `node ./server.js`) | package.json:11 |
| Cliente | `npm start` dentro de `client/` (react-app-rewired) | client/package.json: scripts |

Nota: truffle no figura en las dependencias de package.json (package.json:13-26);
se asume instalación global. Es SUPOSICIÓN pendiente de confirmación.

## Estructura

```
contracts/              Marketplace.sol, Migrations.sol
installed_contracts/    zeppelin local (Ownable, Destructible, Pausable)
migrations/             1_initial_migration.js, 2_deploy_contracts.js
test/                   TestMarketplace.js (íntegramente comentado), TestMarketplace.sol
build/contracts/        artefactos compilados (no editar)
server.js               Express + ipfs-cluster-api (puerto 3001 por defecto)
secret.js               material sensible (NO leer, NO mostrar, NO modificar)
client/                 React 16 + IPFS + cifrado; client/node_modules presente
ipfs-config/            configuración del clúster IPFS local
.specify/               andamiaje Spec Kit (templates, scripts, workflows)
.specify/memory/        constitución y registro de anomalías
.opencode/              comandos spec-kit y skills del agente
```

## Reglas operativas para agentes

- **No añadas dependencias** a `package.json`, `client/package.json` ni
  `package-lock.json`. Si una tarea parece requerirla, detente y plantea la
  alternativa o la pregunta al negocio.
- **No refactorices**: no renombres, muevas ni reorganices código fuente.
- **No modifiques** `secret.js`, `truffle.js`, `truffle-config.js`,
  `migrations/`, `build/` ni el contrato `Marketplace.sol` en esta fase.
- **Cita evidencia** (fichero:línea) en cualquier afirmación sobre el
  comportamiento del sistema.
- **Registra, no corrijas**: cualquier bug o rareza que encuentres va a
  `.specify/memory/anomalies.md` con ID secuencial, clasificación y evidencia.
- **Tests de caracterización**: escribe en `test/` con `truffle test` y
  `assert` nativo (como los existentes, test/TestMarketplace.js). Deben
  reflejar el comportamiento actual, no el deseado. Los tests ya existentes
  están comentados y se dejan tal cual (anomalía A-03).
- **Secretos**: nunca imprimas el contenido de `secret.js` ni lo copies en
  logs, commits o documentación.

## Flujo de trabajo Spec Kit

Este proyecto usa Spec Kit integrado con opencode. Comandos disponibles:

- `/speckit.constitution` — crear o enmendar la constitución
- `/speckit.specify` — especificación de una feature
- `/speckit.clarify` — preguntas de clarificación
- `/speckit.plan` — plan técnico
- `/speckit.tasks` — descomposición en tareas
- `/speckit.implement` — implementación
- `/speckit.analyze` y `/speckit.checklist` — verificación
- `/speckit.git.*` — operaciones git de soporte

En la fase actual (documentación y protección), los comandos de
implementación NO deben usarse para corregir los hallazgos registrados.
