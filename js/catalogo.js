// catalogo.js
// Muestra el catalogo, deja agregar productos y enviar el pedido.
// Aqui se aplican las tres reglas de negocio.

const sesion = exigirSesion();
let lineas = [];

// El catalogo ya no es un arreglo fijo: se llena al iniciar la pagina,
// con lo que devuelva obtenerProductos() (definida en productos.js).
let PRODUCTOS = [];

if (sesion) {
  iniciar();
}

async function iniciar() {
  // El elemento se llama "nombre-consejera": debe mostrar el nombre,
  // no el codigo (estaba mal asignado).
  document.getElementById('nombre-consejera').textContent = sesion.nombre;
  lineas = obtenerPedido();

  document.getElementById('lista-productos').textContent = 'Cargando productos...';
  PRODUCTOS = await obtenerProductos();

  llenarFiltroCategorias(PRODUCTOS);
  dibujarProductos(PRODUCTOS);
  dibujarPedido();
}

// Arma las opciones del filtro de categoria a partir de las categorias
// que realmente existen en los productos cargados. Asi, si en Supabase
// agregan o quitan una categoria, el filtro no se queda desactualizado
// (antes estaban escritas a mano en el HTML).
function llenarFiltroCategorias(productos) {
  const select = document.getElementById('filtro-categoria');
  const categorias = [];

  for (let i = 0; i < productos.length; i++) {
    if (categorias.indexOf(productos[i].categoria) === -1) {
      categorias.push(productos[i].categoria);
    }
  }

  categorias.sort();

  for (let i = 0; i < categorias.length; i++) {
    const opcion = document.createElement('option');
    opcion.value = categorias[i];
    opcion.textContent = categorias[i];
    select.appendChild(opcion);
  }
}

// ─── Catalogo ───

// Imagen de cada producto: img/productos/<SKU><FORMATO_IMAGEN>.
// Son fotos con licencia CC0 (ver docs/creditos-imagenes.md). Si un
// producto nuevo no tiene foto, se muestra sin-imagen.svg.
const CARPETA_IMAGENES = 'img/productos/';
const FORMATO_IMAGEN = '.jpg';

function dibujarProductos(lista) {
  const contenedor = document.getElementById('lista-productos');
  contenedor.textContent = '';

  for (let i = 0; i < lista.length; i++) {
    contenedor.appendChild(crearTarjeta(lista[i]));
  }
}

function crearTarjeta(producto) {
  const columna = document.createElement('div');
  columna.className = 'col-12 col-sm-6 col-lg-4';

  const tarjeta = document.createElement('div');
  tarjeta.className = 'card h-100 tarjeta-producto';

  if (producto.agotado) {
    tarjeta.classList.add('producto-agotado');
  }

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body d-flex flex-column';

  const sku = document.createElement('p');
  sku.className = 'text-muted small mb-1';
  sku.textContent = producto.sku;

  const nombre = document.createElement('h6');
  nombre.textContent = producto.nombre;

  const precio = document.createElement('p');
  precio.className = 'fw-semibold mb-3';
  precio.textContent = 'Q' + producto.precio.toFixed(2);

  const categoria = document.createElement('span');
  categoria.className = 'small text-body-secondary mb-2';
  categoria.textContent = producto.categoria;

  cuerpo.appendChild(sku);
  cuerpo.appendChild(nombre);
  cuerpo.appendChild(categoria);
  cuerpo.appendChild(precio);

  if (producto.agotado) {
    // RN-03: si esta agotado no ponemos el boton de agregar
    const aviso = document.createElement('span');
    aviso.className = 'badge bg-secondary align-self-start mt-auto';
    aviso.textContent = 'Agotado';
    cuerpo.appendChild(aviso);
  } else {
    cuerpo.appendChild(crearControlesAgregar(producto));
  }

  tarjeta.appendChild(crearImagen(producto));
  tarjeta.appendChild(cuerpo);
  columna.appendChild(tarjeta);
  return columna;
}

function crearImagen(producto) {
  const imagen = document.createElement('img');
  imagen.className = 'card-img-top imagen-producto';
  imagen.src = CARPETA_IMAGENES + producto.sku + FORMATO_IMAGEN;
  imagen.alt = producto.nombre;
  imagen.width = 600;
  imagen.height = 480;
  imagen.loading = 'lazy';

  // Si el producto todavia no tiene imagen, se usa la de respaldo
  imagen.addEventListener('error', function () {
    imagen.src = CARPETA_IMAGENES + 'sin-imagen.svg';
  }, { once: true });

  return imagen;
}

