import { Fragment } from 'react'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import DetalleOrdenLotes from './DetalleOrdenLotes'

function nombreProveedor(orden) {
  if (orden?.proveedor?.nombre) return orden.proveedor.nombre
  if (orden?.proveedor?.id != null) return `Proveedor #${orden.proveedor.id}`
  return 'Sin proveedor'
}

function FilaOrdenCompra({
  orden,
  detalle,
  productosPorId,
  onAlternarDetalle,
  onEditar,
  onEliminar,
}) {
  const abierta = detalle?.id === orden.id

  return (
    <Fragment>
      <tr>
        <td className="orden-col-id">{orden.id}</td>
        <td>{formatearFecha(orden.fecha)}</td>
        <td>{nombreProveedor(orden)}</td>
        <td className="orden-col-monto">{formatearPrecio(orden.total)}</td>
        <td className="orden-col-acciones">
          <div className="orden-acciones">
            <button
              type="button"
              className="orden-btn orden-btn-chico"
              onClick={() => onAlternarDetalle(orden)}
              aria-expanded={abierta}
              aria-controls={`orden-lotes-${orden.id}`}
            >
              {abierta ? 'Ocultar lotes' : 'Ver lotes'}
            </button>
            <button
              type="button"
              className="orden-btn orden-btn-chico"
              onClick={() => onEditar(orden)}
            >
              Editar
            </button>
            <button
              type="button"
              className="orden-btn orden-btn-chico orden-btn-peligro"
              onClick={() => onEliminar(orden)}
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>

      {abierta && (
        <tr className="orden-fila-detalle">
          <td colSpan={5} id={`orden-lotes-${orden.id}`}>
            <DetalleOrdenLotes
              detalle={detalle}
              productosPorId={productosPorId}
              ordenId={orden.id}
            />
          </td>
        </tr>
      )}
    </Fragment>
  )
}

export default FilaOrdenCompra
