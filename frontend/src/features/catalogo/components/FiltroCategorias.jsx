import { capitalizar } from '../../../shared/utils/formato'

function FiltroCategorias({ categorias, seleccionada, onSeleccionar, productos = [] }) {
  // Cuenta cuántos productos hay por categoría
  const contarPorCategoria = (cat) => {
    if (cat === 'todas') return productos.length
    return productos.filter((p) => p.categoria?.toLowerCase() === cat.toLowerCase()).length
  }

  return (
    <div className="mb-2">
      <span className="rotulo-filtro">Categorías</span>
      <div className="lista-categorias-tag">
        {['todas', ...categorias].map((categoria) => {
          const total = contarPorCategoria(categoria)
          const esActiva = categoria === seleccionada

          return (
            <button
              key={categoria}
              type="button"
              className={`item-categoria-btn ${esActiva ? 'activa' : ''}`}
              aria-pressed={esActiva}
              onClick={() => onSeleccionar(categoria)}
            >
              <span>{capitalizar(categoria)}</span>
              <span className="badge-contador">{total}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FiltroCategorias