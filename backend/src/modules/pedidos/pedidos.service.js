import * as repository from './pedidos.repository.js';
import * as repositoryRol from '../roles/roles.repository.js';
import * as repositoryTiene from '../tiene/tiene.repository.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import { precioVigente, redondear2 } from '../productos/productos.precio.js';

// Usuario con el que se registran los pedidos anónimos del checkout.
// En el seed corresponde a cliente1@gmail.com.
const USUARIO_PUBLICO_ID = 2;

const MAX_INT4 = 2147483647;
const ESTADOS_TRANSICION_PENDIENTE = ['pendiente', 'aprobado', 'rechazado'];

const ALIAS_ESTADOS = {
  aceptado: 'aprobado',
  cancelado: 'rechazado'
};

const MODALIDADES_ENTREGA = {
  retiro: 'Retiro',
  estandar: 'Delivery'
};

const METODO_PAGO_POR_DEFECTO = 'Efectivo';

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const asegurarObjeto = (data, mensaje = 'El cuerpo de la petición debe ser un objeto JSON válido') => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw crearError(mensaje, 400);
  }
};

const leerStringOpcional = (valor, campo) => {
  if (valor === undefined || valor === null) return '';
  if (typeof valor !== 'string') {
    throw crearError(`El campo ${campo} debe ser texto`, 400);
  }
  return valor.trim();
};

const validarEnteroPositivo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor <= 0 || valor > MAX_INT4) {
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
    if (!Number.isInteger(numero) || numero <= 0 || numero > MAX_INT4) {
      throw crearError(mensaje, 400);
    }
    return numero;
  }

  throw crearError(mensaje, 400);
};

const validarDecimal = (valor, { min = 0, exclusivo = false }, mensaje) => {
  let numero;
  if (typeof valor === 'number') {
    numero = valor;
  } else if (typeof valor === 'string') {
    const limpio = valor.trim();
    if (!/^\d+(\.\d+)?$/.test(limpio)) {
      throw crearError(mensaje, 400);
    }
    numero = Number(limpio);
  } else {
    throw crearError(mensaje, 400);
  }

  if (!Number.isFinite(numero) || (exclusivo ? numero <= min : numero < min)) {
    throw crearError(mensaje, 400);
  }
  return numero;
};

const validarId = (id, mensaje = 'El ID del pedido no es válido') => {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0 || num > MAX_INT4) {
    throw crearError(mensaje, 400);
  }
  return num;
};

const normalizarEstado = (valor) => {
  if (!valor) return null;
  const estado = String(valor).trim().toLowerCase();
  return ALIAS_ESTADOS[estado] || estado;
};

const normalizarModalidad = (valor) => {
  if (!valor) return null;
  const clave = String(valor).trim().toLowerCase();
  return MODALIDADES_ENTREGA[clave] || null;
};

export const listarPedidos = async () => {
  return await repository.findAll();
};

export const listarHistorialPedidos = async () => {
  return await repository.findHistorial();
};

export const obtenerPedidoPorId = async (id, incluirInactivos = false) => {
  const idValido = validarId(id);
  const pedido = await repository.findByIdConItems(idValido, incluirInactivos);
  if (!pedido) {
    throw crearError('Pedido no encontrado', 404);
  }
  return pedido;
};

const normalizarItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw crearError('El pedido debe incluir al menos un producto', 400);
  }

  const acumulados = new Map();

  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw crearError('Cada ítem del pedido debe ser un objeto válido', 400);
    }
    const productoId = validarId(item.productoId ?? item.producto_id, 'Cada ítem debe indicar un producto válido');

    const cantidad = validarEnteroPositivo(
      item.cantidad,
      'La cantidad de cada producto debe ser un entero mayor a 0'
    );

    const producto = await repositoryProducto.findById(productoId);
    if (!producto) {
      throw crearError(`El producto #${productoId} no existe`, 404);
    }

    const precio = precioVigente(producto);
    if (!Number.isFinite(precio) || precio <= 0) {
      throw crearError(`El producto #${productoId} no tiene un precio de venta válido`, 400);
    }

    const existente = acumulados.get(producto.id);

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      acumulados.set(producto.id, { productoId: producto.id, cantidad, precio });
    }
  }

  return [...acumulados.values()];
};

