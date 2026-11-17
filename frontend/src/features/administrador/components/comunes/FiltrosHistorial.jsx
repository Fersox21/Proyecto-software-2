function FiltrosHistorial({
  chips = [],
  chipActivo,
  onChipChange,
  busqueda,
  onBusquedaChange,
  placeholderBusqueda = 'Buscar...',
  conRangoFechas = false,
  desde = '',
  hasta = '',
  onDesdeChange,
  onHastaChange,
  totalVisibles,
  totalRegistros,
  hayFiltrosActivos,
  onLimpiar,
}) {
  return (
    <section className="hist-filtros" aria-label="Filtros del historial">
      {chips.length > 0 && (
        <div className="hist-chips" role="tablist" aria-label="Filtrar por estado">
          {chips.map((chip) => {
            const seleccionado = chipActivo === chip.clave
            return (
              <button
                key={chip.clave}
                type="button"
                role="tab"
                aria-selected={seleccionado}
                className={`hist-chip${seleccionado ? ' hist-chip-activo' : ''}`}
                onClick={() => onChipChange(chip.clave)}
              >
                <span>{chip.etiqueta}</span>
                {chip.cantidad != null && (
                  <span className="hist-chip-conteo">{chip.cantidad}</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="hist-barra-controles">
        <div className="orden-campo hist-campo-busqueda">
          <label htmlFor="hist-busqueda">Buscar</label>
          <input
            id="hist-busqueda"
            type="search"
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
          />
        </div>

        {conRangoFechas && (
          <>
            <div className="orden-campo hist-campo-fecha">
              <label htmlFor="hist-desde">Desde</label>
              <input
                id="hist-desde"
                type="date"
                value={desde}
                onChange={(e) => onDesdeChange?.(e.target.value)}
              />
            </div>
            <div className="orden-campo hist-campo-fecha">
              <label htmlFor="hist-hasta">Hasta</label>
              <input
                id="hist-hasta"
                type="date"
                value={hasta}
                onChange={(e) => onHastaChange?.(e.target.value)}
              />
            </div>
          </>
        )}

        <span className="hist-conteo">
          Mostrando {totalVisibles} de {totalRegistros}
        </span>

        <button
          type="button"
          className="orden-btn orden-btn-chico"
          onClick={onLimpiar}
          disabled={!hayFiltrosActivos}
        >
          Limpiar
        </button>
      </div>
    </section>
  )
}

export default FiltrosHistorial
