// catalogo.js
// Muestra el catalogo, deja agregar productos y enviar el pedido.
// Aqui se aplican las tres reglas de negocio.

const sesion = exigirSesion();
let lineas = [];

if (sesion) {
  iniciar();
}

function iniciar() {
  document.getElementById('nombre-consejera').textContent = sesion.codigo;
  lineas = obtenerPedido();
  dibujarProductos(PRODUCTOS);
  dibujarPedido();
}

// ─── Catalogo ───

function dibujarProductos(lista) {
  const contenedor = document.getElementById('lista-productos');
  contenedor.textContent = '';

  for (let i = 0; i < lista.length; i++) {
    contenedor.appendChild(crearTarjeta(lista[i]));
  }
}

function crearTarjeta(producto) {
  const columna = document.createElement('div');
  columna.className = 'col-md-4';

  const tarjeta = document.createElement('div');
  tarjeta.className = 'card h-100 p-3 tarjeta-producto';

  if (producto.agotado) {
    tarjeta.classList.add('producto-agotado');
  }

  const sku = document.createElement('p');
  sku.className = 'text-muted small mb-1';
  sku.textContent = producto.sku;

  const nombre = document.createElement('h6');
  nombre.textContent = producto.nombre;

  const precio = document.createElement('p');
  precio.className = 'mb-2';
  precio.textContent = 'Q' + producto.precio.toFixed(2);

  tarjeta.appendChild(sku);
  tarjeta.appendChild(nombre);
  tarjeta.appendChild(precio);

  if (producto.agotado) {
    // RN-03: si esta agotado no ponemos el boton de agregar
    const aviso = document.createElement('span');
    aviso.className = 'badge bg-secondary';
    aviso.textContent = 'Agotado';
    tarjeta.appendChild(aviso);
  } else {
    tarjeta.appendChild(crearControlesAgregar(producto));
  }

  columna.appendChild(tarjeta);
  return columna;
}

function crearControlesAgregar(producto) {
  const grupo = document.createElement('div');
  grupo.className = 'input-group';

  const campo = document.createElement('input');
  campo.type = 'text';
  campo.className = 'form-control';
  campo.placeholder = 'Cantidad';
  campo.id = 'cant-' + producto.sku;

  const boton = document.createElement('button');
  boton.className = 'btn btn-outline-dark';
  boton.textContent = 'Agregar';
  boton.addEventListener('click', function () {
    agregarProducto(producto, campo.value);
  });

  grupo.appendChild(campo);
  grupo.appendChild(boton);
  return grupo;
}

// ─── Agregar al pedido (HU-05) ───

function agregarProducto(producto, cantidadEscrita) {
  // RN-03: revisar que no este agotado
  const disponible = validarDisponible(producto);

  if (!disponible.valido) {
    avisarPedido(disponible.mensaje, 'alert-danger');
    return;
  }

  // RN-02: revisar que la cantidad sea valida
  const revision = validarCantidad(cantidadEscrita);

  if (!revision.valido) {
    avisarPedido(revision.mensaje, 'alert-danger');
    return;
  }

  const cantidad = Number(cantidadEscrita);
  const existente = buscarLinea(producto.sku);

  if (existente) {
    existente.cantidad = cantidad;
  } else {
    lineas.push({
      sku: producto.sku,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidad
    });
  }

  guardarPedido(lineas);
  dibujarPedido();
  avisarPedido('Producto agregado a su pedido.', 'alert-success');
}

function buscarLinea(sku) {
  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i].sku === sku) {
      return lineas[i];
    }
  }
  return null;
}

// ─── Mostrar el pedido (HU-06) ───

function dibujarPedido() {
  const cuerpo = document.getElementById('lineas-pedido');
  cuerpo.textContent = '';

  for (let i = 0; i < lineas.length; i++) {
    cuerpo.appendChild(crearFila(lineas[i], i));
  }

  const total = calcularTotal(lineas);
  document.getElementById('total-pedido').textContent = 'Q' + total.toFixed(2);
}

function crearFila(linea, posicion) {
  const fila = document.createElement('tr');
  const subtotal = linea.precio * linea.cantidad;

  const textos = [
    linea.sku,
    linea.nombre,
    'Q' + linea.precio.toFixed(2),
    String(linea.cantidad),
    'Q' + subtotal.toFixed(2)
  ];

  for (let i = 0; i < textos.length; i++) {
    const celda = document.createElement('td');
    celda.textContent = textos[i];
    fila.appendChild(celda);
  }

  const celdaBoton = document.createElement('td');
  const boton = document.createElement('button');
  boton.className = 'btn btn-sm btn-outline-danger';
  boton.textContent = 'Quitar';
  boton.addEventListener('click', function () {
    quitarLinea(posicion);
  });

  celdaBoton.appendChild(boton);
  fila.appendChild(celdaBoton);
  return fila;
}

function quitarLinea(posicion) {
  lineas.splice(posicion, 1);
  guardarPedido(lineas);
  dibujarPedido();
  avisarPedido('Producto eliminado del pedido.', 'alert-info');
}

// ─── Enviar el pedido (HU-07) ───

function enviarPedido() {
  const boton = document.getElementById('btn-enviar');

  // CP-18: apagamos el boton para que el doble clic no genere dos pedidos
  boton.disabled = true;

  const revision = puedeEnviarse({
    sesionActiva: true,
    lineas: lineas
  });

  if (!revision.permitido) {
    avisarPedido(revision.mensaje, 'alert-danger');
    boton.disabled = false;
    return;
  }

  const numero = generarNumeroPedido();

  lineas = [];
  guardarPedido(lineas);
  dibujarPedido();

  avisarPedido('Pedido enviado. Su numero de confirmacion es ' + numero, 'alert-success');
  boton.disabled = false;
}

// ─── Buscar por SKU (HU-04) ───

function buscar() {
  const texto = document.getElementById('buscar-sku').value.trim().toUpperCase();
  const aviso = document.getElementById('mensaje-busqueda');

  // CP-08 y campo vacio: si no escribio nada mostramos todo
  if (texto === '') {
    dibujarProductos(PRODUCTOS);
    aviso.classList.add('d-none');
    return;
  }

  const encontrados = [];

  for (let i = 0; i < PRODUCTOS.length; i++) {
    if (PRODUCTOS[i].sku.indexOf(texto) !== -1) {
      encontrados.push(PRODUCTOS[i]);
    }
  }

  dibujarProductos(encontrados);

  if (encontrados.length === 0) {
    aviso.textContent = 'No se encontro ningun producto con ese SKU.';
    aviso.classList.remove('d-none');
  } else {
    aviso.classList.add('d-none');
  }
}

function limpiarBusqueda() {
  document.getElementById('buscar-sku').value = '';
  document.getElementById('mensaje-busqueda').classList.add('d-none');
  dibujarProductos(PRODUCTOS);
}

// ─── Avisos ───

function avisarPedido(texto, tipo) {
  const caja = document.getElementById('mensaje-pedido');
  caja.className = 'alert ' + tipo;
  caja.textContent = texto;
}

document.getElementById('btn-buscar').addEventListener('click', buscar);
document.getElementById('btn-limpiar').addEventListener('click', limpiarBusqueda);
document.getElementById('btn-enviar').addEventListener('click', enviarPedido);
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);