export const obtenerLotesDisponibles = async (id) => {
  const idValido = validarId(id);
  const pedido = await repository.findById(idValido);
  if (!pedido) {
    throw crearError('Pedido no encontrado', 404);
  }
  return await repository.findLotesDisponiblesParaPedido(idValido);
};

export const crearPedido = async (data) => {
  asegurarObjeto(data);
  const usuario = await repositoryRol.findById(USUARIO_PUBLICO_ID);
  if (!usuario) {
    throw crearError('No existe el usuario por defecto para registrar pedidos', 500);
  }

  const comercio = leerStringOpcional(data.nombreComercio ?? data.comercio, 'nombreComercio');
  const telefono = leerStringOpcional(data.telefono, 'telefono');
  const personaContacto = leerStringOpcional(data.personaContacto, 'personaContacto');
  const descripcionDireccion = leerStringOpcional(data.descripcionDireccion, 'descripcionDireccion');
  const observaciones = leerStringOpcional(data.observacionesPedido ?? data.observaciones, 'observaciones');
  const metodoEntregaRaw = leerStringOpcional(data.metodoEntrega ?? data.modalidadEntrega, 'metodoEntrega');
  const modalidadEntrega = normalizarModalidad(metodoEntregaRaw);
  const esRetiro = metodoEntregaRaw.toLowerCase() === 'retiro';
  const direccion = esRetiro
    ? 'Retiro en local'
    : leerStringOpcional(data.direccion, 'direccion') || null;

  if (!comercio) {
    throw crearError('El nombre del comercio es obligatorio', 400);
  }

  if (comercio.length > 100) {
    throw crearError('El nombre del comercio no puede superar los 100 caracteres', 400);
  }

  if (!/^\+?[0-9]{7,15}$/.test(telefono)) {
    throw crearError('El teléfono debe contener entre 7 y 15 dígitos numéricos', 400);
  }

  if (!modalidadEntrega) {
    throw crearError('El método de entrega es obligatorio o no es válido', 400);
  }

  const metodoPagoRaw = leerStringOpcional(data.metodoPago, 'metodoPago');
  const metodoPagoFinal = metodoPagoRaw || METODO_PAGO_POR_DEFECTO;
  if (metodoPagoFinal.length > 30) {
    throw crearError('El método de pago no puede superar los 30 caracteres', 400);
  }

  if (!esRetiro && !direccion) {
    throw crearError('La dirección de entrega es obligatoria para envíos', 400);
  }

  if (direccion && direccion.length > 150) {
    throw crearError('La dirección no puede superar los 150 caracteres', 400);
  }

  if (personaContacto.length > 100) {
    throw crearError('La persona de contacto no puede superar los 100 caracteres', 400);
  }

  if (descripcionDireccion.length > 255) {
    throw crearError('La descripción de la dirección no puede superar los 255 caracteres', 400);
  }

  if (observaciones.length > 2000) {
    throw crearError('Las observaciones no pueden superar los 2000 caracteres', 400);
  }

  const items = await normalizarItems(data.items);

  const envio = 0;
  const subtotal = redondear2(items.reduce((acc, item) => acc + item.precio * item.cantidad, 0));
  const total = subtotal;

  if (!(total > 0)) {
    throw crearError('El total del pedido debe ser mayor a 0', 400);
  }

  const pedido = {
    fecha: null,
    subtotal,
    envio,
    total,
    metodoPago: metodoPagoFinal,
    telefono,
    comercio,
    personaContacto: personaContacto || null,
    modalidadEntrega,
    direccion,
    descripcionDireccion: descripcionDireccion || null,
    observaciones: observaciones || null,
    estado: 'pendiente',
    motivoRechazo: null,
    usuarioId: usuario.id
  };

  return await repository.createConItems(pedido, items);
};

const validarModificacionTotal = (data) => {
  const rawTotalModificado = data.totalModificado !== undefined ? data.totalModificado : data.total_modificado;
  const rawMotivo = data.motivoModificacion !== undefined ? data.motivoModificacion : data.motivo_modificacion;

  if (rawTotalModificado === undefined) {
    return {};
  }

  if (rawTotalModificado === null || (typeof rawTotalModificado === 'string' && rawTotalModificado.trim() === '')) {
    return { totalModificado: null, motivoModificacion: null };
  }

  const totalModificado = validarDecimal(
    rawTotalModificado,
    { min: 0, exclusivo: true },
    'El total modificado del pedido debe ser mayor a 0'
  );

  const motivoModificacion = leerStringOpcional(rawMotivo, 'motivoModificacion');

  if (!motivoModificacion) {
    throw crearError('El motivo de modificación del total es obligatorio', 400);
  }

  if (motivoModificacion.length > 500) {
    throw crearError('El motivo de modificación no puede superar los 500 caracteres', 400);
  }

  return { totalModificado, motivoModificacion };
};

