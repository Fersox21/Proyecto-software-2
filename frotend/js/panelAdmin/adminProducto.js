const molde = document.querySelector("#temp-tabla-admin");
const tbody = document.querySelector("#tabla-admin-body");

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
    stock: Number(fila.stock ?? 0),
  }));
}

function crearFila(producto){
    const fila = molde.content.cloneNode(true);

    fila.querySelector(".col-nombre").textContent = producto.nombre;
    fila.querySelector(".col-categoria").textContent = producto.categoria;
    fila.querySelector(".col-precio").textContent = formatoPrecio.format(producto.precio);
    fila.querySelector(".col-stock").textContent = producto.stock;
    
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

function cargarProductos(lista){
    tbody.innerHTML = "";

    const fragmento = document.createDocumentFragment();
    for (const producto of lista){
        fragmento.append(crearFila(producto));
    }
    tbody.append(fragmento);
}

async function iniciar(){
    const productos = await obtenerProductos("productos.json");
    cargarProductos(productos);
}

iniciar();