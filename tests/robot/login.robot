*** Settings ***
Documentation     Casos CP-03 y CP-04 de la RTM (HU-02), antes manuales.
...               Se corren con: robot --outputdir resultados tests/robot
...               Antes hay que levantar el sitio: python -m http.server 8000
Resource          recursos.resource
Test Setup        Abrir La Pagina De Login
Test Teardown     Cerrar Navegador


*** Test Cases ***
CP-04 | Campos vacios piden llenarlos
    Ingresar Credenciales    ${EMPTY}    ${EMPTY}
    Presionar Entrar
    Deberia Ver El Mensaje    Complete ambos campos.
    Deberia Seguir En El Login

CP-04 | Solo el codigo lleno tambien pide llenarlos
    Ingresar Credenciales    3311    ${EMPTY}
    Presionar Entrar
    Deberia Ver El Mensaje    Complete ambos campos.

CP-03 | Contrasena incorrecta no entra y avisa
    # 3311 es una consejera activa de la base real; la clave es inventada.
    Ingresar Credenciales    3311    clave-incorrecta
    Presionar Entrar
    Deberia Ver El Mensaje    Codigo o contrasena incorrectos.
    Deberia Seguir En El Login

CP-03 | Codigo que no existe da el mismo aviso
    Ingresar Credenciales    0000    clave-incorrecta
    Presionar Entrar
    Deberia Ver El Mensaje    Codigo o contrasena incorrectos.
    Deberia Seguir En El Login
