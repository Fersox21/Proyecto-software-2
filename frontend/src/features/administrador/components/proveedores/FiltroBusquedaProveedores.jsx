function FiltroBusquedaProveedores({
  busqueda,
  onBusquedaChange,
  onLimpiar,
  totalVisibles,
  totalProveedores,
}) {
  return (
    <section className="proveedores-filtros" aria-label="Buscar proveedores">
      <div className="orden-campo proveedores-campo-busqueda">
        <label htmlFor="proveedores-busqueda">Buscar proveedor</label>
        <input
          id="proveedores-busqueda"
          type="search"
          placeholder="Nombre, teléfono o #ID..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          autoComplete="off"
        />
      </div>

      <span className="proveedores-conteo">
        Mostrando {totalVisibles} de {totalProveedores} proveedores
      </span>

      <button
        type="button"
        className="orden-btn orden-btn-chico"
        onClick={onLimpiar}
        disabled={busqueda.trim() === ''}
      >
        Limpiar búsqueda
      </button>
    </section>
  )
}

export default FiltroBusquedaProveedores
