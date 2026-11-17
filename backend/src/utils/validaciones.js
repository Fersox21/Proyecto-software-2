export const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const MAX_INT_PG = 2147483647;

export const validarIdEnteroPositivo = (valor, mensaje = 'ID inválido') => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor <= 0 || valor > MAX_INT_PG) {
      throw crearError(mensaje, 400);
    }
    return valor;
  }

  if (typeof valor === 'string') {
    const limpio = valor.trim();
    if (!/^\d+$/.test(limpio)) {
      throw crearError(mensaje, 400);
    }
    const numero = Number(limpio);
    if (!Number.isSafeInteger(numero) || numero <= 0 || numero > MAX_INT_PG) {
      throw crearError(mensaje, 400);
    }
    return numero;
  }

  throw crearError(mensaje, 400);
};

const FORMATO_FECHA = 'YYYY-MM-DD';

export const validarFecha = (valor, campo = 'La fecha') => {
  const fecha = typeof valor === 'string' ? valor.trim() : '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw crearError(`${campo} debe tener el formato ${FORMATO_FECHA}`, 400);
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const comprobacion = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    comprobacion.getUTCFullYear() !== anio ||
    comprobacion.getUTCMonth() !== mes - 1 ||
    comprobacion.getUTCDate() !== dia
  ) {
    throw crearError(`${campo} no es una fecha válida`, 400);
  }

  return fecha;
};

export const normalizarFecha = (valor) => {
  if (valor == null) return null;

  if (valor instanceof Date) {
    const anio = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, '0');
    const dia = String(valor.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  return String(valor).slice(0, 10);
};
