import { montarCatalogo } from "./tarjetasProductos.js";

const pista = document.getElementById('pista-marcas');
const btnIzq = document.getElementById('btn-izq');
const btnDer = document.getElementById('btn-der');

// Candado para evitar errores si el usuario hace clic muy rápido
let enMovimiento = false; 

// FLECHA DERECHA (Avanzar)
btnIzq.addEventListener('click', () => {
    if (enMovimiento) return;
    enMovimiento = true;

    const primeraImagen = pista.firstElementChild;
    // Calculamos el ancho de la imagen + los 40px del "gap" que pusiste en tu CSS
    const tamaño = primeraImagen.offsetWidth + 40; 

    // 1. Animamos el margen para que toda la fila se deslice hacia la izquierda
    primeraImagen.style.transition = "margin-left 0.4s ease-in-out";
    primeraImagen.style.marginLeft = `-${tamaño}px`;

    // 2. Esperamos 400ms (lo que dura la animación) para hacer el truco invisible
    setTimeout(() => {
        primeraImagen.style.transition = "none"; // Apagamos la animación
        primeraImagen.style.marginLeft = "0"; // Reseteamos el margen
        pista.appendChild(primeraImagen); // Mandamos la imagen al fondo de la fila
        
        enMovimiento = false; // Abrimos el candado
    }, 400);
});

// FLECHA IZQUIERDA (Retroceder)
btnDer.addEventListener('click', () => {
    if (enMovimiento) return;
    enMovimiento = true;

    const ultimaImagen = pista.lastElementChild;
    const tamaño = ultimaImagen.offsetWidth + 40;

    // 1. Mandamos la última imagen al frente de forma instantánea
    pista.prepend(ultimaImagen);
    
    // 2. La escondemos "tirada" hacia la izquierda sin animación para que no se vea el salto
    ultimaImagen.style.transition = "none";
    ultimaImagen.style.marginLeft = `-${tamaño}px`;

    // 3. Le damos al navegador unos milisegundos para que procese el paso anterior y ¡deslizamos!
    setTimeout(() => {
        ultimaImagen.style.transition = "margin-left 0.4s ease-in-out";
        ultimaImagen.style.marginLeft = "0";
    }, 20);

    // 4. Abrimos el candado cuando todo termine
    setTimeout(() => {
        enMovimiento = false;
    }, 400);
});

/* Productos destacados */

const modal = document.querySelector("#modal-exito");
const modalTexto = modal.querySelector(".modal-texto");
modal.querySelector(".modal-cerrar").addEventListener("click", () => modal.close());

montarCatalogo({
  origen: "productosDestacados.json",
  contenedor: "#sec-prod-dest",
  template: "#temp-card-dest",
  onAgregar: (producto) => {
    modalTexto.textContent = `"${producto.nombre}" se agregó al carrito.`;
    modal.showModal();
  },
});