const ORIGEN_DATOS = "productos.json";

// --- Referencias al HTML ---
const grilla = document.querySelector("#sec-prod");
const molde = document.querySelector("#temp-card");
const sinResultado = document.querySelector("#sin-result");
const buscador = document.querySelector("#buscador");

// --- Formato de precio: 1200 -> "$ 1.200" ---
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

let todosLosProductos = [];

async function obtenerProductos() {
  const respuesta = await fetch(ORIGEN_DATOS);

  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}`);
  }

  const filas = await respuesta.json();

  // Normalizamos los nombres de campo por si la BD usa otros.
  return filas.map((fila) => ({
    id: fila.id ?? fila.id_producto,
    nombre: fila.nombre ?? fila.descripcion,
    precio: Number(fila.precio ?? 0),
    imagen: fila.imagen ?? fila.url_imagen ?? "",
  }));
}

function crearTarjeta(producto) {
  const tarjeta = molde.content.cloneNode(true);

  tarjeta.querySelector(".card-nom").textContent = producto.nombre;
  tarjeta.querySelector(".card-prec").textContent = formatoPrecio.format(producto.precio);
  tarjeta.querySelector(".card-bot").textContent = "Agregar";

  const img = tarjeta.querySelector(".card-img");
  img.src = producto.imagen || "Resources/Img/Product-Images/placeholder.webp";
  img.alt = producto.nombre;

  tarjeta.querySelector(".card-bot").addEventListener("click", () => {
    mostrarExito(producto);
  });

  return tarjeta;
}

function llenarGrilla(lista) {
  grilla.innerHTML = "";
  sinResultado.hidden = lista.length > 0;

  const fragmento = document.createDocumentFragment();
  for (const producto of lista) {
    fragmento.append(crearTarjeta(producto));
  }
  grilla.append(fragmento);
}

function mostrarMensaje(texto) {
  grilla.innerHTML = `<p class="mensaje-grilla">${texto}</p>`;
  sinResultado.hidden = true;
}

async function iniciar() {
  mostrarMensaje("Cargando productos...");
  try {
    todosLosProductos = await obtenerProductos();
    llenarGrilla(todosLosProductos);
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudieron cargar los productos. Recargá la página.");
  }
}

buscador.addEventListener("input", () => {
  const texto = buscador.value.trim().toLowerCase();
  const filtrados = todosLosProductos.filter((p) =>
    p.nombre.toLowerCase().includes(texto)
  );
  llenarGrilla(filtrados);
});

iniciar();

const modalExito = document.querySelector("#modal-exito");
const modalTexto = modalExito.querySelector(".modal-texto");

// cerrar con el botón
modalExito.querySelector(".modal-cerrar").addEventListener("click", () => {
  modalExito.close();
});

// mostrar el modal con el nombre del producto
function mostrarExito(producto) {
  modalTexto.textContent = `"${producto.nombre}" se agregó al carrito.`;
  modalExito.showModal();
}