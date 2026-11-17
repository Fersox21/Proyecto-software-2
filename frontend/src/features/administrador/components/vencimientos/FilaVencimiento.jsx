import { Fragment } from 'react'
import { LuEye, LuPencil } from 'react-icons/lu'
import { formatearFecha } from '../../../../shared/utils/formato'
import { textoDias } from '../../utils/vencimientos'
import DetalleLote from './DetalleLote'

function FilaVencimiento({ fila, numeroFila, abierta, onAlternarDetalle, onEditar }) {
  return (
    <Fragment>
      <tr>
        <td>
          <div className="venc-prod-celda">
            <span className="venc-prod-nombre">{fila.productoNombre}</span>
            <span className="venc-prod-meta">
              Lote #{numeroFila} · {fila.proveedorNombre}
            </span>
          </div>
        </td>
        <td>
          <div className="venc-fecha-celda">
            <span className="venc-fecha">{formatearFecha(fila.fechaVencimiento)}</span>
            <span className={`venc-dias venc-dias-${fila.estado.clave}`}>
              {textoDias(fila.dias)}
            </span>
          </div>
        </td>
        <td>
          <div className="venc-cantidades-celda">
            <span className="venc-cant-lote">
              Lote: <strong>{fila.cantidad ?? '—'}</strong>
            </span>
            <span className="venc-cant-total">
              Total: {fila.producto?.stock ?? '—'}
            </span>
          </div>
        </td>
        <td>
          <span className={`venc-badge venc-badge-${fila.estado.clave}`}>
            {fila.estado.etiqueta}
          </span>
        </td>
        <td className="orden-col-acciones">
          <div className="venc-acciones">
            <button
              type="button"
              className={`venc-btn-icono venc-btn-ver ${abierta ? 'activo' : ''}`}
              onClick={() => onAlternarDetalle(fila.id)}
              aria-expanded={abierta}
              aria-controls={`venc-detalle-${fila.id}`}
              aria-label={abierta ? `Ocultar detalle del lote #${fila.id}` : `Ver detalle del lote #${fila.id}`}
              title={abierta ? 'Ocultar detalle' : 'Ver detalle'}
            >
              <LuEye size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="venc-btn-icono venc-btn-editar"
              onClick={() => onEditar(fila)}
              aria-label={`Editar fecha de vencimiento del lote #${fila.id}`}
              title="Editar fecha"
            >
              <LuPencil size={16} aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>

      {abierta && (
        <tr className="venc-fila-detalle">
          <td colSpan={5} id={`venc-detalle-${fila.id}`}>
            <DetalleLote lote={fila} />
          </td>
        </tr>
      )}
    </Fragment>
  )
}

export default FilaVencimiento
