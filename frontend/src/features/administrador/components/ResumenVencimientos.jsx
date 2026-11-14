function ResumenVencimientos({ resumen, totalFilas, estado, umbral, onEstadoChange }) {
  return (
    <section className="venc-resumen" aria-label="Resumen de vencimientos">
      <button
        type="button"
        className={`venc-tarjeta venc-tarjeta-vencido ${estado === 'vencido' ? 'activa' : ''}`}
        onClick={() => onEstadoChange(estado === 'vencido' ? 'todos' : 'vencido')}
        aria-pressed={estado === 'vencido'}
      >
        <span className="venc-tarjeta-valor">{resumen.vencido}</span>
        <span className="venc-tarjeta-etiqueta">Vencidos</span>
      </button>

      <button
        type="button"
        className={`venc-tarjeta venc-tarjeta-proximo ${estado === 'proximo' ? 'activa' : ''}`}
        onClick={() => onEstadoChange(estado === 'proximo' ? 'todos' : 'proximo')}
        aria-pressed={estado === 'proximo'}
      >
        <span className="venc-tarjeta-valor">{resumen.proximo}</span>
        <span className="venc-tarjeta-etiqueta">Próximos ({umbral} días)</span>
      </button>

      <button
        type="button"
        className={`venc-tarjeta venc-tarjeta-ok ${estado === 'en-regla' ? 'activa' : ''}`}
        onClick={() => onEstadoChange(estado === 'en-regla' ? 'todos' : 'en-regla')}
        aria-pressed={estado === 'en-regla'}
      >
        <span className="venc-tarjeta-valor">{resumen['en-regla']}</span>
        <span className="venc-tarjeta-etiqueta">En regla</span>
      </button>

      <div className="venc-tarjeta venc-tarjeta-total">
        <span className="venc-tarjeta-valor">{totalFilas}</span>
        <span className="venc-tarjeta-etiqueta">Lotes totales</span>
      </div>
    </section>
  )
}

export default ResumenVencimientos
