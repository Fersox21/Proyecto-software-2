function CampoFormulario({ label, id, error, children }) {
  return (
    <div className="orden-campo">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="orden-campo-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export default CampoFormulario
