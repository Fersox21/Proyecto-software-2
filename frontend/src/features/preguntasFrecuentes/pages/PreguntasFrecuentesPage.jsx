import { useState } from 'react'
import {
  FiTruck,
  FiCreditCard,
  FiMapPin,
  FiChevronDown,
  FiMessageCircle,
} from 'react-icons/fi'
import '../../../styles/preguntasFrecuentes.css'

const listaDePreguntas = [
  {
    id: 'zona-envios',
    categoria: 'Logística y Envíos',
    icono: <FiTruck />,
    pregunta: '¿A qué zonas envían mercadería?',
    respuesta:
      'Hacemos envíos diarios a panaderías, confiterías y negocios de San Luis Capital.',
  },
  {
    id: 'medios-pago',
    categoria: 'Facturación',
    icono: <FiCreditCard />,
    pregunta: '¿Cuáles son los medios de pago?',
    respuesta:
      'Aceptamos transferencias bancarias y pagos en efectivo contra entrega.',
  },
  {
    id: 'retiro-local',
    categoria: 'Atención en Sucursal',
    icono: <FiMapPin />,
    pregunta: '¿Se puede retirar mercadería por el depósito?',
    respuesta:
      'Sí, podés retirar tu pedido personalmente por nuestro depósito central en Av. Juan Gilberto Funes 460, San Luis, de lunes a viernes en horario de comercio.',
  },
]

function PreguntasFrecuentesPage() {
  const [preguntaAbiertaId, setPreguntaAbiertaId] = useState('zona-envios')

  const abrirOCerrarPregunta = (idSeleccionado) => {
    setPreguntaAbiertaId((idActualmenteAbierta) =>
      idActualmenteAbierta === idSeleccionado ? null : idSeleccionado
    )
  }

  return (
    <div className="contenedor-preguntas">
      {/* Cabecera */}
      <header className="encabezado-preguntas">
       
        <h1 className="titulo-principal">Preguntas Frecuentes</h1>
        <p className="descripcion-subtitulo">
          Resolvemos tus dudas sobre logística, medios de pago y pedidos mayoristas
          para tu panadería o negocio.
        </p>
      </header>

      {/* Lista interactiva de preguntas */}
      <div className="lista-preguntas">
        {listaDePreguntas.map((preguntaActual) => {
          const laPreguntaEstaAbierta = preguntaAbiertaId === preguntaActual.id

          return (
            <article
              key={preguntaActual.id}
              id={preguntaActual.id}
              className={`tarjeta-pregunta ${laPreguntaEstaAbierta ? 'abierta' : ''}`}
            >
              <button
                type="button"
                className="boton-pregunta"
                onClick={() => abrirOCerrarPregunta(preguntaActual.id)}
                aria-expanded={laPreguntaEstaAbierta}
              >
                <div className="caja-icono">{preguntaActual.icono}</div>

                <div className="caja-texto">
                  <span className="etiqueta-categoria">{preguntaActual.categoria}</span>
                  <h3 className="texto-pregunta">{preguntaActual.pregunta}</h3>
                </div>

                <div className={`icono-flecha ${laPreguntaEstaAbierta ? 'girada' : ''}`}>
                  <FiChevronDown />
                </div>
              </button>

              <div className="panel-respuesta">
                <div className="contenido-respuesta">
                  <p>{preguntaActual.respuesta}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Tarjeta de soporte / Contacto */}
      <aside className="tarjeta-contacto">
        <div className="informacion-contacto">
          <div className="icono-contacto">
            <FiMessageCircle />
          </div>
          <div>
            <h4>¿Tenés una consulta puntual sobre tu pedido?</h4>
            <p>Escribinos directo y el equipo de ventas te responde en minutos.</p>
          </div>
        </div>
        <a
          href="https://wa.me/549266000000"
          target="_blank"
          rel="noopener noreferrer"
          className="boton-contacto"
        >
          Contactar por WhatsApp
        </a>
      </aside>
    </div>
  )
}

export default PreguntasFrecuentesPage