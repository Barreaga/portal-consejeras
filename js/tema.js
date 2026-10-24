// tema.js
// Modo claro y modo oscuro, usando el modo de color de Bootstrap 5.3
// (atributo data-bs-theme en la etiqueta html).
// Se carga en el <head> de cada pagina para poner el tema antes de que
// se pinte, asi no se ve un parpadeo blanco al abrir en modo oscuro.
// La eleccion se guarda en el navegador con la clave "tema".

function temaGuardado() {
  try {
    return localStorage.getItem('tema');
  } catch {
    return null;
  }
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-bs-theme', tema);

  const boton = document.getElementById('btn-tema');
  if (boton) {
    boton.textContent = tema === 'dark' ? 'Modo claro' : 'Modo oscuro';
  }
}

function alternarTema() {
  const actual = document.documentElement.getAttribute('data-bs-theme');
  const nuevo = actual === 'dark' ? 'light' : 'dark';

  try {
    localStorage.setItem('tema', nuevo);
  } catch {
    // Si el navegador no deja guardar, el tema solo dura en esta pagina
  }

  aplicarTema(nuevo);
}

aplicarTema(temaGuardado() === 'dark' ? 'dark' : 'light');

document.addEventListener('DOMContentLoaded', function () {
  aplicarTema(document.documentElement.getAttribute('data-bs-theme'));

  const boton = document.getElementById('btn-tema');
  if (boton) {
    boton.addEventListener('click', alternarTema);
  }
});
