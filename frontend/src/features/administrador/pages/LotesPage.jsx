import { useCallback, useMemo, useState } from 'react'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { useLotes } from '../hooks/useLotes'
import Modal from '../components/comunes/Modal'
import LoteForm from '../components/lotes/LoteForm'
import ConfirmarEliminacionLote from '../components/lotes/ConfirmarEliminacionLote'
import FiltroBusquedaLotes from '../components/lotes/FiltroBusquedaLotes'
import FilaLote from '../components/lotes/FilaLote'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/lotes.css'

function LotesPage() {
  const { lotes, cargando, error, recargar, actualizar, eliminar } = useLotes()

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

  const abrirEditar = useCallback((lote) => {
    setMensaje(null)
    setFormulario({ modo: 'editar', lote })
  }, [])

  const pedirEliminar = useCallback((lote) => {
    setMensaje(null)
    setLoteAEliminar(lote)
  }, [])

  const limpiarBusqueda = useCallback(() => setBusqueda(''), [])

  const cerrarFormulario = () => setFormulario(null)

  const guardar = async (datos) => {
    if (!formulario?.lote) return
    await actualizar(formulario.lote.id, datos)
    setMensaje({ tipo: 'exito', texto: 'Lote actualizado exitosamente.' })
    setFormulario(null)
  }

  const cancelarEliminar = () => setLoteAEliminar(null)

  const confirmarEliminar = async () => {
    if (!loteAEliminar) return
    setEliminando(true)
    try {
      await eliminar(loteAEliminar.id)
      setMensaje({ tipo: 'exito', texto: 'Lote dado de baja exitosamente.' })
    } catch (nuevoError) {
      setMensaje({ tipo: 'error', texto: nuevoError.message })
    } finally {
      setLoteAEliminar(null)
      setEliminando(false)
    }
  }

  return (
    <section className="main-admin" id="main-lotes">
      <header className="header-admin">
        <h1 className="orden-h1">Lotes</h1>
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
          texto="Los lotes se generan automáticamente al crear una orden de compra."
        />
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
            <section className="sec-prod-admin lotes-tabla-contenedor" aria-live="polite">
              <table className="tabla-prod-admin lotes-tabla">
                <caption className="orden-visually-hidden">
                  Lotes registrados con su producto, orden de compra y proveedor
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="lotes-col-referencia">
                      Referencia
                    </th>
                    <th scope="col" className="lotes-col-producto">
                      Producto
                    </th>
                    <th scope="col" className="lotes-col-proveedor">
                      Proveedor
                    </th>
                    <th scope="col" className="lotes-col-numero lotes-col-cantidad">
                      Cantidad
                    </th>
                    <th scope="col" className="lotes-col-numero lotes-col-total">
                      Total
                    </th>
                    <th scope="col" className="lotes-col-fechas">
                      Fechas
                    </th>
                    <th scope="col" className="orden-col-acciones lotes-col-acciones">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((lote, index) => (
                    <FilaLote
                      key={lote.id}
                      lote={lote}
                      numeroFila={index + 1}
                      esUltimoDeSuOrden={
                        lote.ordenCompra?.id != null &&
                        lotesPorOrden.get(lote.ordenCompra.id) === 1
                      }
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
          titulo="Editar lote"
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