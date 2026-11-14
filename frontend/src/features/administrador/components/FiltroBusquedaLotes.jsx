function FiltroBusquedaLotes({ busqueda, onBusquedaChange, onLimpiar, totalVisibles, totalLotes }) {
  return (
    <section className="lotes-filtros" aria-label="Buscar lotes">
      <div className="orden-campo lotes-campo-busqueda">
        <label htmlFor="lotes-busqueda">Buscar</label>
        <input
          id="lotes-busqueda"
          type="search"
          placeholder="Producto, marca, proveedor, orden o #lote"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>

      <span className="lotes-conteo">
        Mostrando {totalVisibles} de {totalLotes} lotes
      </span>

      <button
        type="button"
        className="orden-btn orden-btn-chico"
        onClick={onLimpiar}
        disabled={busqueda === ''}
      >
        Limpiar búsqueda
      </button>
    </section>
  )
}

export default FiltroBusquedaLotes
