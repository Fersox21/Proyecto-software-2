import { Fragment } from 'react'
import { LuPackage, LuPencil, LuTrash2 } from 'react-icons/lu'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import DetalleOrdenLotes from './DetalleOrdenLotes'

function nombreProveedor(orden) {
  if (orden?.proveedor?.nombre) return orden.proveedor.nombre
  if (orden?.proveedor?.id != null) return `Proveedor #${orden.proveedor.id}`
  return 'Sin proveedor'
}

function FilaOrdenCompra({
  orden,
  numeroFila,
  detalle,
  productosPorId,
  onAlternarDetalle,
  onEditar,
  onEliminar,
}) {
  const abierta = detalle?.id === orden.id
  const etiquetaLotes = abierta ? 'Ocultar lotes' : 'Ver lotes'

  return (
    <Fragment>
      <tr>
        <td className="orden-col-orden">
          <div className="orden-id-fecha">
            <span className="orden-id">#{numeroFila}</span>
            <span className="orden-fecha">{formatearFecha(orden.fecha)}</span>
          </div>
        </td>
        <td className="orden-col-proveedor">{nombreProveedor(orden)}</td>
        <td className="orden-col-monto">{formatearPrecio(orden.total)}</td>
        <td className="orden-col-acciones">
          <div className="orden-acciones">
            <button
              type="button"
              className={`orden-btn-icono orden-btn-lotes${abierta ? ' activo' : ''}`}
              onClick={() => onAlternarDetalle(orden)}
              aria-expanded={abierta}
              aria-controls={`orden-lotes-${orden.id}`}
              aria-label={`${etiquetaLotes} de la orden #${orden.id}`}
              title={etiquetaLotes}
            >
              <LuPackage size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="orden-btn-icono orden-btn-editar"
              onClick={() => onEditar(orden)}
              aria-label={`Editar orden #${orden.id}`}
              title="Editar"
            >
              <LuPencil size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="orden-btn-icono orden-btn-eliminar"
              onClick={() => onEliminar(orden)}
              aria-label={`Eliminar orden #${orden.id}`}
              title="Eliminar"
            >
              <LuTrash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>

      {abierta && (
        <tr className="orden-fila-detalle">
          <td colSpan={4} id={`orden-lotes-${orden.id}`}>
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
