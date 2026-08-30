# Criterios de aceptacion en formato BDD (Gherkin)
# Cuadrante Q2 de la matriz de pruebas agiles
# Portal de Consejeras - Hito 3
#
# Estos escenarios describen el comportamiento esperado en lenguaje de negocio.
# Sirven de acuerdo entre lo que se pide y lo que se construye.
# En el Hito 2 se automatizaran con Playwright.

# language: es

Caracteristica: Elaboracion y envio del pedido
  Como consejera del portal
  Quiero armar mi pedido del mes y enviarlo
  Para recibir los productos que necesito

  Antecedentes:
    Dado que el catalogo del mes esta disponible
    Y el monto minimo de pedido es Q400.00

  # CA-01 | HU-07 | RN-01 | CP-17
  Escenario: Enviar un pedido que cumple el monto minimo
    Dado que soy una consejera con sesion iniciada
    Y mi pedido suma Q400.00
    Cuando presiono el boton de enviar pedido
    Entonces el sistema registra el pedido
    Y me muestra un numero de confirmacion

  # CA-02 | HU-07 | RN-01 | CP-16
  Escenario: Bloquear un pedido por debajo del monto minimo
    Dado que soy una consejera con sesion iniciada
    Y mi pedido suma Q399.99
    Cuando presiono el boton de enviar pedido
    Entonces el sistema no registra el pedido
    Y me indica que me falta Q0.01 para alcanzar el minimo

  # CA-03 | HU-05 | RN-02 | CP-12
  Escenario: Rechazar una cantidad fuera del rango permitido
    Dado que estoy viendo el catalogo de productos
    Cuando escribo una cantidad de 100 unidades para un producto
    Y presiono agregar
    Entonces el sistema no agrega el producto a mi pedido
    Y me indica que la cantidad maxima es 99

  # CA-04 | HU-05 | RN-03 | CP-14
  Escenario: Impedir agregar un producto agotado
    Dado que estoy viendo el catalogo de productos
    Y hay un producto marcado como agotado
    Cuando intento agregarlo a mi pedido
    Entonces el sistema no me permite agregarlo
    Y el total de mi pedido no cambia

  # CA-05 | HU-02 | R-04 | CP-05
  Escenario: Proteger las paginas internas del portal
    Dado que no he iniciado sesion
    Cuando escribo directamente la direccion del dashboard en el navegador
    Entonces el sistema me redirige a la pantalla de inicio de sesion
    Y no muestra ninguna informacion del portal