function crearControlesAgregar(producto) {
  const grupo = document.createElement('div');
  grupo.className = 'input-group mt-auto';

  const campo = document.createElement('input');
  campo.type = 'text';
  campo.className = 'form-control';
  campo.placeholder = 'Cantidad';
  campo.id = 'cant-' + producto.sku;

  const boton = document.createElement('button');
  boton.className = 'btn btn-outline-secondary';
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
  if (enviando) {
    avisarPedido('Espere a que termine de enviarse su pedido.', 'alert-warning');
    return;
  }

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
  if (enviando) {
    avisarPedido('Espere a que termine de enviarse su pedido.', 'alert-warning');
    return;
  }

  lineas.splice(posicion, 1);
  guardarPedido(lineas);
  dibujarPedido();
  avisarPedido('Producto eliminado del pedido.', 'alert-info');
}

// ─── Enviar el pedido (HU-07) ───
// El pedido enviado se guarda en Supabase (registrarPedidoEnviado, en
// sesion.js). El carrito solo se vacia cuando Supabase confirma; si algo
// falla, el pedido se queda como estaba y la consejera puede reintentar.

// CP-18: mientras se espera la respuesta no se acepta otro envio
let enviando = false;

async function enviarPedido() {
  if (enviando) {
    return;
  }

  const boton = document.getElementById('btn-enviar');
  enviando = true;
  boton.disabled = true;

  // RN-01: se revisa aqui antes de usar la red (la base lo vuelve a revisar)
  const revision = puedeEnviarse({
    sesionActiva: true,
    lineas: lineas
  });

  if (!revision.permitido) {
    avisarPedido(revision.mensaje, 'alert-danger');
    terminarEnvio();
    return;
  }

  avisarPedido('Enviando su pedido...', 'alert-info');

  // Con el mismo carrito se reutiliza el mismo numero, asi un reintento
  // no crea un pedido duplicado
  let numero = numeroParaEnviar(lineas, generarNumeroPedido);
  let resultado = await registrarPedidoEnviado(numero, lineas, sesion.codigo);

  // El numero ya lo tenia otro pedido: se genera uno nuevo una sola vez
  if (resultado.repetido) {
    limpiarPedidoPendiente();
    numero = numeroParaEnviar(lineas, generarNumeroPedido);
    resultado = await registrarPedidoEnviado(numero, lineas, sesion.codigo);
  }

  if (!resultado.ok) {
    avisarPedido(resultado.mensaje, 'alert-danger');
    terminarEnvio();
    return;
  }

  limpiarPedidoPendiente();
  lineas = [];
  guardarPedido(lineas);
  dibujarPedido();

  avisarPedido('Pedido enviado. Su numero de confirmacion es ' + numero, 'alert-success');
  terminarEnvio();
}

function terminarEnvio() {
  enviando = false;
  document.getElementById('btn-enviar').disabled = false;
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

// ─── Filtros de categoria, precio y orden (HU-09) ───

function aplicarFiltros() {
  const opciones = {
    categoria: document.getElementById('filtro-categoria').value,
    precioMin: document.getElementById('filtro-precio-min').value,
    precioMax: document.getElementById('filtro-precio-max').value,
    orden: document.getElementById('filtro-orden').value
  };

  // Al aplicar filtros dejamos limpia la busqueda por SKU,
  // para no mezclar dos formas distintas de reducir la lista.
  document.getElementById('buscar-sku').value = '';
  document.getElementById('mensaje-busqueda').classList.add('d-none');

  const resultado = filtrarProductos(PRODUCTOS, opciones);
  dibujarProductos(resultado);

  const aviso = document.getElementById('mensaje-filtro');
  if (resultado.length === 0) {
    aviso.textContent = 'Ningun producto cumple con los filtros seleccionados.';
    aviso.classList.remove('d-none');
  } else {
    aviso.classList.add('d-none');
  }
}

function limpiarFiltros() {
  document.getElementById('filtro-categoria').value = '';
  document.getElementById('filtro-precio-min').value = '';
  document.getElementById('filtro-precio-max').value = '';
  document.getElementById('filtro-orden').value = '';
  document.getElementById('mensaje-filtro').classList.add('d-none');
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
document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
