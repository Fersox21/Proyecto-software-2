import { Bs3CircleFill } from 'react-icons/bs'

function ObservacionesForm({ datosPedido, onChange }) {
  return (
    <div className="card rounded-5 p-4 border-0 shadow-sm">
      <div className="d-flex gap-2">
        <Bs3CircleFill size={33} className="text-dark mb-2" />
        <div>
          <h5 className="fw-bold">Indicaciones adicionales</h5>
          <p className="small text-body-secondary mb-3">
            Contanos cualquier detalle útil para preparar o entregar tu pedido.
          </p>
        </div>
      </div>
      <textarea
        name="observacionesPedido"
        rows={3}
        className="form-control"
        value={datosPedido.observacionesPedido}
        style={{ resize: 'none' }}
        onChange={onChange}
      />
    </div>
  )
}

export default ObservacionesForm
