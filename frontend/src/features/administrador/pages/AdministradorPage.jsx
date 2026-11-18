import { useMemo, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { useProductosAdmin } from '../hooks/useProductosAdmin'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import FilaProducto from '../components/productos/FilaProducto'
import ModalFormProducto from '../components/productos/ModalFormProducto'
import ModalConfirmarEliminar from '../components/productos/ModalConfirmarEliminar'
import HistorialProductos from '../components/productos/HistorialProductos'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/historial.css'

function obtenerNombreCategoria(categoria) {
  if (typeof categoria === 'string') return categoria.trim()
  return categoria?.nombre?.trim() || ''
}

function AdministradorPage() {
  const {
    productos,
    cargando,
    error,
    procesandoAccion,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  } = useProductosAdmin()

  const [vistaHistorial, setVistaHistorial] = useState(false)
  const [modalFormAbierto, setModalFormAbierto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [productoParaEliminar, setProductoParaEliminar] = useState(null)
  const [alerta, setAlerta] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  const categoriasDisponibles = useMemo(() => {
    const unicas = new Set()
    for (const prod of productos || []) {
      const cat = obtenerNombreCategoria(prod.categoria)
      if (cat) unicas.add(cat)
    }
    return Array.from(unicas).sort((a, b) => a.localeCompare(b, 'es'))
  }, [productos])

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    return (productos || []).filter((prod) => {
      const coincideBusqueda = !termino ||
        (prod.nombre || '').toLowerCase().includes(termino) ||
        (prod.marca || '').toLowerCase().includes(termino)

      const coincideCategoria = !categoriaFiltro ||
        obtenerNombreCategoria(prod.categoria) === categoriaFiltro

      return coincideBusqueda && coincideCategoria
    })
  }, [productos, busqueda, categoriaFiltro])

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
    const nombreProducto = datos instanceof FormData ? datos.get('nombre') : datos.nombre
    if (productoSeleccionado) {
      await actualizarProducto(productoSeleccionado.id, datos)
      mostrarMensaje(`Producto "${nombreProducto}" actualizado exitosamente.`)
    } else {
      await crearProducto(datos)
      mostrarMensaje(`Producto "${nombreProducto}" creado exitosamente.`)
    }
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
      mostrarMensaje(`Producto "${productoParaEliminar.nombre}" eliminado exitosamente.`, 'exito')
      setProductoParaEliminar(null)
    } catch (err) {
      mostrarMensaje(`Error al eliminar: ${err.message}`, 'error')
    }
  }

  if (vistaHistorial) {
    return (
      <section className="main-admin" id="main-admin">
        <header className="header-admin">
          <h1 className="h1-admin">Historial de Productos</h1>
          <button
            type="button"
            className="orden-btn"
            onClick={() => setVistaHistorial(false)}
          >
            Volver al listado
          </button>
        </header>
        <HistorialProductos />
      </section>
    )
  }

  if (cargando) return <Spinner texto="Cargando productos..." />
  if (error) return <MensajeVacio titulo="No pudimos cargar los productos" texto={error.message} />

  const totalProductos = productos ? productos.length : 0

  return (
    <>
      <section className="main-admin" id="main-admin">
        <header className="header-admin">
          <h1 className="h1-admin">Gestión de Productos</h1>
          <button
            type="button"
            className="orden-btn"
            onClick={() => setVistaHistorial(true)}
          >
            Ver historial
          </button>
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

        <div className="prod-barra-acciones">
          <div className="prod-filtros-grupo">
            <div className="prod-busqueda-wrapper">
              <LuSearch className="prod-busqueda-icono" size={16} aria-hidden="true" />
              <input
                type="search"
                className="prod-busqueda-input"
                placeholder="Buscar producto..."
                aria-label="Buscar producto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="prod-filtro-categoria"
              aria-label="Filtro por categoría"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
              <option value="">Filtro por categoría</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section id="sec-prod-admin" className="sec-prod-admin" aria-live="polite">
          <table className="tabla-prod-admin">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precios</th>
                <th>Stock</th>
                <th>Promo</th>
                <th>Estado</th>
                <th>En catálogo</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>

            <tbody id="tabla-admin-body">
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((prod) => (
                  <FilaProducto
                    key={prod.id}
                    producto={prod}
                    onEditar={handleAbrirEditar}
                    onEliminar={handleAbrirEliminar}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    {totalProductos > 0
                      ? 'No se encontraron productos con los filtros aplicados.'
                      : 'No hay productos registrados en el sistema.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="tabla-admin-pie">
            <span id="info-pag">
              {productosFiltrados.length === totalProductos
                ? `Total: ${totalProductos} producto(s)`
                : `Mostrando ${productosFiltrados.length} de ${totalProductos} producto(s)`}
            </span>
          </div>
        </section>
      </section>

      {modalFormAbierto && (
        <ModalFormProducto
          producto={productoSeleccionado}
          visible={modalFormAbierto}
          guardando={procesandoAccion}
          onGuardar={handleGuardarProducto}
          onCerrar={handleCerrarForm}
        />
      )}

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
