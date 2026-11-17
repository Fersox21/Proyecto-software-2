import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'

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

function calcularDiasRestantes(fechaISO) {
  const soloFecha = String(fechaISO ?? '').slice(0, 10)
  if (!soloFecha) return null
  const vencimiento = new Date(`${soloFecha}T00:00:00`)
  if (Number.isNaN(vencimiento.getTime())) return null

  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  return Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24))
}

function FilaLote({ lote, numeroFila, esUltimoDeSuOrden, onEditar, onEliminar }) {
  const totalLote = lote.total ?? lote.precioTotal
  const proveedor = nombreProveedor(lote)
  const diasRestantes = calcularDiasRestantes(lote.fechaVencimiento)
  const vencimientoCritico = diasRestantes !== null && diasRestantes < 30
  const vencimientoNormal = diasRestantes !== null && diasRestantes >= 30

  let claseVencimiento = 'lotes-vencimiento'
  if (vencimientoCritico) {
    claseVencimiento = 'lotes-vencimiento-critico'
  } else if (vencimientoNormal) {
    claseVencimiento = 'lotes-vencimiento-ok'
  }

  return (
    <tr>
      <td>
        <div className="lotes-celda-doble">
          <span className="lotes-codigo">#{numeroFila}</span>
          <span className="lotes-subtexto">
            {lote.ordenCompra?.id != null ? `Orden: #${lote.ordenCompra.id}` : 'Sin orden'}
          </span>
        </div>
      </td>
      <td>
        <div className="lotes-celda-doble">
          <span className="lotes-principal">{nombreProducto(lote)}</span>
          {lote.producto?.marca ? (
            <span className="lotes-subtexto">{lote.producto.marca}</span>
          ) : null}
        </div>
      </td>
      <td>
        <span className="lotes-proveedor" title={proveedor}>
          {proveedor}
        </span>
      </td>
      <td className="lotes-col-numero lotes-numero">
        {Number(lote.cantidad) === 0 ? (
          <span
            style={{
              display: 'inline-block',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
            }}
          >
            0 (Agotado)
          </span>
        ) : (
          <span>
            {lote.cantidad}
            {lote.cantidadInicial && lote.cantidadInicial !== lote.cantidad ? (
              <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                / {lote.cantidadInicial}
              </span>
            ) : null}
          </span>
        )}
      </td>
      <td className="lotes-col-numero lotes-numero lotes-total">
        {totalLote != null ? formatearPrecio(totalLote) : '—'}
      </td>
      <td>
        <div className="lotes-celda-doble">
          <span className="lotes-subtexto">
            Ingreso: {formatearFecha(lote.fechaArribo)}
          </span>
          <span className={claseVencimiento}>
            Vence: {formatearFecha(lote.fechaVencimiento)}
          </span>
        </div>
      </td>
      <td className="orden-col-acciones">
        <div className="lotes-acciones">
          <button
            type="button"
            className="lotes-btn-icono lotes-btn-editar"
            onClick={() => onEditar(lote)}
            aria-label={`Editar lote #${lote.id}`}
            title="Editar lote"
          >
            <LuPencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="lotes-btn-icono lotes-btn-eliminar"
            onClick={() => onEliminar(lote)}
            disabled={esUltimoDeSuOrden}
            aria-label={`Dar de baja lote #${lote.id}`}
            title={
              esUltimoDeSuOrden
                ? 'La orden de compra debe tener al menos un lote'
                : 'Dar de baja lote'
            }
          >
            <LuTrash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default FilaLote
