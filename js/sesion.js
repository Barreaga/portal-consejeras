// sesion.js
// Funciones que usan las paginas internas para revisar la sesion.
//
// Recordatorio: la sesion se guarda en el navegador porque el proyecto
// no tiene servidor. No es seguridad real (ver Documento SQA, seccion 3.4).

// Devuelve los datos de la consejera, o null si no hay sesion
function obtenerSesion() {
  const guardado = localStorage.getItem('sesion');

  if (!guardado) {
    return null;
  }

  return JSON.parse(guardado);
}

// CP-05: si alguien escribe la URL sin haber entrado, lo mandamos al login
function exigirSesion() {
  const sesion = obtenerSesion();

  if (!sesion) {
    window.location.replace('login.html');
    return null;
  }

  return sesion;
}

// CP-19: borra la sesion y regresa a la landing.
// Usamos replace para que el boton atras no regrese a la pagina interna.
function cerrarSesion() {
  localStorage.removeItem('sesion');
  localStorage.removeItem('pedido');
  window.location.replace('index.html');
}

// Lee el pedido guardado. Si no hay, devuelve una lista vacia.
function obtenerPedido() {
  const guardado = localStorage.getItem('pedido');

  if (!guardado) {
    return [];
  }

  return JSON.parse(guardado);
}

function guardarPedido(lineas) {
  localStorage.setItem('pedido', JSON.stringify(lineas));
}
