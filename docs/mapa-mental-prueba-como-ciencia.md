# La Prueba como Ciencia

Esquema por niveles para pasar a una herramienta de mapas mental. Es un borrador nuevo: el mapa de Juan Carlos no estaba en el repositorio.

## Nodo central

Proceso Fundamental de Pruebas (ISO/IEC/IEEE 29119)

- Idea base: el testing no es un evento aislado de búsqueda de fallos. Es un proceso continuo e iterativo de gestión de información y riesgo.
- Sin criterios de salida, el testing se vuelve infinito e inconcluyente.

## Rama 1: Planificación y Control (ISO 29119-2)

- Planificación
  - Define la estrategia de prueba (Test Strategy), los recursos, la estimación de esfuerzo y el alcance técnico.
- Control de pruebas
  - Actividad continua que compara el progreso real contra el Plan de Pruebas, con métricas como el avance de la ejecución y la tasa de detección de fallos.
- Acciones correctivas
  - Reasignar recursos o ajustar el alcance cuando hay desviaciones respecto al plan máster.
- En nuestro proyecto
  - Máster Test Plan MTP-PC-001, basado en ISO/IEC/IEEE 29119-3.
  - Actividades y horas: 80 h en total (sección 2.6 del plan).
  - Tablero Kanban en GitHub Projects.
  - El QA Gate (ESLint y `npm test` en cada PR) bloquea el merge si algo falla.

## Rama 2: Análisis y Diseño de Pruebas

- Análisis (qué probar)
  - Identificar las condiciones de prueba a partir de la base de pruebas: requisitos, arquitectura e historias de usuario.
- Diseño (cómo probar)
  - Convertir las condiciones en casos de prueba formales: entradas, pasos y resultados esperados.
- Técnicas de diseño
  - Partición de equivalencia, valores límite y tablas de decisión.
- En nuestro proyecto
  - Valores límite: RN-01 con Q399.99, Q400.00 y Q400.01; RN-02 con 0, 1, 99 y 100.
  - Partición de equivalencia en la búsqueda por SKU y el login.
  - Tabla de decisión para enviar el pedido.
  - Matriz de trazabilidad (RTM) con 19 casos, más los 11 del filtro.

## Rama 3: Implementación y Ejecución

- Implementación
  - Organizar los casos en suites, preparar los scripts de automatización y verificar el entorno.
- Ejecución
  - Corrida manual o automatizada, con el estado de cada caso (Pass, Fail, Block) y reporte inmediato de defectos.
- Pruebas de regresión
  - Volver a correr las suites para asegurar que los cambios no dañaron lo que ya funcionaba.
- En nuestro proyecto
  - `npm test` corre 32 pruebas con `node --test`: 12 unitarias de pedido, 11 del filtro y 9 de integración.
  - Aparte, con comandos propios: 9 de seguridad RLS, pruebas E2E con Playwright y compatibilidad en 6 combinaciones de navegador y tamaño.
  - 5 criterios BDD en tests/aceptacion/pedido.feature, que se ejecutan a mano.
  - GitHub Actions con Node 22 corre la regresión automática en cada PR.

## Rama 4: Evaluación de Criterios de Salida y Reporte

- Medición de cobertura
  - Comparar la ejecución real contra los criterios de salida del plan.
- Análisis de defectos
  - Evaluar los incidentes abiertos según su severidad y prioridad.
- Test Summary Report
  - Informe sumario con la calidad residual y la recomendación de despliegue.
- En nuestro proyecto
  - Criterios de salida del Máster Test Plan: casos Críticos y Altos ejecutados, al menos 80% de Medios y Bajos, y sin defectos Críticos abiertos.
  - Estado de la RTM en docs/rtm-estado.md: 19 de 19 casos aprobados.
  - Defectos registrados en GitHub Issues (el #1 y el #2).
  - Lo que queda sin ejecutar se declara: los 5 criterios BDD, la revisión visual y los NFR-01, NFR-02 y NFR-03.

## Rama 5: Actividades de Cierre

- Consolidación
  - Entregar los artefactos de prueba (testware), los scripts y los datos a mantenimiento.
- Cierre de incidentes
  - Verificar que cada defecto esté corregido, diferido o archivado.
- Lecciones aprendidas
  - Retroalimentación del proceso para mejorar las iteraciones siguientes.
- En nuestro proyecto
  - Testware en el repositorio: tests/, sql/ y docs/.
  - Lección 1: con Node 20 los patrones glob de `node --test` fallaron y el primer QA Gate salió en rojo. Se resolvió subiendo a Node 22.
  - Lección 2: el issue #1 se cerró antes de que la corrección llegara a main. Un defecto solo se cierra cuando el PR con la corrección ya está fusionado.

## Referencias

- ISO/IEC/IEEE 29119: serie de estándares de pruebas de software. La parte 2 describe los procesos de prueba y la parte 3 la documentación de pruebas.
- ISTQB: certificación y glosario estándar de pruebas. Su programa Foundation describe un proceso de prueba equivalente, con planificación, monitoreo y control, análisis, diseño, implementación, ejecución y finalización. No se citan versiones del programa porque no se pudieron verificar.
