import { LuPlus } from 'react-icons/lu'

function FiltroBusquedaProveedores({
  busqueda,
  onBusquedaChange,
  onLimpiar,
  onNuevo,
  totalVisibles,
  totalProveedores,
}) {
  return (
    <section className="proveedores-toolbar" aria-label="Herramientas de proveedores">
      <div className="proveedores-busqueda-grupo">
        <div className="orden-campo proveedores-campo-busqueda">
          <label htmlFor="proveedores-busqueda" className="orden-visually-hidden">
            Buscar proveedor
          </label>
          <input
            id="proveedores-busqueda"
            type="search"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            autoComplete="off"
          />
        </div>

        {busqueda.trim() !== '' && (
          <button type="button" className="orden-btn" onClick={onLimpiar}>
            Limpiar
          </button>
        )}
      </div>

      <div className="proveedores-toolbar-acciones">
        <span className="proveedores-conteo">
          Mostrando {totalVisibles} de {totalProveedores} proveedor
          {totalProveedores === 1 ? '' : 'es'}
        </span>
        <button type="button" className="proveedores-btn-nuevo" onClick={onNuevo}>
          <LuPlus size={18} aria-hidden="true" />
          <span>Nuevo proveedor</span>
        </button>
      </div>
    </section>
  )
}

export default FiltroBusquedaProveedores
