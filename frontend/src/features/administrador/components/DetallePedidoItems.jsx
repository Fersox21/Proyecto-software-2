import { formatearPrecio } from '../../../shared/utils/formato'

function DetallePedidoItems({ items = [], total = 0 }) {
  return (
    <div className="detalle-pedido-seccion">
      <h3 className="detalle-subtitulo">Productos del Pedido</h3>
      {items.length === 0 ? (
        <p className="detalle-vacio">No hay productos registrados en este pedido.</p>
      ) : (
        <div className="tabla-detalle-contenedor">
          <table className="tabla-items-pedido">
            <thead>
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
                const nombre = item.producto?.nombre || item.nombre || `Producto #${item.producto_id || index + 1}`
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
            <tfoot>
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
