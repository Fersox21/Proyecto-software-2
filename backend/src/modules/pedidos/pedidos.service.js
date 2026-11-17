import * as defaultRepository from './pedidos.repository.js';
import * as defaultRepositoryRol from '../roles/roles.repository.js';
import * as defaultRepositoryProducto from '../productos/productos.repository.js';
import { precioVigente, redondear2 } from '../productos/productos.precio.js';
import { crearError, validarIdEnteroPositivo } from '../../utils/validaciones.js';

const USUARIO_PUBLICO_ID = 2;
export const ENVIO_GRATIS_DESDE = 60000;
export const COSTO_ENVIO = 1800;

const ESTADOS_VALIDOS = ['pendiente', 'aprobado', 'rechazado', 'entregado', 'eliminado'];

const ALIAS_ESTADOS = {
  aceptado: 'aprobado',
  cancelado: 'rechazado'
};

const MODALIDADES_ENTREGA = {
  retiro: 'Retiro',
  estandar: 'Delivery',
  delivery: 'Delivery'
};

const METODO_PAGO_POR_DEFECTO = 'Efectivo';
const REGEX_TELEFONO = /^\+?[0-9]{7,15}$/;

export const calcularEnvio = (modalidadEntrega, subtotal) => {
  if (modalidadEntrega === 'Delivery' && Number(subtotal) < ENVIO_GRATIS_DESDE) {
    return COSTO_ENVIO;
  }
  return 0;
};

const validarEnteroPositivo = (valor, mensaje) => validarIdEnteroPositivo(valor, mensaje);

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
  if (!valor || typeof valor !== 'string') return null;
  const clave = valor.trim().toLowerCase();
  return MODALIDADES_ENTREGA[clave] ?? null;
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

export const crearPedidosService = ({
  repository = defaultRepository,
  repositoryRol = defaultRepositoryRol,
  repositoryProducto = defaultRepositoryProducto
} = {}) => {
  const listarPedidos = async () => {
    return await repository.findAll();
  };

  const listarHistorialPedidos = async () => {
    return await repository.findHistorial();
  };

  const obtenerPedidoPorId = async (id, incluirInactivos = false) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de pedido inválido');
    const pedido = await repository.findByIdConItems(idNum, incluirInactivos);
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
      if (!item || typeof item !== 'object') {
        throw crearError('Cada ítem debe ser un objeto válido', 400);
      }

      const rawProdId = item.productoId ?? item.producto_id;
      const productoId = validarIdEnteroPositivo(
        rawProdId,
        'Cada ítem debe indicar un producto válido'
      );

      const cantidad = validarEnteroPositivo(
        item.cantidad,
        'La cantidad de cada producto debe ser un entero mayor a 0'
      );

      const producto = await repositoryProducto.findById(productoId);
      if (!producto) {
        throw crearError(`El producto #${productoId} no existe`, 404);
      }
      if (producto.activo === false || producto.visibleCatalogo === false) {
        throw crearError(`El producto #${productoId} no está disponible para pedidos`, 400);
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

  const obtenerLotesDisponibles = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de pedido inválido');
    const pedido = await repository.findById(idNum);
    if (!pedido) {
      throw crearError('Pedido no encontrado', 404);
    }
    return await repository.findLotesDisponiblesParaPedido(idNum);
  };

  const crearPedido = async (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw crearError('Los datos del pedido no son válidos', 400);
    }

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
    const esRetiro = modalidadEntrega === 'Retiro';
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

    if (!REGEX_TELEFONO.test(telefono)) {
      throw crearError('El teléfono debe contener entre 7 y 15 dígitos (puede iniciar con +)', 400);
    }

    if (!modalidadEntrega) {
      throw crearError('El método de entrega es obligatorio y debe ser Retiro o Delivery', 400);
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

    const metodoPago = String(data.metodoPago ?? METODO_PAGO_POR_DEFECTO).trim() || METODO_PAGO_POR_DEFECTO;
    if (metodoPago.length > 30) {
      throw crearError('El método de pago no puede superar los 30 caracteres', 400);
    }

    const items = await normalizarItems(data.items);

    const subtotal = redondear2(
      items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    );
    const envio = calcularEnvio(modalidadEntrega, subtotal);
    const total = redondear2(subtotal + envio);

    if (!(total > 0)) {
      throw crearError('El total del pedido debe ser mayor a 0', 400);
    }

    const pedido = {
      fecha: null,
      subtotal,
      envio,
      total,
      metodoPago,
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

  const actualizarPedido = async (id, data) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de pedido inválido');
    const pedidoExistente = await repository.findById(idNum);
    if (!pedidoExistente) {
      throw crearError('Pedido no encontrado', 404);
    }

    const modificacionTotal = validarModificacionTotal(data ?? {});

    const estadoSolicitado = normalizarEstado(data?.estado);
    const motivoRechazo = data?.motivoRechazo === undefined
      ? undefined
      : String(data.motivoRechazo).trim();

    if (data?.telefono !== undefined) {
      const tel = String(data.telefono).trim();
      if (!REGEX_TELEFONO.test(tel)) {
        throw crearError('El teléfono debe contener entre 7 y 15 dígitos (puede iniciar con +)', 400);
      }
    }

    if (data?.estado !== undefined) {
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
        return await repository.aprobarPedido(idNum, modificacionTotal, asignaciones);
      }
    }

    const pedidoActualizado = {
      ...pedidoExistente,
      ...(estadoSolicitado ? { estado: estadoSolicitado } : {}),
      ...(motivoRechazo !== undefined ? { motivoRechazo } : {}),
      ...(data?.direccion !== undefined ? { direccion: data.direccion } : {}),
      ...(data?.metodoPago !== undefined ? { metodoPago: data.metodoPago } : {}),
      ...(data?.telefono !== undefined ? { telefono: String(data.telefono).trim() } : {}),
      ...modificacionTotal
    };

    return await repository.update(idNum, pedidoActualizado);
  };

  const eliminarPedido = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de pedido inválido');
    const rowCount = await repository.remove(idNum);
    if (rowCount === 0) {
      throw crearError('Pedido no encontrado', 404);
    }
    return true;
  };

  const eliminarItemDePedido = async (pedido_id, producto_id) => {
    const pedidoId = validarIdEnteroPositivo(pedido_id, 'ID de pedido inválido');
    const productoId = validarIdEnteroPositivo(producto_id, 'ID de producto inválido');

    return await repository.eliminarItemConRecalculo(pedidoId, productoId, calcularEnvio);
  };

  return {
    listarPedidos,
    listarHistorialPedidos,
    obtenerPedidoPorId,
    obtenerLotesDisponibles,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    eliminarItemDePedido
  };
};

const defaultService = crearPedidosService();

export const listarPedidos = defaultService.listarPedidos;
export const listarHistorialPedidos = defaultService.listarHistorialPedidos;
export const obtenerPedidoPorId = defaultService.obtenerPedidoPorId;
export const obtenerLotesDisponibles = defaultService.obtenerLotesDisponibles;
export const crearPedido = defaultService.crearPedido;
export const actualizarPedido = defaultService.actualizarPedido;
export const eliminarPedido = defaultService.eliminarPedido;
export const eliminarItemDePedido = defaultService.eliminarItemDePedido;
