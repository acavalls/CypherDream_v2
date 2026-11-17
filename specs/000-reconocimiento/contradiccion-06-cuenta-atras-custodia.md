# Contradicción 06 — Cuenta atrás de la custodia

> Reconocimiento (000), 2026-11-17. Pendiente de entrada en el registro de
> anomalías y del guion de entrevista al negocio.

## 1. Implementaciones implicadas

Concepto: «cuánto falta para poder retirar/recuperar».

| Implementación | Evidencia | ¿Quién la usa? |
|---|---|---|
| A: minutos activos (vendedor) | MyDeals.js:220 (`parseInt(((checkpoint - time) + period) / 60) + ' mins'`) | Vista MyDeals, deals con contraseña enviada |
| B: minutos activos (comprador) | Buyer.js:390 (fórmula idéntica) | Vista Buyer, deals sin contraseña |
| C: horas comentadas (vendedor) | MyDeals.js:219 (línea comentada con `/3600` y `'hours'`) | Nadie (resto de una versión anterior) |

Todas alimentan el mismo mensaje de negocio («time remaining to
withdraw/recovery»).

## 2. ¿Misma convención o algoritmo?

A y B: idénticas (misma resta, mismo parseInt, misma unidad). C: misma
fórmula con divisor 3600 en lugar de 60: unidad 60 veces mayor.

Fórmula compartida: `(checkpointStart - time + withdrawalPeriod) / divisor`,
donde `time` es una LECTURA ÚNICA del tiempo del bloque al montar
(Buyer.js:55; MyDeals.js:44) y `checkpointStart` el instante de apertura de
la custodia leído por separado (Buyer.js:61; MyDeals.js:61).

## 3. Ejemplos con resultados distintos

- **A/B vs C (histórica)**: custodia abierta hace 4 min de un periodo de
  5 min → A/B muestran «1 mins»; C mostraría «0 hours» (división entera:
  60/3600 = 0). Con periodos de horas, A daría minutos y C horas; nunca
  coexistieron en ejecución.
- **A/B contra el caso sin custodia** (dato real calculado con la fórmula
  del código): checkpoint 0, time de bloque ≈ 1.000.000.000, periodo 300 →
  `parseInt((0 - 1000000000 + 300)/60)` = **-16666661 mins**: la UI
  muestra una deuda de 28 años en vez de ocultar el contador.
- **A/B contra el reloj real**: como `time` se lee una vez, el valor
  mostrado está congelado; el negocio ve «4 mins» durante una hora.

## 4. Cuándo divergen y cuándo coinciden

- A y B coinciden siempre (copia idéntica). C diverge de A/B por un factor
  60, pero está muerto: solo explica el pasado.
- La divergencia visible hoy (números negativos/congelados) se manifiesta
  siempre que el plazo venció o no hay custodia — situación NORMAL de un
  deal esperando contraseña: por eso los usuarios la han visto, y su
  absurdidad puede haber pasado por «cosma de demo».

## 5. Historia probable

La coexistencia de C (horas) comentada junto a A (minutos) activa en
MyDeals.js:219-220 documenta una edición en línea: se cambió el divisor y
la unidad y se dejó la línea anterior como comentario, sin borrarla. Que
el cambio sea de 3600→60 sugiere que el periodo de negocio pasó de pensarse
en horas (los «4 días» del Tutorial, Tutorial.js:86) a minutos (los 5 min
del contrato, Marketplace.sol:35): la UI se reajustó a la baja y el
Tutorial quedó contando otra historia.
