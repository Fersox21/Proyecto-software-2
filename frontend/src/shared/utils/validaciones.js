export function esRequerido(valor) {
  return String(valor ?? '').trim() !== ''
}

const TECLAS_CONTROL = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
])

export function bloquearTeclasNoNumericas(e, permitirDecimal = false) {
  if (e.ctrlKey || e.metaKey || e.altKey || TECLAS_CONTROL.has(e.key)) {
    return
  }

  if (/^[0-9]$/.test(e.key)) {
    return
  }

  if (permitirDecimal && e.key === '.') {
    const valorActual = String(e.currentTarget?.value ?? '')
    if (!valorActual.includes('.')) {
      return
    }
  }

  e.preventDefault()
}

export function sanitizarEnteroPositivo(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

export function sanitizarDecimalPositivo(valor) {
  const limpio = String(valor ?? '').replace(/[^0-9.]/g, '')
  const partes = limpio.split('.')
  if (partes.length <= 2) return limpio
  return `${partes[0]}.${partes.slice(1).join('')}`
}
