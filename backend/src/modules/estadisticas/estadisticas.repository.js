import { pool } from '../../config/db.js';

export const gananciasMensuales = async () => {
  const { rows } = await pool.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', v.fecha), 'YYYY-MM') AS periodo,
      COALESCE(SUM(v.total), 0)::numeric(10,2) AS ingresos,
      COALESCE(SUM(costos_pedido.costo_total), 0)::numeric(10,2) AS costos,
      (COALESCE(SUM(v.total), 0) - COALESCE(SUM(costos_pedido.costo_total), 0))::numeric(10,2) AS ganancia
    FROM ventas v
    LEFT JOIN (
      SELECT t.pedido_id, SUM(t.cantidad * p.precio_costo) AS costo_total
      FROM tiene t
      JOIN productos p ON p.id = t.producto_id
      GROUP BY t.pedido_id
    ) costos_pedido ON costos_pedido.pedido_id = v.pedido_id
    WHERE v.fecha >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
    GROUP BY DATE_TRUNC('month', v.fecha)
    ORDER BY DATE_TRUNC('month', v.fecha) ASC;
  `);
  return rows;
};

export const productosVencidos = async () => {
  const { rows } = await pool.query(`
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
    ORDER BY l.fecha_vencimiento ASC;
  `);
  return rows;
};

export const masVendidosPorMes = async (mes) => {
  // mes en formato 'YYYY-MM'
  const { rows } = await pool.query(`
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
    WHERE TO_CHAR(v.fecha, 'YYYY-MM') = $1
    GROUP BY p.id, p.nombre, p.marca, p.categoria
    ORDER BY total_unidades DESC
    LIMIT 10;
  `, [mes]);
  return rows;
};

export const promedioDiario = async () => {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(SUM(total), 0)::numeric(10,2) AS total_30_dias,
      (COALESCE(SUM(total), 0) / 30.0)::numeric(10,2) AS promedio_diario
    FROM ventas
    WHERE fecha >= CURRENT_DATE - INTERVAL '30 days';
  `);
  return rows[0];
};