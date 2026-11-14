import { Bs1CircleFill } from 'react-icons/bs'

function DatosComercioForm({ datosPedido, onChange }) {
  return (
    <div className="card rounded-5 p-4 border-0 shadow-sm">
      <div className="d-flex gap-2">
        <Bs1CircleFill size={33} className="text-dark mb-2" />
        <div>
          <h5 className="fw-bold">Datos del comercio</h5>
          <p className="small">Usaremos estos datos para identificar tu pedido.</p>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 col-md-12">
          <label className="form-label small fw-semibold">Nombre del comercio</label>
          <input
            type="text"
            name="nombreComercio"
            className="form-control input-form rounded-5"
            required
            value={datosPedido.nombreComercio}
            onChange={onChange}
          />
          <p className="small">Ej. Panaderia La Espiga</p>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label small fw-semibold">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            className="form-control input-form rounded-5"
            required
            value={datosPedido.telefono}
            onChange={onChange}
          />
          <p className="small">Ej. 2664123456</p>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label small fw-semibold">Persona de contacto</label>
          <input
            type="text"
            name="personaContacto"
            className="form-control input-form rounded-5"
            required
            value={datosPedido.personaContacto}
            onChange={onChange}
          />
          <p className="small">Ej. Pedro Álvarez</p>
        </div>
      </div>
    </div>
  )
}

export default DatosComercioForm
