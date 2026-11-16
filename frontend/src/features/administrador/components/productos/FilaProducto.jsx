function FilaProducto({ producto, onEditar, onEliminar }) {
  const calcularEstado = (stock) => {
    if (stock < 10) return 'Stock bajo'
    if (stock >= 10 && stock <= 20) return 'Stock suficiente'
    return 'Stock alto'
  }

  return (
    <tr>
      <td className="col-admin col-nombre">{producto.nombre}</td>
      <td className="col-admin">{producto.marca}</td>
      <td className="col-admin col-descripcion">{producto.peso || '—'}</td>
      <td className="col-admin col-categoria">{producto.categoria || '—'}</td>
      <td className="col-admin col-precio">${producto.precioVenta}</td>
      <td className="col-admin col-precio">${producto.precioCosto}</td>
      <td className="col-admin col-stock">{producto.stock}</td>
      <td className="col-admin">{producto.enPromocion ? 'Sí' : 'No'}</td>
      <td className="col-admin">${producto.precioPromo ?? '—'}</td>
      <td className="col-admin">{calcularEstado(producto.stock)}</td>
      <td className="col-admin">{producto.destacado ? 'Sí' : 'No'}</td>
      <td className="col-admin col-acciones">
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="orden-btn orden-btn-chico"
            onClick={() => onEditar(producto)}
          >
            Editar
          </button>
          <button
            type="button"
            className="orden-btn orden-btn-chico orden-btn-peligro"
            onClick={() => onEliminar(producto)}
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}

export default FilaProducto
