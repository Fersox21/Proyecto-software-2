import { LuPackageOpen } from 'react-icons/lu'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'

function DetallePedidoItems({ items = [], total = 0 }) {
  return (
    <div className="detalle-pedido-seccion">
      <h3 className="detalle-subtitulo">Productos del Pedido</h3>
      {items.length === 0 ? (
        <div className="detalle-vacio">
          <LuPackageOpen size={40} className="detalle-vacio-icono" aria-hidden="true" />
          <p className="detalle-vacio-texto">No hay productos registrados en este pedido.</p>
        </div>
      ) : (
        <div
          className="tabla-detalle-contenedor"
          style={{
            maxHeight: '280px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        >
          <table className="tabla-items-pedido" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#f9fafb',
                zIndex: 1,
              }}
            >
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th style={{ textAlign: 'right' }}>Precio Unitario</th>
                <th style={{ textAlign: 'center' }}>Cantidad</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const nombre = item.producto?.nombre || item.nombre || `Producto ${index + 1}`
                const marca = item.producto?.marca || item.marca || '-'
                const precio = item.precio != null ? item.precio : (item.precioVenta || 0)
                const cantidad = item.cantidad || 0
                const subtotal = item.subtotal != null ? item.subtotal : precio * cantidad

                return (
                  <tr key={item.id || item.producto_id || index} className={item.eliminado ? 'hist-fila-eliminada' : ''}>
                    <td>
                      <div>
                        {nombre}
                        {item.eliminado && <span className="hist-item-eliminado-tag">Eliminado</span>}
                      </div>
                      {Array.isArray(item.lotesUsados) && item.lotesUsados.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.2rem' }}>
                          Lotes:{' '}
                          {item.lotesUsados.map((l, i) => (
                            <span
                              key={i}
                              style={{
                                display: 'inline-block',
                                marginRight: '0.35rem',
                                padding: '0.1rem 0.35rem',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '3px',
                                border: '1px solid #e5e7eb',
                              }}
                            >
                              Lote #{i + 1}
                              {l.fechaVencimiento ? ` · vto. ${formatearFecha(l.fechaVencimiento)}` : ''}
                              {` (${l.cantidad} u.${l.consumidoEntero ? ' - entero' : ''})`}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{marca}</td>
                    <td style={{ textAlign: 'right' }}>{formatearPrecio(precio)}</td>
                    <td style={{ textAlign: 'center' }}>{cantidad}</td>
                    <td style={{ textAlign: 'right' }}>{formatearPrecio(subtotal)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#f9fafb',
                zIndex: 1,
                borderTop: '2px solid #e5e7eb',
              }}
            >
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  Total del Pedido:
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {formatearPrecio(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default DetallePedidoItems