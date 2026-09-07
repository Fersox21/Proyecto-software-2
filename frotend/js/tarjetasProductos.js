const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

async function obtenerProductos(origen) {
  try {
    const respuesta = await fetch(origen);
    if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
    const productos = await respuesta.json();
    return productos.map((producto) => ({
      id: producto.id ?? producto.id_producto,
      nombre: producto.nombre ?? "",
      precio: Number(producto.precio ?? 0),
      imagen: producto.imagen ?? producto.url_imagen ?? "",
      descripcion: producto.descripcion ?? "",
      categoria: producto.categoria ?? "otros",
    }));
  } catch (error){
    console.log("Error en fetch", error.message);
  }
}

export async function montarCatalogo({ origen, contenedor, template, onAgregar }) {
  const grilla = document.querySelector(contenedor);
  const molde = document.querySelector(template);
  let todos = [];

  function crearTarjeta(producto) {
    const moldecito = molde.content.cloneNode(true);
    moldecito.querySelector(".card-nom").textContent = producto.nombre;
    moldecito.querySelector(".card-prec").textContent = formatoPrecio.format(producto.precio);
    const boton = moldecito.querySelector(".card-butt");
    boton.textContent = "Agregar al carrito";
    const img = moldecito.querySelector(".card-img");
    img.src = producto.imagen || "Resources/Img/Product-Images/placeholder.webp";
    img.alt = producto.nombre;
    moldecito.querySelector(".card-desc").textContent = producto.descripcion;
    if (onAgregar) boton.addEventListener("click", () => onAgregar(producto));
    return moldecito;
  }

  function render(lista) {
    if (lista.length === 0) {
      grilla.innerHTML = `<p class="mensaje-grilla">No se encontraron productos.</p>`;
      return;
    }
    grilla.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const p of lista) frag.append(crearTarjeta(p));
    grilla.append(frag);
  }

  grilla.innerHTML = `<p class="mensaje-grilla">Cargando productos...</p>`;
  try {
    todos = await obtenerProductos(origen);
    render(todos);
  } catch (error) {
    console.error(error);
    grilla.innerHTML = `<p class="mensaje-grilla">No se pudieron cargar los productos.</p>`;
  }

    // Guardamos los criterios activos y una función que los aplica todos juntos.
  let criterios = { texto: "", categorias: [], precioMax: Infinity };

  function aplicarCriterios() {
    const q = criterios.texto.trim().toLowerCase();
    render(
      todos.filter((p) => {
        const okTexto = p.nombre.toLowerCase().includes(q);
        const okCategoria =
          criterios.categorias.length === 0 ||
          criterios.categorias.includes(p.categoria);
        const okPrecio = p.precio <= criterios.precioMax;
        return okTexto && okCategoria && okPrecio;
      })
    );
  }

  return {
    buscar(texto) {
      criterios.texto = texto;
      aplicarCriterios();
    },
    filtrar(nuevos) {
      criterios = { ...criterios, ...nuevos };
      aplicarCriterios();
    },
  };
}