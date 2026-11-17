import Modal from '../comunes/Modal'
import Spinner from '../../../../shared/components/Spinner'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'

function DetalleVentaModal({ venta, cargando, error, onCerrar }) {
  if (!venta && !cargando && !error) return null

  const pedido = venta?.pedido || {}
  const items = venta?.items || venta?.productos || pedido?.items || pedido?.tiene || pedido?.productos || []

  const totalOriginal = Number(venta?.monto ?? venta?.total ?? pedido?.total ?? 0)
  const totalModificado =
    venta?.totalModificado ??
    venta?.total_modificado ??
    pedido?.totalModificado ??
    pedido?.total_modificado ??
    null
  const motivoModificacion =
    venta?.motivoModificacion ??
    venta?.motivo_modificacion ??
    pedido?.motivoModificacion ??
    pedido?.motivo_modificacion ??
    ''

  const fechaPedido = pedido?.fecha ?? venta?.fechaPedido ?? venta?.fecha_pedido
  const personaContacto = pedido?.personaContacto ?? pedido?.persona_contacto
  const modalidadEntrega = pedido?.modalidadEntrega ?? pedido?.modalidad_entrega
  const descripcionDireccion = pedido?.descripcionDireccion ?? pedido?.descripcion_direccion
  const metodoPago = pedido?.metodoPago ?? pedido?.metodo_pago

  return (
    <Modal
      titulo={venta ? `Detalle de Venta #${venta.id}` : 'Cargando Venta'}
      onCerrar={onCerrar}
      tamanio="grande"
    >
      {cargando ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Spinner texto="Cargando detalles de la venta..." />
        </div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: 'var(--admin-peligro, #e53e3e)' }}>
          <p>{error}</p>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button type="button" className="orden-btn" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="detalle-pedido-modal-contenido">
          <div className="detalle-pedido-seccion">
            <h3 className="detalle-subtitulo">Información de la Venta</h3>
            <div className="detalle-grid">
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Fecha de Venta / Aprobación:</span>
                <span className="detalle-valor">
                  {venta.fecha ? formatearFecha(venta.fecha) : 'No especificada'}
                </span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Total Original:</span>
                <span className="detalle-valor">{formatearPrecio(totalOriginal)}</span>
              </div>
              {totalModificado != null && (
                <div className="detalle-campo">
                  <span className="detalle-etiqueta">Total Modificado:</span>
                  <span className="detalle-valor">{formatearPrecio(totalModificado)}</span>
                </div>
              )}
              {totalModificado != null && motivoModificacion && (
                <div className="detalle-campo detalle-campo-alerta">
                  <span className="detalle-etiqueta">Motivo de Modificación de Total:</span>
                  <span className="detalle-valor motivo-texto">{motivoModificacion}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detalle-pedido-seccion">
            <h3 className="detalle-subtitulo">Información del Pedido Original</h3>
            <div className="detalle-grid">
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Comercio:</span>
                <span className="detalle-valor">{pedido.comercio || 'No especificado'}</span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Fecha de Pedido:</span>
                <span className="detalle-valor">
                  {fechaPedido ? formatearFecha(fechaPedido) : 'No especificada'}
                </span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Persona de contacto:</span>
                <span className="detalle-valor">{personaContacto || 'No especificada'}</span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Teléfono:</span>
                <span className="detalle-valor">{pedido.telefono || 'No especificado'}</span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Modalidad de Entrega:</span>
                <span className="detalle-valor">{modalidadEntrega || 'No especificada'}</span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Dirección de Entrega:</span>
                <span className="detalle-valor">{pedido.direccion || 'No especificada'}</span>
              </div>
              {descripcionDireccion && (
                <div className="detalle-campo">
                  <span className="detalle-etiqueta">Referencia de la dirección:</span>
                  <span className="detalle-valor">{descripcionDireccion}</span>
                </div>
              )}
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Método de Pago:</span>
                <span className="detalle-valor">{metodoPago || 'No especificado'}</span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-etiqueta">Estado del Pedido:</span>
                <span className="estado-texto-plano">{pedido.estado || 'Desconocido'}</span>
              </div>
              {pedido.observaciones && (
                <div className="detalle-campo detalle-campo-ancho">
                  <span className="detalle-etiqueta">Observaciones del pedido:</span>
                  <span className="detalle-valor">{pedido.observaciones}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detalle-pedido-seccion">
            <h3 className="detalle-subtitulo">Productos de la Venta</h3>
            {items.length === 0 ? (
              <p className="detalle-vacio">No hay productos registrados en esta venta.</p>
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
                      const nombre =
                        item.producto?.nombre ||
                        item.nombre ||
                        `Producto #${item.producto_id || item.producto?.id || index + 1}`
                      const marca = item.producto?.marca || item.marca || '-'
                      const precio = item.precio != null ? item.precio : (item.precioVenta || 0)
                      const cantidad = item.cantidad || 0
                      const subtotal = item.subtotal != null ? item.subtotal : precio * cantidad

                      return (
                        <tr key={item.id || item.producto_id || index}>
                          <td>{nombre}</td>
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
                        Total Original:
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {formatearPrecio(totalOriginal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="modal-acciones-footer">
            <button type="button" className="orden-btn" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default DetalleVentaModal
