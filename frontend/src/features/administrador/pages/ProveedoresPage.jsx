import { useCallback, useMemo, useState } from 'react'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { useProveedores } from '../hooks/useProveedores'
import Modal from '../components/comunes/Modal'
import FilaProveedor from '../components/proveedores/FilaProveedor'
import ProveedorForm from '../components/proveedores/ProveedorForm'
import ConfirmarEliminacionProveedor from '../components/proveedores/ConfirmarEliminacionProveedor'
import FiltroBusquedaProveedores from '../components/proveedores/FiltroBusquedaProveedores'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/proveedores.css'

function ProveedoresPage() {
  const { proveedores, cargando, error, recargar, crear, actualizar, eliminar } =
    useProveedores()

  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Solo se consideran los proveedores activos (baja lógica para los que tienen activo en false)
  const activos = useMemo(() => {
    return proveedores.filter((proveedor) => proveedor.activo !== false)
  }, [proveedores])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return activos

    return activos.filter((proveedor) => {
      const contenido = [
        `#${proveedor.id}`,
        proveedor.nombre,
        proveedor.telefono,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [activos, busqueda])

  const abrirCrear = useCallback(() => {
    setMensaje(null)
    setFormulario({ modo: 'crear', proveedor: null })
  }, [])

  const abrirEditar = useCallback((proveedor) => {
    setMensaje(null)
    setFormulario({ modo: 'editar', proveedor })
  }, [])

  const cerrarFormulario = useCallback(() => setFormulario(null), [])

  const guardar = useCallback(
    async (datos) => {
      if (formulario?.modo === 'editar') {
        await actualizar(formulario.proveedor.id, datos)
        setMensaje({
          tipo: 'exito',
          texto: `Proveedor "${datos.nombre}" actualizado correctamente.`,
        })
      } else {
        await crear(datos)
        setMensaje({
          tipo: 'exito',
          texto: `Proveedor "${datos.nombre}" creado correctamente.`,
        })
      }
      setFormulario(null)
    },
    [formulario, crear, actualizar],
  )

  const pedirEliminar = useCallback((proveedor) => {
    setMensaje(null)
    setProveedorAEliminar(proveedor)
  }, [])

  const cancelarEliminar = useCallback(() => setProveedorAEliminar(null), [])

  const confirmarEliminar = useCallback(async () => {
    if (!proveedorAEliminar) return
    setEliminando(true)
    try {
      await eliminar(proveedorAEliminar.id)
      setMensaje({
        tipo: 'exito',
        texto: `Proveedor "${proveedorAEliminar.nombre}" eliminado correctamente.`,
      })
      setProveedorAEliminar(null)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      setProveedorAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }, [proveedorAEliminar, eliminar])

  const limpiarBusqueda = useCallback(() => setBusqueda(''), [])

  return (
    <section className="main-admin" id="main-proveedores">
      <header className="header-admin">
        <h1 className="orden-h1">Proveedores</h1>
      </header>

      {mensaje && (
        <div
          className={`orden-alerta ${
            mensaje.tipo === 'error' ? 'orden-alerta-error' : 'orden-alerta-exito'
          }`}
          role="alert"
        >
          <span>{mensaje.texto}</span>
          <button
            type="button"
            className="orden-alerta-cerrar"
            onClick={() => setMensaje(null)}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {!cargando && !error && activos.length > 0 && (
        <FiltroBusquedaProveedores
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          onLimpiar={limpiarBusqueda}
          onNuevo={abrirCrear}
          totalVisibles={visibles.length}
          totalProveedores={activos.length}
        />
      )}

      {cargando && <Spinner texto="Cargando proveedores..." />}

      {!cargando && error && (
        <MensajeVacio
          titulo="No pudimos cargar los proveedores"
          texto={error.message}
        >
          <button
            type="button"
            className="orden-btn orden-btn-primario"
            onClick={recargar}
          >
            Reintentar
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && activos.length === 0 && (
        <MensajeVacio
          titulo="Todavía no hay proveedores"
          texto="Creá el primer proveedor para empezar a registrar compras y lotes asociados."
        >
          <button
            type="button"
            className="orden-btn orden-btn-primario"
            onClick={abrirCrear}
          >
            Crear el primer proveedor
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && activos.length > 0 && visibles.length === 0 && (
        <MensajeVacio
          titulo="No se encontraron proveedores"
          texto={`No hay ningún proveedor que coincida con "${busqueda}".`}
        >
          <button
            type="button"
            className="orden-btn orden-btn-primario"
            onClick={limpiarBusqueda}
          >
            Limpiar búsqueda
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && visibles.length > 0 && (
        <section className="sec-prod-admin proveedores-tabla-contenedor" aria-live="polite">
          <table className="tabla-prod-admin orden-tabla proveedores-tabla">
            <caption className="orden-visually-hidden">
              Lista de proveedores registrados
            </caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Teléfono</th>
                <th scope="col" className="orden-col-acciones">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((proveedor, index) => (
                <FilaProveedor
                  key={proveedor.id}
                  proveedor={proveedor}
                  numeroFila={index + 1}
                  onEditar={abrirEditar}
                  onEliminar={pedirEliminar}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Modal Crear / Editar */}
      {formulario && (
        <Modal
          titulo={
            formulario.modo === 'editar'
              ? 'Editar proveedor'
              : 'Nuevo proveedor'
          }
          onCerrar={cerrarFormulario}
          tamanio="chico"
        >
          <ProveedorForm
            proveedor={formulario.proveedor}
            onGuardar={guardar}
            onCerrar={cerrarFormulario}
          />
        </Modal>
      )}

      {/* Modal Confirmar Baja / Eliminación */}
      {proveedorAEliminar && (
        <ConfirmarEliminacionProveedor
          proveedor={proveedorAEliminar}
          eliminando={eliminando}
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
        />
      )}
    </section>
  )
}

export default ProveedoresPage
