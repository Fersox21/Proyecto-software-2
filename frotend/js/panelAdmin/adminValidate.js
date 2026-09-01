const CONTRASENA_CORRECTA = "123";
const PAGINA_DESTINO = "adminProductos.html";
 
// Se llama desde el onclick="login(event)" del botón
function login(event) {
  event.preventDefault(); // evita que el form recargue la página
 
  const input = document.querySelector("#contraseña");
  const valor = input.value.trim();
 
  if (valor === CONTRASENA_CORRECTA) {
    window.location.href = PAGINA_DESTINO;
  } else {
    mostrarError(input);
  }
}
 
function mostrarError(input) {
  let mensaje = document.querySelector("#login-error");
 
  // si el <p> de error no existe en el HTML, lo crea una sola vez
  if (!mensaje) {
    mensaje = document.createElement("p");
    mensaje.id = "login-error";
    mensaje.className = "login-error";
    mensaje.textContent = "Contraseña incorrecta. Intentá de nuevo.";
    input.insertAdjacentElement("afterend", mensaje);
  }
 
  mensaje.hidden = false;
  input.value = "";
  input.focus();
}