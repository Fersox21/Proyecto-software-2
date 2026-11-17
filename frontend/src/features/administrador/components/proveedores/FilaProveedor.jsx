import { LuPencil, LuTrash2 } from 'react-icons/lu'

function FilaProveedor({ proveedor, numeroFila, onEditar, onEliminar }) {
  return (
    <tr>
      <td className="proveedores-col-id">#{numeroFila}</td>
      <td className="proveedores-nombre">{proveedor.nombre}</td>
      <td className="proveedores-telefono">{proveedor.telefono || '—'}</td>
      <td className="orden-col-acciones">
        <div className="orden-acciones">
          <button
            type="button"
            className="proveedores-btn-icono proveedores-btn-editar"
            onClick={() => onEditar(proveedor)}
            aria-label={`Editar proveedor ${proveedor.nombre}`}
            title="Editar"
          >
            <LuPencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="proveedores-btn-icono proveedores-btn-eliminar"
            onClick={() => onEliminar(proveedor)}
            aria-label={`Eliminar proveedor ${proveedor.nombre}`}
            title="Eliminar"
          >
            <LuTrash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default FilaProveedor
