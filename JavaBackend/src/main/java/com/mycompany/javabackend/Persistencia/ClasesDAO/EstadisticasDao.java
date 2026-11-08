package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.mycompany.javabackend.Persistencia.connection.Conexion;

/**
 * Consultas de solo lectura para el panel de estadísticas.
 *
 * Devuelve mapas con las mismas claves snake_case que expone el backend Node,
 * de forma que el frontend pueda consumir cualquiera de los dos sin cambios.
 */
public class EstadisticasDao {

    private static final String SQL_GANANCIAS_MENSUALES = "SELECT "
            + "TO_CHAR(DATE_TRUNC('month', v.fecha), 'YYYY-MM') AS periodo, "
            + "COALESCE(SUM(v.total), 0)::numeric(10,2) AS ingresos, "
            + "COALESCE(SUM(costos_pedido.costo_total), 0)::numeric(10,2) AS costos, "
            + "(COALESCE(SUM(v.total), 0) - COALESCE(SUM(costos_pedido.costo_total), 0))::numeric(10,2) AS ganancia "
            + "FROM ventas v "
            + "LEFT JOIN ( "
            + "    SELECT t.pedido_id, SUM(t.cantidad * p.precio_costo) AS costo_total "
            + "    FROM tiene t "
            + "    JOIN productos p ON p.id = t.producto_id "
            + "    GROUP BY t.pedido_id "
            + ") costos_pedido ON costos_pedido.pedido_id = v.pedido_id "
            + "WHERE v.fecha >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months') "
            + "GROUP BY DATE_TRUNC('month', v.fecha) "
            + "ORDER BY DATE_TRUNC('month', v.fecha) ASC";

    private static final String SQL_PRODUCTOS_VENCIDOS = "SELECT "
            + "l.id AS lote_id, "
            + "p.id AS producto_id, "
            + "p.nombre, "
            + "p.marca, "
            + "p.categoria, "
            + "l.fecha_vencimiento, "
            + "(CURRENT_DATE - l.fecha_vencimiento) AS dias_vencido "
            + "FROM lotes l "
            + "JOIN productos p ON p.id = l.producto_id "
            + "WHERE l.fecha_vencimiento < CURRENT_DATE "
            + "ORDER BY l.fecha_vencimiento ASC";

    private static final String SQL_MAS_VENDIDOS = "SELECT "
            + "p.id AS producto_id, "
            + "p.nombre, "
            + "p.marca, "
            + "p.categoria, "
            + "SUM(t.cantidad)::integer AS total_unidades, "
            + "SUM(t.cantidad * t.precio)::numeric(10,2) AS total_recaudado "
            + "FROM ventas v "
            + "JOIN tiene t ON t.pedido_id = v.pedido_id "
            + "JOIN productos p ON p.id = t.producto_id "
            + "WHERE TO_CHAR(v.fecha, 'YYYY-MM') = ? "
            + "GROUP BY p.id, p.nombre, p.marca, p.categoria "
            + "ORDER BY total_unidades DESC "
            + "LIMIT 10";

    private static final String SQL_PROMEDIO_DIARIO = "SELECT "
            + "COALESCE(SUM(total), 0)::numeric(10,2) AS total_30_dias, "
            + "(COALESCE(SUM(total), 0) / 30.0)::numeric(10,2) AS promedio_diario "
            + "FROM ventas "
            + "WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'";

    public EstadisticasDao() {
    }

    /**
     * Ingresos, costos y ganancia agrupados por mes de los últimos 12 meses.
     */
    public List<Map<String, Object>> gananciasMensuales() {
        List<Map<String, Object>> lista = new ArrayList<>();
        Connection conn = obtenerConexion();

        try (PreparedStatement ps = conn.prepareStatement(SQL_GANANCIAS_MENSUALES);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> fila = new LinkedHashMap<>();
                fila.put("periodo", rs.getString("periodo"));
                fila.put("ingresos", rs.getBigDecimal("ingresos"));
                fila.put("costos", rs.getBigDecimal("costos"));
                fila.put("ganancia", rs.getBigDecimal("ganancia"));
                lista.add(fila);
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener las ganancias mensuales: " + e.getMessage(), e);
        }

        return lista;
    }

    /**
     * Lotes con fecha de vencimiento anterior a la fecha actual.
     */
    public List<Map<String, Object>> productosVencidos() {
        List<Map<String, Object>> lista = new ArrayList<>();
        Connection conn = obtenerConexion();

        try (PreparedStatement ps = conn.prepareStatement(SQL_PRODUCTOS_VENCIDOS);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> fila = new LinkedHashMap<>();
                fila.put("lote_id", rs.getLong("lote_id"));
                fila.put("producto_id", rs.getLong("producto_id"));
                fila.put("nombre", rs.getString("nombre"));
                fila.put("marca", rs.getString("marca"));
                fila.put("categoria", rs.getString("categoria"));
                fila.put("fecha_vencimiento", formatearFecha(rs.getDate("fecha_vencimiento")));
                fila.put("dias_vencido", rs.getInt("dias_vencido"));
                lista.add(fila);
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los productos vencidos: " + e.getMessage(), e);
        }

        return lista;
    }

    /**
     * Top 10 de productos más vendidos en el mes indicado (formato YYYY-MM).
     */
    public List<Map<String, Object>> masVendidosPorMes(String mes) {
        List<Map<String, Object>> lista = new ArrayList<>();
        Connection conn = obtenerConexion();

        try (PreparedStatement ps = conn.prepareStatement(SQL_MAS_VENDIDOS)) {
            ps.setString(1, mes);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> fila = new LinkedHashMap<>();
                    fila.put("producto_id", rs.getLong("producto_id"));
                    fila.put("nombre", rs.getString("nombre"));
                    fila.put("marca", rs.getString("marca"));
                    fila.put("categoria", rs.getString("categoria"));
                    fila.put("total_unidades", rs.getInt("total_unidades"));
                    fila.put("total_recaudado", rs.getBigDecimal("total_recaudado"));
                    lista.add(fila);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los productos más vendidos: " + e.getMessage(), e);
        }

        return lista;
    }

    /**
     * Total recaudado y promedio diario de los últimos 30 días.
     */
    public Map<String, Object> promedioDiario() {
        Connection conn = obtenerConexion();

        try (PreparedStatement ps = conn.prepareStatement(SQL_PROMEDIO_DIARIO);
                ResultSet rs = ps.executeQuery()) {

            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("total_30_dias", BigDecimal.ZERO);
            fila.put("promedio_diario", BigDecimal.ZERO);

            if (rs.next()) {
                fila.put("total_30_dias", valorDecimal(rs.getBigDecimal("total_30_dias")));
                fila.put("promedio_diario", valorDecimal(rs.getBigDecimal("promedio_diario")));
            }

            return fila;

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener el promedio diario: " + e.getMessage(), e);
        }
    }

    private Connection obtenerConexion() {
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            throw new RuntimeException("No hay conexión disponible con la base de datos");
        }
        return conn;
    }

    private String formatearFecha(Date fecha) {
        return fecha != null ? fecha.toLocalDate().toString() : null;
    }

    private BigDecimal valorDecimal(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}
