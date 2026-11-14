import { formatearFecha } from '../../../shared/utils/formato'

function nombreProducto(lote) {
  if (lote?.producto?.nombre) return lote.producto.nombre
  if (lote?.producto?.id != null) return `Producto #${lote.producto.id}`
  return 'Sin producto'
}

function nombreProveedor(lote) {
  const proveedor = lote?.ordenCompra?.proveedor
  if (proveedor?.nombre) return proveedor.nombre
  if (proveedor?.id != null) return `Proveedor #${proveedor.id}`
  return 'Sin proveedor'
}

function FilaLote({ lote, esUltimoDeSuOrden, onEditar, onEliminar }) {
  return (
    <tr>
      <td className="lotes-codigo">#{lote.id}</td>
      <td>
        {nombreProducto(lote)}
        {lote.producto?.marca ? (
          <span className="lotes-secundario"> · {lote.producto.marca}</span>
        ) : null}
      </td>
      <td>
        {lote.ordenCompra?.id != null ? `#${lote.ordenCompra.id}` : '—'}
      </td>
      <td>{nombreProveedor(lote)}</td>
      <td className="lotes-col-numero lotes-numero">
        {lote.cantidad ?? '—'}
      </td>
      <td>{formatearFecha(lote.fechaArribo)}</td>
      <td>{formatearFecha(lote.fechaVencimiento)}</td>
      <td className="orden-col-acciones">
        <div className="orden-acciones">
          <button
            type="button"
            className="orden-btn orden-btn-chico"
            onClick={() => onEditar(lote)}
          >
            Editar
          </button>
          <button
            type="button"
            className="orden-btn orden-btn-chico orden-btn-peligro"
            onClick={() => onEliminar(lote)}
            disabled={esUltimoDeSuOrden}
            title={
              esUltimoDeSuOrden
                ? 'La orden de compra debe tener al menos un lote'
                : undefined
            }
          >
            Dar de baja
          </button>
        </div>
      </td>
    </tr>
  )
}

export default FilaLote
