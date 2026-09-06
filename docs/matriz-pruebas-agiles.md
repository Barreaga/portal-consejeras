# Matriz de Pruebas Ágiles

Portal de Consejeras · Hito 3

Este documento clasifica nuestras pruebas usando los **cuadrantes ágiles de prueba**. El modelo agrupa las pruebas según dos preguntas: si sirven para ayudar al equipo o para evaluar el producto, y si miran la parte técnica o la parte del negocio.

## Los cuatro cuadrantes

|  | Mirando la tecnología | Mirando el negocio |
|---|---|---|
| **Apoyan al equipo** | **Q1** — Pruebas unitarias | **Q2** — Pruebas funcionales y BDD |
| **Evalúan el producto** | **Q4** — Rendimiento y seguridad | **Q3** — Pruebas exploratorias y de usabilidad |

En este hito trabajamos **Q1 y Q2**.

- **Q1** responde a: *¿estamos construyendo el código bien?* Son pruebas automatizadas que revisan funciones sueltas.
- **Q2** responde a: *¿estamos construyendo lo correcto?* Son escenarios escritos en lenguaje de negocio, que cualquiera puede entender sin saber programar.

**Q3 y Q4 quedan fuera de este hito.** Q3 lo cubrimos parcialmente con las pruebas manuales de la matriz de trazabilidad. Q4 no lo trabajamos porque no tenemos infraestructura para pruebas de carga, lo cual ya está declarado como limitación en el Máster Test Plan.

---

## Cuadrante Q1 — Pruebas unitarias

Están en `tests/pedido.test.js` y se ejecutan automáticamente en el QA Gate con `npm test`.

Cada prueba lleva en su nombre el identificador del caso de la matriz de trazabilidad (RTM), para poder rastrearla.

| # | Prueba | Qué verifica | Regla | Caso RTM |
|---|---|---|---|---|
| 1 | `cantidad 1 se acepta` | Límite inferior válido | RN-02 | CP-09 |
| 2 | `cantidad 99 se acepta` | Límite superior válido | RN-02 | CP-10 |
| 3 | `cantidad 0 se rechaza` | Debajo del mínimo | RN-02 | CP-11 |
| 4 | `cantidad 100 se rechaza` | Arriba del máximo | RN-02 | CP-12 |
| 5 | `letras en la cantidad se rechazan` | Entrada no numérica | RN-02 | CP-13 |
| 6 | `un producto agotado no se puede agregar` | Producto no disponible | RN-03 | CP-14 |
| 7 | `un producto disponible sí se puede agregar` | Producto disponible | RN-03 | CP-06 |
| 8 | `el total se calcula bien con decimales` | Sin error de redondeo | — | CP-15 |
| 9 | `no deja enviar con Q399.99` | Justo debajo del mínimo | RN-01 | CP-16 |
| 10 | `sí deja enviar con Q400.00 exactos` | Justo en el mínimo | RN-01 | CP-17 |
| 11 | `sin sesión no deja enviar` | Sin sesión activa | — | CP-05 |
| 12 | `con el pedido vacío no deja enviar` | Pedido sin productos | — | — |

**Total: 12 pruebas.** El hito pide mínimo 3.

Todas corren en el pipeline. Si alguna falla, el código no se puede integrar.

---

## Cuadrante Q2 — Criterios de aceptación en BDD

BDD significa *Behaviour Driven Development*, o desarrollo guiado por el comportamiento. Los escenarios se escriben con tres palabras clave:

- **Dado** — la situación de partida
- **Cuando** — la acción que hace la usuaria
- **Entonces** — lo que debe ocurrir

La idea es que el escenario se entienda sin saber programar, para que sirva de acuerdo entre quien pide la funcionalidad y quien la construye.

Los escenarios están en `tests/aceptacion/pedido.feature`.

### CA-01 · Enviar un pedido que cumple el monto mínimo

> **Dado** que soy una consejera con sesión iniciada
> **Y** mi pedido suma Q400.00
> **Cuando** presiono el botón de enviar pedido
> **Entonces** el sistema registra el pedido
> **Y** me muestra un número de confirmación

*Historia: HU-07 · Regla: RN-01 · Caso RTM: CP-17*

### CA-02 · Bloquear un pedido por debajo del monto mínimo

> **Dado** que soy una consejera con sesión iniciada
> **Y** mi pedido suma Q399.99
> **Cuando** presiono el botón de enviar pedido
> **Entonces** el sistema no registra el pedido
> **Y** me indica que me falta Q0.01 para alcanzar el mínimo

*Historia: HU-07 · Regla: RN-01 · Caso RTM: CP-16*

### CA-03 · Rechazar una cantidad fuera del rango permitido

> **Dado** que estoy viendo el catálogo de productos
> **Cuando** escribo una cantidad de 100 unidades para un producto
> **Y** presiono agregar
> **Entonces** el sistema no agrega el producto a mi pedido
> **Y** me indica que la cantidad máxima es 99

*Historia: HU-05 · Regla: RN-02 · Caso RTM: CP-12*

### CA-04 · Impedir agregar un producto agotado

> **Dado** que estoy viendo el catálogo de productos
> **Y** hay un producto marcado como agotado
> **Cuando** intento agregarlo a mi pedido
> **Entonces** el sistema no me permite agregarlo
> **Y** el total de mi pedido no cambia

*Historia: HU-05 · Regla: RN-03 · Caso RTM: CP-14*

### CA-05 · Proteger las páginas internas del portal

> **Dado** que no he iniciado sesión
> **Cuando** escribo directamente la dirección del dashboard en el navegador
> **Entonces** el sistema me redirige a la pantalla de inicio de sesión
> **Y** no muestra ninguna información del portal

*Historia: HU-02 · Riesgo: R-04 · Caso RTM: CP-05*

**Total: 5 criterios de aceptación.** El hito pide mínimo 5.

---

## Cómo se conecta todo

Cada criterio de aceptación de Q2 apunta a una historia de usuario, a una regla de negocio y a un caso de la matriz de trazabilidad. A su vez, varios de esos casos tienen su prueba automatizada en Q1.

```
Historia de usuario  →  Regla de negocio  →  Criterio BDD (Q2)  →  Prueba unitaria (Q1)
     HU-07                   RN-01               CA-01                  CP-17
```

Esto significa que un mismo requisito se verifica en dos niveles: en lenguaje de negocio con el escenario BDD, y en código con la prueba automatizada.

---

## Registro de defectos

Los defectos se registran en el tablero Kanban del repositorio (GitHub Projects), con los siguientes estados:

| Estado | Qué significa |
|---|---|
| Por hacer | El defecto fue reportado y todavía no se trabaja |
| En progreso | Alguien está corrigiéndolo |
| En revisión | Está corregido y espera que otro compañero lo verifique |
| Terminado | Se verificó que quedó resuelto |

Cada defecto se abre como un *issue* con: qué pasó, cómo repetirlo, qué se esperaba y qué severidad tiene, según la clasificación del Documento de Arquitectura SQA.

---
