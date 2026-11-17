// Regla única de precio y promoción de un producto.
//
// El descuento se calcula como porcentaje entero (1% a 99%) a partir del precio
// de venta y el precio promocional guardado, conservando el precio promocional
// exacto redondeado a 2 decimales cuando es válido.

// Redondea a dos decimales evitando los errores de coma flotante.
export const redondear2 = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return NaN;
  return Math.round((numero + Number.EPSILON) * 100) / 100;
};

const aNumero = (valor) => {
  if (valor === null || valor === undefined || valor === '') return NaN;
  return Number(valor);
};

// Porcentaje entero de descuento (1 a 99) o null si la promoción no es válida.
export const porcentajeDescuento = (precioVenta, precioPromo) => {
  const normal = aNumero(precioVenta);
  const promo = aNumero(precioPromo);

  if (!Number.isFinite(normal) || !Number.isFinite(promo)) return null;
  if (normal <= 0 || promo <= 0 || promo >= normal) return null;

  const porcentaje = Math.round(((normal - promo) / normal) * 100);

  // Un descuento que redondea a 0% o a 100% no se puede representar: el precio
  // normalizado quedaría igual al de venta o en cero.
  if (porcentaje < 1 || porcentaje > 99) return null;

  return porcentaje;
};

// Precio promocional exacto para un porcentaje entero de descuento.
export const precioConDescuento = (precioVenta, porcentaje) => {
  const normal = aNumero(precioVenta);
  const pct = aNumero(porcentaje);

  if (!Number.isFinite(normal) || !Number.isFinite(pct)) return NaN;

  return redondear2(normal * (1 - pct / 100));
};

export const precioPromocionalValido = (precioVenta, precioPromo, enPromocion) => {
  if (enPromocion !== true) return false;
  return porcentajeDescuento(precioVenta, precioPromo) !== null;
};

// Normaliza un producto para que precioPromo y descuento sean coherentes.
// Calcula el porcentaje entero (1% a 99%) y normaliza precioPromo al monto exacto de ese porcentaje.
export const normalizarProducto = (producto) => {
  if (!producto) return producto;

  const precioVenta = producto.precioVenta ?? producto.precio_venta;
  const rawPromo =
    producto.precioPromo !== undefined ? producto.precioPromo : producto.precio_promo;
  const enPromocion = producto.enPromocion ?? producto.en_promocion;

  const porcentaje = enPromocion === true ? porcentajeDescuento(precioVenta, rawPromo) : null;
  const precioPromo = porcentaje !== null
    ? precioConDescuento(precioVenta, porcentaje)
    : (rawPromo !== undefined && rawPromo !== null && rawPromo !== ''
        ? redondear2(rawPromo)
        : rawPromo);

  return {
    ...producto,
    precioPromo,
    descuento: porcentaje
  };
};

export const precioVigente = (producto = {}) => {
  const normalizado = normalizarProducto(producto);
  const precioVenta = normalizado.precioVenta ?? normalizado.precio_venta;
  const enPromocion = normalizado.enPromocion ?? normalizado.en_promocion;

  if (precioPromocionalValido(precioVenta, normalizado.precioPromo, enPromocion)) {
    return Number(normalizado.precioPromo);
  }

  const numero = Number(precioVenta);
  return Number.isFinite(numero) ? numero : NaN;
};