export const actualizarPedido = async (id, data) => {
  asegurarObjeto(data);
  const idValido = validarId(id);
  const pedidoExistente = await repository.findById(idValido);
  if (!pedidoExistente) {
    throw crearError('Pedido no encontrado', 404);
  }

  if (pedidoExistente.activo === false) {
    throw crearError('No se puede modificar un pedido eliminado', 409);
  }

  const estadoActual = String(pedidoExistente.estado ?? '').trim().toLowerCase();
  if (!['pendiente', 'nuevo'].includes(estadoActual)) {
    throw crearError('Solo se pueden modificar pedidos pendientes', 409);
  }

  const modificacionTotal = validarModificacionTotal(data);

  const estadoRaw = data.estado !== undefined ? leerStringOpcional(data.estado, 'estado') : undefined;
  const estadoSolicitado = estadoRaw ? normalizarEstado(estadoRaw) : null;
  const motivoRechazo = data.motivoRechazo !== undefined
    ? leerStringOpcional(data.motivoRechazo, 'motivoRechazo')
    : undefined;

  if (data.estado !== undefined) {
    if (!estadoSolicitado || !ESTADOS_TRANSICION_PENDIENTE.includes(estadoSolicitado)) {
      throw crearError('El estado del pedido no es válido o no está permitido desde pendiente', 400);
    }

    if (estadoSolicitado === 'rechazado') {
      if (!motivoRechazo) {
        throw crearError('El motivo de rechazo es obligatorio', 400);
      }

      if (motivoRechazo.length > 500) {
        throw crearError('El motivo de rechazo no puede superar los 500 caracteres', 400);
      }
    }

    if (estadoSolicitado === 'aprobado') {
      const asignaciones = Array.isArray(data.asignacionesLotes)
        ? data.asignacionesLotes
        : Array.isArray(data.lotes)
          ? data.lotes
          : null;
      return await repository.aprobarPedido(idValido, modificacionTotal, asignaciones);
    }
  }

  let direccionActualizada;
  if (data.direccion !== undefined) {
    direccionActualizada = leerStringOpcional(data.direccion, 'direccion');
    if (direccionActualizada.length > 150) {
      throw crearError('La dirección no puede superar los 150 caracteres', 400);
    }
  }

  let metodoPagoActualizado;
  if (data.metodoPago !== undefined) {
    metodoPagoActualizado = leerStringOpcional(data.metodoPago, 'metodoPago');
    if (!metodoPagoActualizado || metodoPagoActualizado.length > 30) {
      throw crearError('El método de pago es obligatorio y no puede superar los 30 caracteres', 400);
    }
  }

  let telefonoActualizado;
  if (data.telefono !== undefined) {
    telefonoActualizado = leerStringOpcional(data.telefono, 'telefono');
    if (!/^\+?[0-9]{7,15}$/.test(telefonoActualizado)) {
      throw crearError('El teléfono debe contener entre 7 y 15 dígitos numéricos', 400);
    }
  }

  const pedidoActualizado = {
    ...pedidoExistente,
    ...(estadoSolicitado ? { estado: estadoSolicitado } : {}),
    ...(motivoRechazo !== undefined ? { motivoRechazo } : {}),
    ...(direccionActualizada !== undefined ? { direccion: direccionActualizada } : {}),
    ...(metodoPagoActualizado !== undefined ? { metodoPago: metodoPagoActualizado } : {}),
    ...(telefonoActualizado !== undefined ? { telefono: telefonoActualizado } : {}),
    ...modificacionTotal
  };

  return await repository.update(idValido, pedidoActualizado);
};

export const eliminarPedido = async (id) => {
  const idValido = validarId(id);
  const rowCount = await repository.remove(idValido);
  if (rowCount === 0) {
    throw crearError('Pedido no encontrado', 404);
  }
  return true;
};

export const eliminarItemDePedido = async () => {
  throw crearError('No está permitido eliminar ítems de un pedido', 400);
};
