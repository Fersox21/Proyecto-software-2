import * as repository from './pedidos.repository.js';
import * as repositoryRol from '../roles/roles.repository.js';
import * as repositoryTiene from '../tiene/tiene.repository.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import { precioVigente } from '../productos/productos.precio.js';

// Usuario con el que se registran los pedidos anónimos del checkout.
// En el seed corresponde a cliente1@gmail.com.
const USUARIO_PUBLICO_ID = 2;

const ESTADOS_VALIDOS = ['pendiente', 'aprobado', 'rechazado', 'entregado', 'eliminado'];

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

const validarEnteroPositivo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor <= 0) {
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
    if (!Number.isSafeInteger(numero) || numero <= 0) {
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

const normalizarEstado = (valor) => {
  if (!valor) return null;
  const estado = String(valor).trim().toLowerCase();
  return ALIAS_ESTADOS[estado] || estado;
};

const normalizarModalidad = (valor) => {
  if (!valor) return null;
  const clave = String(valor).trim().toLowerCase();
  return MODALIDADES_ENTREGA[clave] || valor;
};

export const listarPedidos = async () => {
  return await repository.findAll();
};

export const listarHistorialPedidos = async () => {
  return await repository.findHistorial();
};

export const obtenerPedidoPorId = async (id, incluirInactivos = false) => {
  const pedido = await repository.findByIdConItems(id, incluirInactivos);
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
    const productoId = Number(item.productoId ?? item.producto_id);

    if (!Number.isInteger(productoId) || productoId <= 0) {
      throw crearError('Cada ítem debe indicar un producto válido', 400);
    }

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
  const pedido = await repository.findById(id);
  if (!pedido) {
    throw crearError('Pedido no encontrado', 404);
  }
  return await repository.findLotesDisponiblesParaPedido(id);
};

export const crearPedido = async (data) => {
  const usuario = await repositoryRol.findById(USUARIO_PUBLICO_ID);
  if (!usuario) {
    throw crearError('No existe el usuario por defecto para registrar pedidos', 500);
  }

  const comercio = String(data.nombreComercio ?? data.comercio ?? '').trim();
  const telefono = String(data.telefono ?? '').trim();
  const personaContacto = String(data.personaContacto ?? '').trim();
  const descripcionDireccion = String(data.descripcionDireccion ?? '').trim();
  const observaciones = String(data.observacionesPedido ?? data.observaciones ?? '').trim();
  const metodoEntrega = data.metodoEntrega ?? data.modalidadEntrega;
  const modalidadEntrega = normalizarModalidad(metodoEntrega);
  const esRetiro = String(metodoEntrega ?? '').trim().toLowerCase() === 'retiro';
  const direccion = esRetiro
    ? 'Retiro en local'
    : String(data.direccion ?? '').trim() || null;

  if (!comercio) {
    throw crearError('El nombre del comercio es obligatorio', 400);
  }

  if (comercio.length > 100) {
    throw crearError('El nombre del comercio no puede superar los 100 caracteres', 400);
  }

  if (!telefono) {
    throw crearError('El teléfono de contacto es obligatorio', 400);
  }

  if (!modalidadEntrega) {
    throw crearError('El método de entrega es obligatorio', 400);
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

  const envio = data.envio === undefined
    ? 0
    : validarDecimal(data.envio, { min: 0, exclusivo: false }, 'El costo de envío no es válido');

  const subtotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  const total = subtotal + envio;

  if (!(total > 0)) {
    throw crearError('El total del pedido debe ser mayor a 0', 400);
  }

  const pedido = {
    fecha: null,
    subtotal,
    envio,
    total,
    metodoPago: String(data.metodoPago ?? METODO_PAGO_POR_DEFECTO).trim() || METODO_PAGO_POR_DEFECTO,
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

  const motivoModificacion = rawMotivo !== undefined && rawMotivo !== null
    ? String(rawMotivo).trim()
    : '';

  if (!motivoModificacion) {
    throw crearError('El motivo de modificación del total es obligatorio', 400);
  }

  return { totalModificado, motivoModificacion };
};

export const actualizarPedido = async (id, data) => {
  const pedidoExistente = await repository.findById(id);
  if (!pedidoExistente) {
    throw crearError('Pedido no encontrado', 404);
  }

  const modificacionTotal = validarModificacionTotal(data);

  const estadoSolicitado = normalizarEstado(data.estado);
  const motivoRechazo = data.motivoRechazo === undefined
    ? undefined
    : String(data.motivoRechazo).trim();

  if (data.estado !== undefined) {
    if (!ESTADOS_VALIDOS.includes(estadoSolicitado)) {
      throw crearError('El estado del pedido no es válido', 400);
    }

    const estadoActual = String(pedidoExistente.estado ?? '').trim().toLowerCase();
    if (!['pendiente', 'nuevo'].includes(estadoActual)) {
      throw crearError('Solo se pueden modificar pedidos pendientes', 409);
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
      return await repository.aprobarPedido(id, modificacionTotal, asignaciones);
    }
  }

  const pedidoActualizado = {
    ...pedidoExistente,
    ...(estadoSolicitado ? { estado: estadoSolicitado } : {}),
    ...(motivoRechazo !== undefined ? { motivoRechazo } : {}),
    ...(data.direccion !== undefined ? { direccion: data.direccion } : {}),
    ...(data.metodoPago !== undefined ? { metodoPago: data.metodoPago } : {}),
    ...(data.telefono !== undefined ? { telefono: data.telefono } : {}),
    ...modificacionTotal
  };

  return await repository.update(id, pedidoActualizado);
};

export const eliminarPedido = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    throw crearError('Pedido no encontrado', 404);
  }
  return true;
};

export const eliminarItemDePedido = async (pedido_id, producto_id) => {
  // 1. Eliminación lógica del ítem
  const rowCount = await repositoryTiene.remove(pedido_id, producto_id);

  if (rowCount === 0) {
    throw crearError('Ítem no encontrado en el pedido', 404);
  }

  // 2. Verificación de ítems restantes (ignora los dados de baja)
  const itemsRestantes = (await repositoryTiene.findByPedido(pedido_id)).filter(
    (item) => item.activo !== false
  );
  let pedidoEliminado = false;
  let nuevoTotal = 0;

  if (itemsRestantes.length > 0) {
    nuevoTotal = itemsRestantes.reduce(
      (acc, item) => acc + parseFloat(item.precio) * item.cantidad,
      0
    );
  }

  // 3. Actualizar el pedido
  const pedido = await repository.findById(pedido_id);
  if (pedido) {
    const dataActualizacion = { ...pedido };

    if (itemsRestantes.length === 0) {
      dataActualizacion.estado = 'eliminado';
      pedidoEliminado = true;
    } else {
      dataActualizacion.total = nuevoTotal;
    }

    await repository.update(pedido_id, dataActualizacion);
  }

  return {
    success: true,
    message: pedidoEliminado
      ? 'Ítem eliminado y pedido marcado como eliminado'
      : 'Ítem eliminado y total del pedido actualizado',
    pedido_id,
    producto_id,
    pedido_eliminado: pedidoEliminado,
    nuevo_total: nuevoTotal
  };
};
