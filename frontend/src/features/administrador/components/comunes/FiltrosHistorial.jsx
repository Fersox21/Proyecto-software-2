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
    <section
      className="hist-filtros dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
      aria-label="Filtros del historial"
    >
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
                className={`hist-chip${
                  seleccionado
                    ? ' hist-chip-activo dark:bg-blue-600 dark:border-blue-500 dark:text-white'
                    : ' dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                }`}
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
          <label htmlFor="hist-busqueda" className="dark:text-slate-300">Buscar</label>
          <input
            id="hist-busqueda"
            type="search"
            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
          />
        </div>

        {conRangoFechas && (
          <>
            <div className="orden-campo hist-campo-fecha">
              <label htmlFor="hist-desde" className="dark:text-slate-300">Desde</label>
              <input
                id="hist-desde"
                type="date"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                value={desde}
                onChange={(e) => onDesdeChange?.(e.target.value)}
              />
            </div>
            <div className="orden-campo hist-campo-fecha">
              <label htmlFor="hist-hasta" className="dark:text-slate-300">Hasta</label>
              <input
                id="hist-hasta"
                type="date"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                value={hasta}
                onChange={(e) => onHastaChange?.(e.target.value)}
              />
            </div>
          </>
        )}

        <span className="hist-conteo dark:text-slate-400">
          Mostrando {totalVisibles} de {totalRegistros}
        </span>

        <button
          type="button"
          className="orden-btn orden-btn-chico dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
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
