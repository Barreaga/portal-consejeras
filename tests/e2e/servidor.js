// servidor.js
// Servidor estatico muy sencillo para las pruebas de Playwright.
// Sirve los archivos del proyecto en http://localhost:4173, igual que si
// se abriera el sitio publicado. No usa librerias extra.

/* global __dirname */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..', '..');
const PUERTO = 4173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png'
};

const servidor = http.createServer(function (pedido, respuesta) {
  const ruta = decodeURIComponent(pedido.url.split('?')[0]);
  const archivo = path.join(RAIZ, ruta === '/' ? 'index.html' : ruta);

  // No dejamos salir de la carpeta del proyecto
  if (!archivo.startsWith(RAIZ)) {
    respuesta.writeHead(403);
    respuesta.end();
    return;
  }

  fs.readFile(archivo, function (error, contenido) {
    if (error) {
      respuesta.writeHead(404);
      respuesta.end('No encontrado');
      return;
    }
    respuesta.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
    respuesta.end(contenido);
  });
});

servidor.listen(PUERTO);
