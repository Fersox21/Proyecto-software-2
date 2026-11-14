import { useCallback, useMemo, useState } from 'react'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { useLotes } from '../hooks/useLotes'
import Modal from '../components/Modal'
import LoteForm from '../components/LoteForm'
import ConfirmarEliminacionLote from '../components/ConfirmarEliminacionLote'
import FiltroBusquedaLotes from '../components/FiltroBusquedaLotes'
import FilaLote from '../components/FilaLote'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/lotes.css'

function LotesPage() {
  const { lotes, cargando, error, recargar, crear, actualizar, eliminar } = useLotes()

  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [loteAEliminar, setLoteAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return lotes

    return lotes.filter((lote) => {
      const contenido = [
        `#${lote.id}`,
        lote.ordenCompra?.id != null ? `#${lote.ordenCompra.id}` : null,
        lote.producto?.nombre,
        lote.producto?.marca,
        lote.ordenCompra?.proveedor?.nombre,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [lotes, busqueda])

  const lotesPorOrden = useMemo(() => {
    const conteo = new Map()
    lotes.forEach((lote) => {
      const ordenId = lote.ordenCompra?.id
      if (ordenId == null) return
      conteo.set(ordenId, (conteo.get(ordenId) ?? 0) + 1)
    })
    return conteo
  }, [lotes])

  const esUltimoLoteDeSuOrden = useCallback(
    (lote) =>
      lote.ordenCompra?.id != null && lotesPorOrden.get(lote.ordenCompra.id) === 1,
    [lotesPorOrden],
  )

  const abrirCrear = useCallback(() => {
    setMensaje(null)
    setFormulario({ modo: 'crear', lote: null })
  }, [])

  const abrirEditar = useCallback((lote) => {
    setMensaje(null)
    setFormulario({ modo: 'editar', lote })
  }, [])

  const cerrarFormulario = useCallback(() => setFormulario(null), [])

  const guardar = useCallback(
    async (datos) => {
      if (formulario?.modo === 'editar') {
        await actualizar(formulario.lote.id, datos)
        setMensaje({ tipo: 'exito', texto: `Lote #${formulario.lote.id} actualizado.` })
      } else {
        await crear(datos)
        setMensaje({ tipo: 'exito', texto: 'Lote creado.' })
      }
      setFormulario(null)
    },
    [formulario, crear, actualizar],
  )

  const pedirEliminar = useCallback((lote) => {
    setMensaje(null)
    setLoteAEliminar(lote)
  }, [])

  const cancelarEliminar = useCallback(() => setLoteAEliminar(null), [])

  const confirmarEliminar = useCallback(async () => {
    if (!loteAEliminar) return
    setEliminando(true)
    try {
      await eliminar(loteAEliminar.id)
      setMensaje({ tipo: 'exito', texto: `Lote #${loteAEliminar.id} dado de baja.` })
      setLoteAEliminar(null)
    } catch (nuevoError) {
      setMensaje({ tipo: 'error', texto: nuevoError.message })
      setLoteAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }, [loteAEliminar, eliminar])

  const limpiarBusqueda = useCallback(() => setBusqueda(''), [])

  return (
    <section className="main-admin" id="main-lotes">
      <header className="header-admin">
        <h1 className="orden-h1">Lotes</h1>
        <button type="button" className="agregar-prod" onClick={abrirCrear}>
          + Nuevo lote
        </button>
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

      {cargando && <Spinner texto="Cargando lotes..." />}

      {!cargando && error && (
        <MensajeVacio titulo="No pudimos cargar los lotes" texto={error.message}>
          <button type="button" className="orden-btn orden-btn-primario" onClick={recargar}>
            Reintentar
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && lotes.length === 0 && (
        <MensajeVacio
          titulo="Todavía no hay lotes registrados"
          texto="Creá el primer lote para empezar a gestionar el stock."
        >
          <button type="button" className="orden-btn orden-btn-primario" onClick={abrirCrear}>
            Crear el primer lote
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && lotes.length > 0 && (
        <>
          <FiltroBusquedaLotes
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            onLimpiar={limpiarBusqueda}
            totalVisibles={visibles.length}
            totalLotes={lotes.length}
          />

          {visibles.length === 0 ? (
            <MensajeVacio
              titulo="No hay lotes que coincidan"
              texto="Probá con otro producto, proveedor, orden o código de lote."
            >
              <button type="button" className="orden-btn" onClick={limpiarBusqueda}>
                Limpiar búsqueda
              </button>
            </MensajeVacio>
          ) : (
            <section className="sec-prod-admin" aria-live="polite">
              <table className="tabla-prod-admin lotes-tabla">
                <caption className="orden-visually-hidden">
                  Lotes registrados con su producto, orden de compra y proveedor
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Lote</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Orden de compra</th>
                    <th scope="col">Proveedor</th>
                    <th scope="col" className="lotes-col-numero">
                      Cantidad
                    </th>
                    <th scope="col">Fecha de arribo</th>
                    <th scope="col">Fecha de vencimiento</th>
                    <th scope="col" className="orden-col-acciones">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((lote) => (
                    <FilaLote
                      key={lote.id}
                      lote={lote}
                      esUltimoDeSuOrden={esUltimoLoteDeSuOrden(lote)}
                      onEditar={abrirEditar}
                      onEliminar={pedirEliminar}
                    />
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      {formulario && (
        <Modal
          titulo={
            formulario.modo === 'editar'
              ? `Editar lote #${formulario.lote.id}`
              : 'Nuevo lote'
          }
          onCerrar={cerrarFormulario}
        >
          <LoteForm
            lote={formulario.lote}
            onGuardar={guardar}
            onCerrar={cerrarFormulario}
          />
        </Modal>
      )}

      {loteAEliminar && (
        <ConfirmarEliminacionLote
          lote={loteAEliminar}
          eliminando={eliminando}
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
        />
      )}
    </section>
  )
}

export default LotesPage
