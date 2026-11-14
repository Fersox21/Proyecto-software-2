import { formatearFecha } from '../../../../shared/utils/formato'

function DetalleOrdenLotes({ detalle, productosPorId, ordenId }) {
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
        Lotes de la orden {ordenId}
      </caption>
      <thead>
        <tr>
          <th scope="col">Producto</th>
          <th scope="col">Cantidad</th>
          <th scope="col">Fecha de arribo</th>
          <th scope="col">Fecha de vencimiento</th>
        </tr>
      </thead>
      <tbody>
        {lotes.map((lote) => {
          const idProducto = lote.producto?.id
          const nombre = productosPorId[idProducto]

          return (
            <tr key={lote.id ?? `${idProducto}-${lote.fechaVencimiento}`}>
              <td>
                {nombre ||
                  (idProducto != null
                    ? `Producto #${idProducto}`
                    : 'Sin producto')}
              </td>
              <td>{lote.cantidad} Unidades</td>
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
