function FilaProveedor({ proveedor, onEditar, onEliminar }) {
  return (
    <tr>
      <td className="orden-col-id">#{proveedor.id}</td>
      <td className="proveedores-nombre">{proveedor.nombre}</td>
      <td className="proveedores-telefono">{proveedor.telefono || '—'}</td>
      <td className="orden-col-acciones">
        <div className="orden-acciones">
          <button
            type="button"
            className="orden-btn orden-btn-chico"
            onClick={() => onEditar(proveedor)}
          >
            Editar
          </button>
          <button
            type="button"
            className="orden-btn orden-btn-chico orden-btn-peligro"
            onClick={() => onEliminar(proveedor)}
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}

export default FilaProveedor
