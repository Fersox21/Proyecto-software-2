import { Link, useOutletContext, useParams } from 'react-router'
import DetalleProducto from '../components/DetalleProducto'
import { obtenerProductoPorId } from '../services/catalogoService'
import { useFetch } from '../../../shared/hooks/useFetch'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'

function DetalleProductoPage() {
  // CLASE 3 · React Router: useParams lee los parámetros de la URL.
  // Ruta "catalogo/:id" + URL "/catalogo/4"  →  { id: "4" }  (siempre string)
  const { id } = useParams()
  const { agregarProducto } = useOutletContext()
  const { datos: producto, cargando, error } = useFetch(obtenerProductoPorId, id)

  if (cargando) return <Spinner texto="Cargando producto..." />

  if (error) {
    return (
      <MensajeVacio titulo="Producto no encontrado" texto={error.message}>
        <Link to="/catalogo" className="btn btn-dark">
          Volver al catálogo
        </Link>
      </MensajeVacio>
    )
  }

  // CLASE 3 · Conservar y reiniciar el estado

  // key={producto.id}: si cambia el producto, React crea un DetalleProducto
  // NUEVO y el talle/cantidad elegidos vuelven a su valor inicial.
  return <DetalleProducto key={producto.id} producto={producto} onAgregar={agregarProducto} />
}

export default DetalleProductoPage
