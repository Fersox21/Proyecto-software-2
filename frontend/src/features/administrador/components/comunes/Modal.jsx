import { useEffect, useRef } from 'react'

const SELECTOR_ENFOCABLES =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Modal({ titulo, onCerrar, children, tamanio = 'normal' }) {
  const cajaRef = useRef(null)
  const alCerrarRef = useRef(onCerrar)

  useEffect(() => {
    alCerrarRef.current = onCerrar
  })

  useEffect(() => {
    const enfocadoPrevio = document.activeElement
    const overflowPrevio = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const caja = cajaRef.current
    const primerEnfocable =
      caja?.querySelector('[data-autofocus]') ?? caja?.querySelector(SELECTOR_ENFOCABLES)
    if (primerEnfocable instanceof HTMLElement) primerEnfocable.focus()

    const manejarTecla = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        alCerrarRef.current()
        return
      }

      if (evento.key !== 'Tab' || !caja) return

      const enfocables = Array.from(caja.querySelectorAll(SELECTOR_ENFOCABLES))
      if (enfocables.length === 0) return

      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', manejarTecla)

    return () => {
      document.removeEventListener('keydown', manejarTecla)
      document.body.style.overflow = overflowPrevio
      if (enfocadoPrevio instanceof HTMLElement) enfocadoPrevio.focus()
    }
  }, [])

  const cerrarAlClicFuera = (evento) => {
    if (evento.target === evento.currentTarget) onCerrar()
  }

  return (
    <div className="orden-modal-overlay" onMouseDown={cerrarAlClicFuera}>
      <div
        ref={cajaRef}
        className={`orden-modal orden-modal-${tamanio}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="orden-modal-titulo"
      >
        <header className="orden-modal-cabecera">
          <h2 className="orden-modal-titulo" id="orden-modal-titulo">
            {titulo}
          </h2>
          <button type="button" className="orden-modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </header>

        {children}
      </div>
    </div>
  )
}

export default Modal
