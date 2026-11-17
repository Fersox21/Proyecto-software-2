import { useMemo, useState } from 'react'
import { LuEye } from 'react-icons/lu'
import Spinner from '../../../../shared/components/Spinner'
import MensajeVacio from '../../../../shared/components/MensajeVacio'
import { formatearPrecio } from '../../../../shared/utils/formato'
import { obtenerHistorialProductos } from '../../services/productosServices'
import { useHistorial } from '../../hooks/useHistorial'
import FiltrosHistorial from '../comunes/FiltrosHistorial'
import PaginadorHistorial from '../comunes/PaginadorHistorial'
import ModalFormProducto from './ModalFormProducto'

const POR_PAGINA = 25

function HistorialProductos() {
  const { datos: productos, cargando, error, recargar } = useHistorial(obtenerHistorialProductos)
  const [chip, setChip] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState({ campo: 'nombre', dir: 'asc' })
  const [pagina, setPagina] = useState(1)
  const [productoDetalle, setProductoDetalle] = useState(null)

  const conteos = useMemo(() => {
    const res = {
      todos: productos.length,
      activos: 0,
      eliminados: 0,
      sinStock: 0,
      enPromo: 0,
      sinImagen: 0,
    }
    productos.forEach((p) => {
      if (p.eliminado || p.activo === false) res.eliminados += 1
      else res.activos += 1
      if (Number(p.stock ?? 0) === 0) res.sinStock += 1
      if (p.enPromocion) res.enPromo += 1
      if (!p.imagen) res.sinImagen += 1
    })
    return res
  }, [productos])

  const chips = [
    { clave: 'todos', etiqueta: 'Todos', cantidad: conteos.todos },
    { clave: 'activos', etiqueta: 'Activos', cantidad: conteos.activos },
    { clave: 'eliminados', etiqueta: 'Eliminados', cantidad: conteos.eliminados },
    { clave: 'sin-stock', etiqueta: 'Sin stock', cantidad: conteos.sinStock },
    { clave: 'en-promo', etiqueta: 'En promoción', cantidad: conteos.enPromo },
    { clave: 'sin-imagen', etiqueta: 'Sin imagen', cantidad: conteos.sinImagen },
  ]

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = productos.filter((p) => {
      const esEliminado = Boolean(p.eliminado || p.activo === false)
      if (chip === 'activos' && esEliminado) return false
      if (chip === 'eliminados' && !esEliminado) return false
      if (chip === 'sin-stock' && Number(p.stock ?? 0) !== 0) return false
      if (chip === 'en-promo' && !p.enPromocion) return false
      if (chip === 'sin-imagen' && Boolean(p.imagen)) return false

      if (q) {
        const texto = [p.nombre, p.marca, p.categoria, `#${p.id}`]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!texto.includes(q)) return false
      }
      return true
    })

    const signo = orden.dir === 'asc' ? 1 : -1
    return [...lista].sort((a, b) => {
      if (orden.campo === 'stock') return (Number(a.stock ?? 0) - Number(b.stock ?? 0)) * signo
      if (orden.campo === 'precio') {
        return (Number(a.precioVenta ?? 0) - Number(b.precioVenta ?? 0)) * signo
      }
      return String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es') * signo
    })
  }, [productos, chip, busqueda, orden])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA)

  const alternarOrden = (campo) => {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { campo, dir: 'asc' },
    )
  }

  const limpiar = () => {
    setChip('todos')
    setBusqueda('')
    setPagina(1)
  }

  if (cargando) return <Spinner texto="Cargando historial de productos..." />
  if (error) {
    return (
      <MensajeVacio titulo="No pudimos cargar el historial de productos" texto={error.message}>
        <button type="button" className="orden-btn orden-btn-primario" onClick={recargar}>
          Reintentar
        </button>
      </MensajeVacio>
    )
  }

  return (
    <div>
      <FiltrosHistorial
        chips={chips}
        chipActivo={chip}
        onChipChange={(c) => { setChip(c); setPagina(1) }}
        busqueda={busqueda}
        onBusquedaChange={(v) => { setBusqueda(v); setPagina(1) }}
        placeholderBusqueda="Nombre, marca, categoría o #producto"
        totalVisibles={filtrados.length}
        totalRegistros={productos.length}
        hayFiltrosActivos={chip !== 'todos' || busqueda !== ''}
        onLimpiar={limpiar}
      />

      {filtrados.length === 0 ? (
        <MensajeVacio
          titulo="No hay productos que coincidan"
          texto="Probá cambiando el filtro de estado o la búsqueda."
        />
      ) : (
        <section className="sec-prod-admin" aria-live="polite">
          <table className="tabla-prod-admin">
            <thead>
              <tr>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('nombre')}>
                    Producto {orden.campo === 'nombre' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Categoría</th>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('stock')}>
                    Stock {orden.campo === 'stock' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('precio')}>
                    Precio venta {orden.campo === 'precio' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Estado</th>
                <th className="col-acciones-header">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((producto) => {
                const esEliminado = Boolean(producto.eliminado || producto.activo === false)
                return (
                  <tr key={producto.id} className={esEliminado ? 'hist-fila-eliminada' : ''}>
                    <td>
                      <div className="lotes-celda-doble">
                        <span className="lotes-principal">{producto.nombre}</span>
                        {producto.marca && <span className="lotes-subtexto">{producto.marca}</span>}
                      </div>
                    </td>
                    <td>{producto.categoria || '—'}</td>
                    <td>{producto.stock ?? 0}</td>
                    <td>{formatearPrecio(producto.precioVenta ?? 0)}</td>
                    <td>
                      {esEliminado ? (
                        <span className="hist-badge hist-badge-eliminado">Eliminado</span>
                      ) : (
                        <span className="hist-badge hist-badge-vigente">Activo</span>
                      )}
                    </td>
                    <td className="orden-col-acciones">
                      <button
                        type="button"
                        className="venc-btn-icono venc-btn-ver"
                        title="Ver detalle"
                        aria-label={`Ver detalle de ${producto.nombre}`}
                        onClick={() => setProductoDetalle(producto)}
                      >
                        <LuEye size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <PaginadorHistorial
            paginaActual={paginaSegura}
            totalPaginas={totalPaginas}
            totalRegistros={filtrados.length}
            porPagina={POR_PAGINA}
            onCambiarPagina={setPagina}
          />
        </section>
      )}

      {productoDetalle && (
        <ModalFormProducto
          producto={productoDetalle}
          visible={Boolean(productoDetalle)}
          guardando={false}
          soloLectura
          onGuardar={async () => {}}
          onCerrar={() => setProductoDetalle(null)}
        />
      )}
    </div>
  )
}

export default HistorialProductos
