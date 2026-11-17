import { pool } from '../../config/db.js';

export const crearEstadisticasRepository = (dbPool = pool) => {
  const gananciasMensuales = async () => {
    const { rows } = await dbPool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', v.fecha), 'YYYY-MM') AS periodo,
        COALESCE(SUM(COALESCE(v.total_modificado, p.total_modificado, v.total)), 0)::numeric(10,2) AS ingresos,
        COALESCE(SUM(costos_pedido.costo_total), 0)::numeric(10,2) AS costos,
        (COALESCE(SUM(COALESCE(v.total_modificado, p.total_modificado, v.total)), 0) - COALESCE(SUM(costos_pedido.costo_total), 0))::numeric(10,2) AS ganancia
      FROM ventas v
      LEFT JOIN pedidos p ON p.id = v.pedido_id
      LEFT JOIN (
        SELECT t.pedido_id, SUM(t.cantidad * pr.precio_costo) AS costo_total
        FROM tiene t
        JOIN productos pr ON pr.id = t.producto_id
        WHERE t.activo = true
        GROUP BY t.pedido_id
      ) costos_pedido ON costos_pedido.pedido_id = v.pedido_id
      WHERE v.activo = true
        AND v.fecha >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
      GROUP BY DATE_TRUNC('month', v.fecha)
      ORDER BY DATE_TRUNC('month', v.fecha) ASC;
    `);
    return rows;
  };

  const productosVencidos = async () => {
    const { rows } = await dbPool.query(`
      SELECT
        l.id AS lote_id,
        p.id AS producto_id,
        p.nombre,
        p.marca,
        p.categoria,
        l.fecha_vencimiento,
        (CURRENT_DATE - l.fecha_vencimiento) AS dias_vencido
      FROM lotes l
      JOIN productos p ON p.id = l.producto_id
      WHERE l.fecha_vencimiento < CURRENT_DATE
        AND l.activo = true
        AND l.cantidad > 0
        AND p.activo = true
      ORDER BY l.fecha_vencimiento ASC;
    `);
    return rows;
  };

  const masVendidosPorMes = async (mes) => {
    const { rows } = await dbPool.query(`
      SELECT
        p.id AS producto_id,
        p.nombre,
        p.marca,
        p.categoria,
        SUM(t.cantidad)::integer AS total_unidades,
        SUM(t.cantidad * t.precio)::numeric(10,2) AS total_recaudado
      FROM ventas v
      JOIN tiene t ON t.pedido_id = v.pedido_id
      JOIN productos p ON p.id = t.producto_id
      WHERE v.activo = true
        AND t.activo = true
        AND TO_CHAR(v.fecha, 'YYYY-MM') = $1
      GROUP BY p.id, p.nombre, p.marca, p.categoria
      ORDER BY total_unidades DESC
      LIMIT 10;
    `, [mes]);
    return rows;
  };

  const promedioDiario = async () => {
    const { rows } = await dbPool.query(`
      SELECT
        COALESCE(SUM(COALESCE(v.total_modificado, p.total_modificado, v.total)), 0)::numeric(10,2) AS total_30_dias,
        (COALESCE(SUM(COALESCE(v.total_modificado, p.total_modificado, v.total)), 0) / 30.0)::numeric(10,2) AS promedio_diario
      FROM ventas v
      LEFT JOIN pedidos p ON p.id = v.pedido_id
      WHERE v.activo = true
        AND v.fecha >= CURRENT_DATE - INTERVAL '30 days';
    `);
    return rows[0];
  };

  return {
    gananciasMensuales,
    productosVencidos,
    masVendidosPorMes,
    promedioDiario
  };
};

const defaultRepository = crearEstadisticasRepository();

export const gananciasMensuales = defaultRepository.gananciasMensuales;
export const productosVencidos = defaultRepository.productosVencidos;
export const masVendidosPorMes = defaultRepository.masVendidosPorMes;
export const promedioDiario = defaultRepository.promedioDiario;