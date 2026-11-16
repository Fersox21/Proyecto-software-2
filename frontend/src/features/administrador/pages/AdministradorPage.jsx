import { useState } from 'react'
import { useProductosAdmin } from '../hooks/useProductosAdmin'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import FilaProducto from '../components/productos/FilaProducto'
import ModalFormProducto from '../components/productos/ModalFormProducto'
import ModalConfirmarEliminar from '../components/productos/ModalConfirmarEliminar'
import '../../../styles/panelAdmin/ordenesCompra.css'

function AdministradorPage() {
  const {
    productos,
    cargando,
    error,
    procesandoAccion,
    actualizarProducto,
    eliminarProducto
  } = useProductosAdmin()

  const [modalFormAbierto, setModalFormAbierto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [productoParaEliminar, setProductoParaEliminar] = useState(null)
  const [alerta, setAlerta] = useState(null)

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setAlerta({ texto, tipo })
    setTimeout(() => setAlerta(null), 4000)
  }

  const handleAbrirEditar = (producto) => {
    setProductoSeleccionado(producto)
    setModalFormAbierto(true)
  }

  const handleCerrarForm = () => {
    setProductoSeleccionado(null)
    setModalFormAbierto(false)
  }

  const handleGuardarProducto = async (datos) => {
    if (!productoSeleccionado) return
    await actualizarProducto(productoSeleccionado.id, datos)
    mostrarMensaje(`Producto "${datos.nombre}" actualizado con éxito`)
    handleCerrarForm()
  }

  const handleAbrirEliminar = (producto) => {
    setProductoParaEliminar(producto)
  }

  const handleCerrarEliminar = () => {
    setProductoParaEliminar(null)
  }

  const handleConfirmarEliminar = async () => {
    if (!productoParaEliminar) return
    try {
      await eliminarProducto(productoParaEliminar.id)
      mostrarMensaje(`Producto "${productoParaEliminar.nombre}" eliminado`, 'exito')
      setProductoParaEliminar(null)
    } catch (err) {
      mostrarMensaje(`Error al eliminar: ${err.message}`, 'error')
    }
  }

  if (cargando) return <Spinner texto="Cargando productos..." />
  if (error) return <MensajeVacio titulo="No pudimos cargar los productos" texto={error.message} />

  const totalProductos = productos ? productos.length : 0

  return (
    <>
      <section className="main-admin" id="main-admin">
        <header className="header-admin">
          <h1 className="h1-admin">Gestión de Productos</h1>
        </header>

        {alerta && (
          <div
            className={`orden-alerta ${
              alerta.tipo === 'error' ? 'orden-alerta-error' : 'orden-alerta-exito'
            }`}
            style={{ marginBottom: '1rem' }}
          >
            {alerta.texto}
          </div>
        )}

        <section id="sec-prod-admin" className="sec-prod-admin" aria-live="polite">
          <table className="tabla-prod-admin">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Precio venta</th>
                <th>Precio costo</th>
                <th>Stock</th>
                <th>En promoción</th>
                <th>Precio con promo</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>

            <tbody id="tabla-admin-body">
              {totalProductos > 0 ? (
                productos.map((prod) => (
                  <FilaProducto
                    key={prod.id}
                    producto={prod}
                    onEditar={handleAbrirEditar}
                    onEliminar={handleAbrirEliminar}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay productos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="tabla-admin-pie">
            <span id="info-pag">Total: {totalProductos} producto(s)</span>
          </div>
        </section>
      </section>

      {/* Modal Crear / Editar */}
      {modalFormAbierto && (
        <ModalFormProducto
          producto={productoSeleccionado}
          visible={modalFormAbierto}
          guardando={procesandoAccion}
          onGuardar={handleGuardarProducto}
          onCerrar={handleCerrarForm}
        />
      )}

      {/* Modal Confirmar Eliminación */}
      {Boolean(productoParaEliminar) && (
        <ModalConfirmarEliminar
          producto={productoParaEliminar}
          visible={Boolean(productoParaEliminar)}
          eliminando={procesandoAccion}
          onConfirmar={handleConfirmarEliminar}
          onCerrar={handleCerrarEliminar}
        />
      )}
    </>
  )
}

export default AdministradorPage
