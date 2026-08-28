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
  catalogo.filtrar(e.target.value);
});