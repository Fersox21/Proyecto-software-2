import { Fragment } from 'react'
import { formatearFecha } from '../../../../shared/utils/formato'
import { textoDias } from '../../utils/vencimientos'
import DetalleLote from './DetalleLote'

function FilaVencimiento({ fila, abierta, onAlternarDetalle, onEditar }) {
  return (
    <Fragment>
      <tr>
        <td className="venc-codigo">#{fila.id}</td>
        <td className="venc-fecha">{formatearFecha(fila.fechaVencimiento)}</td>
        <td className="venc-dias">{textoDias(fila.dias)}</td>
        <td>
          {fila.productoNombre}
          {fila.producto?.marca ? (
            <span className="venc-secundario"> · {fila.producto.marca}</span>
          ) : null}
        </td>
        <td>{fila.proveedorNombre}</td>
        <td className="venc-col-numero venc-numero">{fila.cantidad ?? '—'}</td>
        <td className="venc-col-numero venc-numero">
          {fila.producto?.stock ?? '—'}
        </td>
        <td>
          <span className={`venc-badge venc-badge-${fila.estado.clave}`}>
            {fila.estado.etiqueta}
          </span>
        </td>
        <td className="orden-col-acciones">
          <div className="orden-acciones">
            <button
              type="button"
              className="orden-btn orden-btn-chico"
              onClick={() => onAlternarDetalle(fila.id)}
              aria-expanded={abierta}
              aria-controls={`venc-detalle-${fila.id}`}
            >
              {abierta ? 'Ocultar' : 'Ver detalle'}
            </button>
            <button
              type="button"
              className="orden-btn orden-btn-chico"
              onClick={() => onEditar(fila)}
            >
              Editar fecha
            </button>
          </div>
        </td>
      </tr>

      {abierta && (
        <tr className="venc-fila-detalle">
          <td colSpan={9} id={`venc-detalle-${fila.id}`}>
            <DetalleLote lote={fila} />
          </td>
        </tr>
      )}
    </Fragment>
  )
}

export default FilaVencimiento
