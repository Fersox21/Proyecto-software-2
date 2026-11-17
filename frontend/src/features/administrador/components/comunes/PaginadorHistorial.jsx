function PaginadorHistorial({ paginaActual, totalPaginas, totalRegistros, porPagina = 25, onCambiarPagina }) {
  if (totalRegistros === 0) return null

  const inicio = (paginaActual - 1) * porPagina + 1
  const fin = Math.min(paginaActual * porPagina, totalRegistros)

  return (
    <div className="tabla-admin-pie hist-paginador">
      <span className="info-pag">
        Mostrando {inicio}–{fin} de {totalRegistros}
      </span>
      <div className="control-pag">
        <button
          type="button"
          className="btn-pag"
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <span className="nums-pag">
          {paginaActual} / {totalPaginas}
        </span>
        <button
          type="button"
          className="btn-pag"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default PaginadorHistorial
