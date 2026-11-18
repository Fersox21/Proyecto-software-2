function PaginadorHistorial({ paginaActual, totalPaginas, totalRegistros, porPagina = 25, onCambiarPagina }) {
  if (totalRegistros === 0) return null

  const inicio = (paginaActual - 1) * porPagina + 1
  const fin = Math.min(paginaActual * porPagina, totalRegistros)

  return (
    <div className="tabla-admin-pie hist-paginador dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
      <span className="info-pag dark:text-slate-300">
        Mostrando {inicio}–{fin} de {totalRegistros}
      </span>
      <div className="control-pag">
        <button
          type="button"
          className="btn-pag dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <span className="nums-pag dark:text-slate-200">
          {paginaActual} / {totalPaginas}
        </span>
        <button
          type="button"
          className="btn-pag dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
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
