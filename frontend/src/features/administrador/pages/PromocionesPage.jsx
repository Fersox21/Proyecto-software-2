import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import Modal from '../components/comunes/Modal'
import ModalFormPromocion from '../components/promociones/ModalFormPromocion'
import {
  actualizarTipoPromocion,
  crearTipoPromocion,
  eliminarTipoPromocion,
  obtenerTiposPromocion,
} from '../services/tiposPromocionService'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/promociones.css'

function PromocionesPage() {
  const [promociones, setPromociones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [promocionABajar, setPromocionABajar] = useState(null)
  const [procesandoBaja, setProcesandoBaja] = useState(false)

  useEffect(() => {
    let ignorar = false

    obtenerTiposPromocion()
      .then((datos) => {
        if (ignorar) return
        setPromociones(Array.isArray(datos) ? datos : [])
        setError(null)
      })
      .catch((nuevoError) => {
        if (ignorar) return
        setPromociones([])
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
    return promociones.filter((promo) => promo.activo !== false)
  }, [promociones])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return activas

    return activas.filter((promo) => {
      const contenido = [promo.nombre]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [activas, busqueda])

  const abrirCrear = useCallback(() => {
    setMensaje(null)
    setFormulario({ modo: 'crear', promocion: null })
  }, [])

  const abrirEditar = useCallback((promocion) => {
    setMensaje(null)
    setFormulario({ modo: 'editar', promocion })
  }, [])

  const cerrarFormulario = useCallback(() => setFormulario(null), [])

  const guardar = useCallback(
    async (datos) => {
      if (formulario?.modo === 'editar') {
        await actualizarTipoPromocion(formulario.promocion.id, datos)
        setMensaje({
          tipo: 'exito',
          texto: `Promoción "${datos.nombre}" actualizada correctamente.`,
        })
      } else {
        await crearTipoPromocion(datos)
        setMensaje({
          tipo: 'exito',
          texto: `Promoción "${datos.nombre}" creada correctamente.`,
        })
      }
      setFormulario(null)
      recargar()
    },
    [formulario, recargar],
  )

  const pedirBaja = useCallback((promocion) => {
    setMensaje(null)
    setPromocionABajar(promocion)
  }, [])

  const cancelarBaja = useCallback(() => setPromocionABajar(null), [])

  const confirmarBaja = useCallback(async () => {
    if (!promocionABajar) return
    setProcesandoBaja(true)
    try {
      await eliminarTipoPromocion(promocionABajar.id)
      setMensaje({
        tipo: 'exito',
        texto: `Promoción "${promocionABajar.nombre}" dada de baja correctamente.`,
      })
      setPromocionABajar(null)
      recargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      setPromocionABajar(null)
    } finally {
      setProcesandoBaja(false)
    }
  }, [promocionABajar, recargar])

  const limpiarBusqueda = useCallback(() => setBusqueda(''), [])

  return (
    <section className="main-admin" id="main-promociones">
      <header className="header-admin">
        <h1 className="orden-h1">Promociones</h1>
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
        <section className="promociones-toolbar" aria-label="Herramientas de promociones">
          <div className="promociones-busqueda-grupo">
            <div className="orden-campo promociones-campo-busqueda">
              <label htmlFor="filtro-promociones-busqueda" className="orden-visually-hidden">
                Buscar promoción
              </label>
              <input
                id="filtro-promociones-busqueda"
                type="search"
                placeholder="Buscar por nombre..."
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

          <div className="promociones-toolbar-acciones">
            <span className="promociones-conteo">
              {visibles.length} de {activas.length} promoción{activas.length === 1 ? '' : 'es'}
            </span>
            <button type="button" className="promociones-btn-nueva" onClick={abrirCrear}>
              <LuPlus size={18} aria-hidden="true" />
              <span>Nueva promoción</span>
            </button>
          </div>
        </section>
      )}

      {cargando && <Spinner texto="Cargando promociones..." />}

      {!cargando && error && (
        <MensajeVacio
          titulo="No pudimos cargar las promociones"
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
          titulo="Todavía no hay promociones"
          texto="Creá el primer tipo de promoción para asociarlo a los productos."
        >
          <button
            type="button"
            className="orden-btn orden-btn-primario"
            onClick={abrirCrear}
          >
            Crear la primera promoción
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && activas.length > 0 && visibles.length === 0 && (
        <MensajeVacio
          titulo="No se encontraron promociones"
          texto={`No hay ninguna promoción que coincida con "${busqueda}".`}
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
        <section className="sec-prod-admin promociones-tabla-contenedor" aria-live="polite">
          <table className="tabla-prod-admin orden-tabla promociones-tabla">
            <caption className="orden-visually-hidden">
              Lista de tipos de promoción registrados
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
              {visibles.map((promocion, index) => (
                <tr key={promocion.id}>
                  <td className="promociones-col-id">#{index + 1}</td>
                  <td className="promociones-nombre">{promocion.nombre}</td>
                  <td className="orden-col-acciones">
                    <div className="orden-acciones">
                      <button
                        type="button"
                        className="promociones-btn-icono promociones-btn-editar"
                        onClick={() => abrirEditar(promocion)}
                        aria-label={`Editar promoción ${promocion.nombre}`}
                        title="Editar"
                      >
                        <LuPencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="promociones-btn-icono promociones-btn-baja"
                        onClick={() => pedirBaja(promocion)}
                        aria-label={`Dar de baja promoción ${promocion.nombre}`}
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
        <ModalFormPromocion
          promocion={formulario.promocion}
          onGuardar={guardar}
          onCerrar={cerrarFormulario}
        />
      )}

      {promocionABajar && (
        <Modal
          titulo="Dar de baja promoción"
          onCerrar={cancelarBaja}
          tamanio="chico"
        >
          <div className="orden-modal-cuerpo">
            <p className="orden-confirmar-texto">
              ¿Seguro que querés dar de baja la promoción{' '}
              <strong>{promocionABajar.nombre}</strong>?
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

export default PromocionesPage
