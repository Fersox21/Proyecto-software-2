const molde = document.querySelector("#temp-tabla-admin");
const tbody = document.querySelector("#tabla-admin-body");
const pagInfo = document.querySelector("#info-pag");
const pagNums = document.querySelector("#nums-pag");
const pagAnt = document.querySelector("#anterior-pag");
const pagSig = document.querySelector("#siguiente-pag");
const porPagina = 10;
let listaActual = [];
let paginaActual = 1;


const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

async function obtenerProductos(origen) {
  const respuesta = await fetch(origen);

  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
  const filas = await respuesta.json();

  return filas.map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria ?? "otros",
    precio: Number(fila.precio ?? 0),
    descripcion: fila.descripcion ?? "",
    stock: Number(fila.stock ?? 0),
  }));
}

function crearFila(producto){
    const fila = molde.content.cloneNode(true);

    fila.querySelector(".col-nombre").textContent = producto.nombre;
    fila.querySelector(".col-categoria").textContent = producto.categoria;
    fila.querySelector(".col-precio").textContent = formatoPrecio.format(producto.precio);
    fila.querySelector(".col-stock").textContent = producto.stock;
    fila.querySelector(".col-descripcion").textContent = producto.descripcion;

    const stock = producto.stock;
    const estado = fila.querySelector(".col-estado");
    let texto, clase;
    if (stock === 0) {
        texto = "Sin stock";
        clase = "sin-stock";
    } else if (stock <= 20) {
        texto = "Stock bajo";
        clase = "poco-stock";
    } else {
        texto = "En stock";
        clase = "en-stock";
    }

    estado.textContent = texto;
    estado.classList.add(clase);

    fila.querySelector(".col-acciones").textContent = "Todavia nada";

    return fila;
}

function cargarProductos(lista) {
  listaActual = lista;
  paginaActual = 1;
  dibujar();
}

function dibujar() {
  const total = listaActual.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  const pagina = listaActual.slice(inicio, fin);

  tbody.innerHTML = "";
  const fragmento = document.createDocumentFragment();
  for (const producto of pagina) {
    fragmento.append(crearFila(producto));
  }
  tbody.append(fragmento);

  dibujarPie(inicio, fin, total, totalPaginas);
}

function dibujarPie(inicio, fin, total, totalPaginas) {
  const desde = total === 0 ? 0 : inicio + 1;
  const hasta = Math.min(fin, total);
  pagInfo.textContent = `Mostrando ${desde}–${hasta} de ${total}`;

  pagAnt.disabled = paginaActual === 1;
  pagSig.disabled = paginaActual === totalPaginas;

  pagNums.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i++) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = i;
    boton.className = "pag-num";
    if (i === paginaActual) boton.classList.add("activo");
    boton.addEventListener("click", () => {
      paginaActual = i;
      dibujar();
    });
    pagNums.append(boton);
  }
}

pagAnt.addEventListener("click", () => { paginaActual--; dibujar(); });
pagSig.addEventListener("click", () => { paginaActual++; dibujar(); });

async function iniciar(){
    const productos = await obtenerProductos("productos.json");
    cargarProductos(productos);
}

iniciar();