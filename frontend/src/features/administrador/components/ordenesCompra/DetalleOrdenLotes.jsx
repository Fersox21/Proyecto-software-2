import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'

function DetalleOrdenLotes({ detalle, productosPorId, numeroOrden }) {
  if (detalle.cargando) {
    return <p className="orden-detalle-estado">Cargando lotes...</p>
  }

  if (detalle.error) {
    return (
      <p className="orden-detalle-estado orden-detalle-error" role="alert">
        {detalle.error}
      </p>
    )
  }

  const lotes = detalle.orden?.lotes ?? []

  if (lotes.length === 0) {
    return <p className="orden-detalle-estado">Esta orden no tiene lotes cargados.</p>
  }

  return (
    <table className="orden-tabla-lotes">
      <caption className="orden-visually-hidden">
        {numeroOrden != null ? `Lotes de la orden #${numeroOrden}` : 'Lotes de la orden'}
      </caption>
      <thead>
        <tr>
          <th scope="col">Lote</th>
          <th scope="col">Producto</th>
          <th scope="col">Cantidad</th>
          <th scope="col">Total lote</th>
          <th scope="col">Fecha de arribo</th>
          <th scope="col">Fecha de vencimiento</th>
        </tr>
      </thead>
      <tbody>
        {lotes.map((lote, index) => {
          const idProducto = lote.producto?.id
          const nombre = productosPorId[idProducto] || lote.producto?.nombre
          const productoEliminado = lote.producto?.activo === false

          return (
            <tr key={lote.id ?? `${idProducto}-${lote.fechaVencimiento}-${index}`}>
              <td>
                <strong>#{index + 1}</strong>
              </td>
              <td>
                {nombre || 'Sin producto'}
                {productoEliminado && (
                  <span className="hist-item-eliminado-tag">Producto eliminado</span>
                )}
              </td>
              <td>{lote.cantidad} Unidades</td>
              <td className="orden-col-monto">
                {(lote.total ?? lote.precioTotal) != null
                  ? formatearPrecio(lote.total ?? lote.precioTotal)
                  : '—'}
              </td>
              <td>{formatearFecha(lote.fechaArribo)}</td>
              <td>{formatearFecha(lote.fechaVencimiento)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default DetalleOrdenLotes
