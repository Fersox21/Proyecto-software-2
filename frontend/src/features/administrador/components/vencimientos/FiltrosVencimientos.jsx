import { UMBRALES_AVISO } from '../../utils/vencimientos'

const TODOS = 'todos'
const ESTADOS = [
  { valor: 'vencido', etiqueta: 'Vencidos' },
  { valor: 'proximo', etiqueta: 'Próximos a vencer' },
  { valor: 'en-regla', etiqueta: 'En regla' },
]

function FiltrosVencimientos({
  busqueda,
  proveedorId,
  estado,
  desde,
  hasta,
  umbral,
  proveedores,
  totalVisibles,
  totalFilas,
  hayFiltrosActivos,
  onBusquedaChange,
  onProveedorChange,
  onEstadoChange,
  onDesdeChange,
  onHastaChange,
  onUmbralChange,
  onLimpiar,
}) {
  return (
    <section className="venc-filtros" aria-label="Filtros de vencimientos">
      <div className="orden-campo venc-campo-busqueda">
        <label htmlFor="venc-busqueda">Buscar</label>
        <input
          id="venc-busqueda"
          type="search"
          placeholder="Producto, marca o proveedor"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>

      <div className="orden-campo">
        <label htmlFor="venc-proveedor">Proveedor</label>
        <select
          id="venc-proveedor"
          value={proveedorId}
          onChange={(e) => onProveedorChange(e.target.value)}
        >
          <option value={TODOS}>Todos</option>
          {proveedores.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="orden-campo">
        <label htmlFor="venc-estado">Estado</label>
        <select
          id="venc-estado"
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
        >
          <option value={TODOS}>Todos</option>
          {ESTADOS.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="orden-campo">
        <label htmlFor="venc-desde">Vence desde</label>
        <input
          id="venc-desde"
          type="date"
          value={desde}
          max={hasta || undefined}
          onChange={(e) => onDesdeChange(e.target.value)}
        />
      </div>

      <div className="orden-campo">
        <label htmlFor="venc-hasta">Vence hasta</label>
        <input
          id="venc-hasta"
          type="date"
          value={hasta}
          min={desde || undefined}
          onChange={(e) => onHastaChange(e.target.value)}
        />
      </div>

      <div className="orden-campo">
        <label htmlFor="venc-umbral">Aviso de próximos</label>
        <select
          id="venc-umbral"
          value={umbral}
          onChange={(e) => onUmbralChange(Number(e.target.value))}
        >
          {UMBRALES_AVISO.map((dias) => (
            <option key={dias} value={dias}>
              {dias} días
            </option>
          ))}
        </select>
      </div>

      <div className="venc-filtros-pie">
        <span className="venc-conteo">
          Mostrando {totalVisibles} de {totalFilas} lotes
        </span>
        <button
          type="button"
          className="orden-btn orden-btn-chico"
          onClick={onLimpiar}
          disabled={!hayFiltrosActivos}
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  )
}

export default FiltrosVencimientos
