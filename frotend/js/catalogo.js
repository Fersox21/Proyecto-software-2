import { montarCatalogo } from "./tarjetasProductos.js";

const modal = document.querySelector("#modal-exito");
const modalTexto = modal.querySelector(".modal-texto");
modal.querySelector(".modal-cerrar").addEventListener("click", () => modal.close());

const catalogo = await montarCatalogo({
  origen: "productos.json",
  contenedor: "#sec-prod",
  template: "#temp-card",
  onAgregar: (producto) => {
    modalTexto.textContent = `"${producto.nombre}" se agregó al carrito.`;
    modal.showModal();
  },
});

// El buscador solo existe en esta página:
document.querySelector("#buscador").addEventListener("input", (e) => {
  catalogo.buscar(e.target.value);
});

// ---------- Panel de filtros ----------
const btnFiltros    = document.querySelector("#btn-filtros");
const panel         = document.querySelector("#panel-filtros");
const fondo         = document.querySelector("#fondo-filtros");
const btnCerrar     = document.querySelector("#btn-cerrar-filtros");
const form          = document.querySelector("#form-filtros");
const precioMax     = document.querySelector("#precio-max");
const precioMaxVal  = document.querySelector("#precio-max-valor");

function abrirPanel() {
  panel.classList.add("abierto");
  fondo.hidden = false;
  btnFiltros.setAttribute("aria-expanded", "true");
  panel.setAttribute("aria-hidden", "false");
}

function cerrarPanel() {
  panel.classList.remove("abierto");
  fondo.hidden = true;
  btnFiltros.setAttribute("aria-expanded", "false");
  panel.setAttribute("aria-hidden", "true");
}

btnFiltros.addEventListener("click", abrirPanel);
btnCerrar.addEventListener("click", cerrarPanel);
fondo.addEventListener("click", cerrarPanel);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarPanel();
});

// mostrar el valor del rango mientras se mueve
precioMax.addEventListener("input", () => {
  precioMaxVal.textContent = `$${Number(precioMax.value).toLocaleString("es-AR")}`;
});

// aplicar filtros
form.addEventListener("submit", (e) => {
  e.preventDefault();                      // que no recargue la página
  const datos = new FormData(form);
  catalogo.filtrar({
    categorias: datos.getAll("categoria"), // array con los checkboxes marcados
    precioMax: Number(datos.get("precioMax")),
  });
  cerrarPanel();
});

// limpiar
form.addEventListener("reset", () => {
  setTimeout(() => {                        // esperar a que el form se vacíe
    catalogo.filtrar({ categorias: [], precioMax: Infinity });
    precioMaxVal.textContent = "$5.000";
  });
});

const paramsFooter = new URLSearchParams(window.location.search);
const categoriaFooter = paramsFooter.get('categoria');

if (categoriaFooter) {
  // 1. Filtramos el catálogo usando tu método existente
  catalogo.filtrar({
    categorias: [categoriaFooter], // Lo pasamos como array porque tu lógica usa datos.getAll()
    precioMax: Infinity            // O el valor máximo que uses por defecto
  });

  // 2. Tildamos el checkbox correspondiente en el panel para que la interfaz quede sincronizada
  const checkboxFiltro = form.querySelector(`input[name="categoria"][value="${categoriaFooter}"]`);
  if (checkboxFiltro) {
    checkboxFiltro.checked = true;
  }
}