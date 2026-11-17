import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import Modal from '../components/comunes/Modal'
import ModalFormCategoria from '../components/categorias/ModalFormCategoria'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategorias,
} from '../services/categoriasService'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/categorias.css'

function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [categoriaABajar, setCategoriaABajar] = useState(null)
  const [procesandoBaja, setProcesandoBaja] = useState(false)

  useEffect(() => {
    let ignorar = false

    obtenerCategorias()
      .then((datos) => {
        if (ignorar) return
        setCategorias(Array.isArray(datos) ? datos : [])
        setError(null)
      })
      .catch((nuevoError) => {
        if (ignorar) return
        setCategorias([])
        setError(nuevoError)
      })
      .finally(() => {
        if (!ignorar) setCargando(false)
      })

    return () => {
      ignorar = true
    }
  }, [recarga])

  const recargar = useCallback(() => {
    setRecarga((n) => n + 1)
  }, [])

  const activas = useMemo(() => {
    return categorias.filter((categoria) => categoria.activo !== false)
  }, [categorias])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return activas

    return activas.filter((categoria) => {
      const contenido = [`#${categoria.id}`, categoria.nombre]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [activas, busqueda])

  const abrirCrear = useCallback(() => {
    setMensaje(null)
    setFormulario({ modo: 'crear', categoria: null })
  }, [])

  const abrirEditar = useCallback((categoria) => {
    setMensaje(null)
    setFormulario({ modo: 'editar', categoria })
  }, [])

  const cerrarFormulario = useCallback(() => setFormulario(null), [])

  const guardar = useCallback(
    async (datos) => {
      if (formulario?.modo === 'editar') {
        await actualizarCategoria(formulario.categoria.id, datos)
        setMensaje({
          tipo: 'exito',
          texto: `Categoría "${datos.nombre}" actualizada correctamente.`,
        })
      } else {
        await crearCategoria(datos)
        setMensaje({
          tipo: 'exito',
          texto: `Categoría "${datos.nombre}" creada correctamente.`,
        })
      }
      setFormulario(null)
      recargar()
    },
    [formulario, recargar],
  )

  const pedirBaja = useCallback((categoria) => {
    setMensaje(null)
    setCategoriaABajar(categoria)
  }, [])

  const cancelarBaja = useCallback(() => setCategoriaABajar(null), [])

  const confirmarBaja = useCallback(async () => {
    if (!categoriaABajar) return
    setProcesandoBaja(true)
    try {
      await eliminarCategoria(categoriaABajar.id)
      setMensaje({
        tipo: 'exito',
        texto: `Categoría "${categoriaABajar.nombre}" dada de baja correctamente.`,
      })
      setCategoriaABajar(null)
      recargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      setCategoriaABajar(null)
    } finally {
      setProcesandoBaja(false)
    }
  }, [categoriaABajar, recargar])

  const limpiarBusqueda = useCallback(() => setBusqueda(''), [])

  return (
    <section className="main-admin" id="main-categorias">
      <header className="header-admin">
        <h1 className="orden-h1">Categorías</h1>
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

      {!cargando && !error && activas.length > 0 && (
        <section className="categorias-toolbar" aria-label="Herramientas de categorías">
          <div className="categorias-busqueda-grupo">
            <div className="orden-campo categorias-campo-busqueda">
              <label htmlFor="filtro-categorias-busqueda" className="orden-visually-hidden">
                Buscar categoría
              </label>
              <input
                id="filtro-categorias-busqueda"
                type="search"
                placeholder="Buscar por nombre o #id..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {busqueda.trim() !== '' && (
              <button type="button" className="orden-btn" onClick={limpiarBusqueda}>
                Limpiar
              </button>
            )}
          </div>

          <div className="categorias-toolbar-acciones">
            <span className="categorias-conteo">
              {visibles.length} de {activas.length} categoría{activas.length === 1 ? '' : 's'}
            </span>
            <button type="button" className="categorias-btn-nueva" onClick={abrirCrear}>
              <LuPlus size={18} aria-hidden="true" />
              <span>Nueva categoría</span>
            </button>
          </div>
        </section>
      )}

      {cargando && <Spinner texto="Cargando categorías..." />}

      {!cargando && error && (
        <MensajeVacio
          titulo="No pudimos cargar las categorías"
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

      {!cargando && !error && activas.length === 0 && (
        <MensajeVacio
          titulo="Todavía no hay categorías"
          texto="Creá la primera categoría para organizar los productos del catálogo."
        >
          <button
            type="button"
            className="orden-btn orden-btn-primario"
            onClick={abrirCrear}
          >
            Crear la primera categoría
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && activas.length > 0 && visibles.length === 0 && (
        <MensajeVacio
          titulo="No se encontraron categorías"
          texto={`No hay ninguna categoría que coincida con "${busqueda}".`}
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
        <section className="sec-prod-admin categorias-tabla-contenedor" aria-live="polite">
          <table className="tabla-prod-admin orden-tabla categorias-tabla">
            <caption className="orden-visually-hidden">
              Lista de categorías registradas
            </caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col" className="orden-col-acciones">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((categoria, index) => (
                <tr key={categoria.id}>
                  <td className="categorias-col-id">#{index + 1}</td>
                  <td className="categorias-nombre">{categoria.nombre}</td>
                  <td className="orden-col-acciones">
                    <div className="orden-acciones">
                      <button
                        type="button"
                        className="categorias-btn-icono categorias-btn-editar"
                        onClick={() => abrirEditar(categoria)}
                        aria-label={`Editar categoría ${categoria.nombre}`}
                        title="Editar"
                      >
                        <LuPencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="categorias-btn-icono categorias-btn-baja"
                        onClick={() => pedirBaja(categoria)}
                        aria-label={`Dar de baja categoría ${categoria.nombre}`}
                        title="Dar de baja"
                      >
                        <LuTrash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {formulario && (
        <ModalFormCategoria
          categoria={formulario.categoria}
          onGuardar={guardar}
          onCerrar={cerrarFormulario}
        />
      )}

      {categoriaABajar && (
        <Modal
          titulo="Dar de baja categoría"
          onCerrar={cancelarBaja}
          tamanio="chico"
        >
          <div className="orden-modal-cuerpo">
            <p className="orden-confirmar-texto">
              ¿Seguro que querés dar de baja la categoría{' '}
              <strong>{categoriaABajar.nombre}</strong>?
            </p>
            <p className="orden-confirmar-detalle">
              Dejará de aparecer en los selectores al crear o editar productos.
            </p>
          </div>

          <div className="orden-modal-acciones">
            <button
              type="button"
              className="orden-btn"
              onClick={cancelarBaja}
              disabled={procesandoBaja}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="orden-btn orden-btn-peligro"
              onClick={confirmarBaja}
              disabled={procesandoBaja}
            >
              {procesandoBaja ? 'Dando de baja...' : 'Dar de baja'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default CategoriasPage
