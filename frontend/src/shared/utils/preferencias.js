// Preferencias de la interfaz (tema y tamaño de fuente).
// Se guardan en localStorage y se aplican como atributos en <html>:
//   data-tema  -> "claro" | "oscuro"  (resuelve "sistema" según el sistema operativo)
//   data-fuente -> "chica" | "normal" | "grande"
// El CSS del panel de administración lee estos atributos (ver variables.css).

const CLAVE_TEMA = 'preferencia-tema'
const CLAVE_FUENTE = 'preferencia-fuente'

export const TEMAS = ['claro', 'oscuro', 'sistema']
export const FUENTES = ['chica', 'normal', 'grande']

function leer(clave, valoresPermitidos, defecto) {
  try {
    const valor = localStorage.getItem(clave)
    return valoresPermitidos.includes(valor) ? valor : defecto
  } catch {
    return defecto
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    // localStorage no disponible (modo privado): la preferencia no persiste.
  }
}

export function leerTema() {
  return leer(CLAVE_TEMA, TEMAS, 'sistema')
}

export function leerFuente() {
  return leer(CLAVE_FUENTE, FUENTES, 'normal')
}

export function guardarTema(tema) {
  if (TEMAS.includes(tema)) escribir(CLAVE_TEMA, tema)
}

export function guardarFuente(fuente) {
  if (FUENTES.includes(fuente)) escribir(CLAVE_FUENTE, fuente)
}

// Convierte la preferencia "sistema" en el tema real según el SO.
export function resolverTema(tema = leerTema()) {
  if (tema !== 'sistema') return tema
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

// Aplica las preferencias como atributos en <html>. Se ejecuta antes del render
// (main.jsx) para evitar un destello del tema incorrecto al cargar.
export function aplicarPreferencias(tema = leerTema(), fuente = leerFuente()) {
  const html = document.documentElement
  const temaResuelto = resolverTema(tema)
  html.dataset.tema = temaResuelto
  html.classList.toggle('dark', temaResuelto === 'oscuro')
  html.dataset.fuente = fuente
}
