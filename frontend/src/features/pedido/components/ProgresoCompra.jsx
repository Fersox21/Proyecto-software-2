import { BsCheckLg } from 'react-icons/bs'

const TAMANIO_CIRCULO = { width: '28px', height: '28px', fontSize: '0.85rem' }

const PASOS = [
  { numero: 1, titulo: 'Carrito', completado: true },
  { numero: 2, titulo: 'Datos y entrega', activo: true },
  { numero: 3, titulo: 'Confirmación' }
]

function estiloCirculo({ completado, activo }) {
  if (completado) {
    return { ...TAMANIO_CIRCULO, backgroundColor: '#212529', color: '#ffffff' }
  }
  if (activo) {
    return { ...TAMANIO_CIRCULO, backgroundColor: '#c59b27', color: '#ffffff' }
  }
  return {
    ...TAMANIO_CIRCULO,
    backgroundColor: '#ffffff',
    color: 'var(--bs-secondary-color)',
    border: '1px solid rgba(108, 117, 125, 0.25)'
  }
}

function ProgresoCompra() {
  return (
    <div className="d-flex align-items-center gap-2 small user-select-none">
      {PASOS.map((paso, indice) => (
        <div key={paso.numero} className="d-flex align-items-center gap-2">
          {indice > 0 && (
            <span
              className="d-inline-block border-bottom border-dark border-opacity-50"
              style={{ width: '40px' }}
            />
          )}

          <span
            className="rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
            style={estiloCirculo(paso)}
          >
            {paso.completado ? <BsCheckLg size={14} /> : paso.numero}
          </span>

          <span className={paso.activo ? 'fw-semibold text-dark' : 'text-secondary'}>
            {paso.titulo}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ProgresoCompra
