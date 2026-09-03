import { montarCatalogo } from "./tarjetasProductos.js";


//guardo las direcciones
const pista = document.getElementById('pista-marcas');
const btnIzq = document.getElementById('btn-izq');
const btnDer = document.getElementById('btn-der');

//hace que no se pueda hacer click mientras la animacion esta en curso
    let enMovimiento = false; 

    // boton izquierdo
    btnIzq.addEventListener('click', () => {
        
        if (enMovimiento) return;   
        enMovimiento = true;

        
        const primeraImagen = pista.firstElementChild;
        const tamaño = primeraImagen.offsetWidth + 40; 

        
    
        primeraImagen.style.transition = "margin-left 0.4s ease-in-out";
        primeraImagen.style.marginLeft = `-${tamaño}px`;

    
        setTimeout(() => {
            primeraImagen.style.transition = "none";
            primeraImagen.style.marginLeft = "0"; 
            pista.appendChild(primeraImagen); 
            
            enMovimiento = false; 
        }, 400);
    });

// boton derecho
btnDer.addEventListener('click', () => {
    if (enMovimiento) return;
    enMovimiento = true;

    const ultimaImagen = pista.lastElementChild;
    const tamaño = ultimaImagen.offsetWidth + 40;

    
    pista.prepend(ultimaImagen);
    
    
    ultimaImagen.style.transition = "none";
    ultimaImagen.style.marginLeft = `-${tamaño}px`;

    
    setTimeout(() => {
        ultimaImagen.style.transition = "margin-left 0.4s ease-in-out";
        ultimaImagen.style.marginLeft = "0";
    }, 20);

  
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


