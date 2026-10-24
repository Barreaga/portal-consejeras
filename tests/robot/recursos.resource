*** Settings ***
Documentation     Palabras clave que comparten las pruebas de Robot Framework.
...               Aqui se juntan los pasos que se repiten, para que las
...               pruebas se lean casi como el caso manual.
Library           SeleniumLibrary


*** Variables ***
${URL}            http://localhost:8000
${NAVEGADOR}      chrome
${ESPERA}         10s


*** Keywords ***
Abrir La Pagina De Login
    Open Browser    ${URL}/login.html    ${NAVEGADOR}
    Maximize Browser Window
    Set Selenium Timeout    ${ESPERA}
    Title Should Be    Iniciar sesion - Portal de Consejeras

Ingresar Credenciales
    [Arguments]    ${codigo}    ${clave}
    Input Text        id:codigo    ${codigo}
    Input Password    id:clave     ${clave}

Presionar Entrar
    Click Button    id:btn-entrar

Deberia Ver El Mensaje
    [Arguments]    ${texto}
    Wait Until Element Is Visible    id:mensaje
    Element Text Should Be           id:mensaje    ${texto}

Deberia Seguir En El Login
    Location Should Contain    login.html

Cerrar Navegador
    Close All Browsers
