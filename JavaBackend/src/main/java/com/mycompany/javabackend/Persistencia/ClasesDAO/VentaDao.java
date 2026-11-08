package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Venta;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class VentaDao implements DAO<Venta> {

    public VentaDao() {
    }

    @Override
    public void agregar(Venta venta) {
        String sql = "INSERT INTO ventas (fecha, total, pedido_id, activo) VALUES (?, ?, ?, true)";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al insertar venta: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, venta.getFecha());
            ps.setDouble(2, venta.getTotal());

            if (venta.getPedido() != null && venta.getPedido().getId() != null) {
                ps.setLong(3, venta.getPedido().getId());
            } else {
                ps.setNull(3, Types.BIGINT);
            }

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar venta: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar venta: no hay conexión disponible");
            return;
        }

        boolean autoCommitOriginal = obtenerAutoCommit(conn);

        try {
            conn.setAutoCommit(false);

            Long pedidoId = obtenerPedidoIdActivo(conn, id);
            if (pedidoId == null) {
                conn.rollback();
                return;
            }

            try (PreparedStatement ps = conn
                    .prepareStatement("UPDATE tiene SET activo = false WHERE pedido_id = ?")) {
                ps.setLong(1, pedidoId);
                ps.executeUpdate();
            }

            try (PreparedStatement ps = conn
                    .prepareStatement("UPDATE ventas SET activo = false WHERE id = ?")) {
                ps.setLong(1, id);
                ps.executeUpdate();
            }

            conn.commit();

        } catch (SQLException e) {
            rollback(conn);
            System.err.println("Error al eliminar venta: " + e.getMessage());
        } finally {
            restaurarAutoCommit(conn, autoCommitOriginal);
        }
    }

    @Override
    public void modificar(Venta venta) {
        String sql = "UPDATE ventas SET fecha = ?, total = ? WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar venta: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, venta.getFecha());
            ps.setDouble(2, venta.getTotal());
            ps.setLong(3, venta.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar venta: " + e.getMessage());
        }
    }

    @Override
    public Venta obtener(Long id) {
        String sql = "SELECT id, fecha, total, activo, pedido_id FROM ventas WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener venta por ID: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearVenta(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener venta por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Venta> obtenerTodos() {
        String sql = "SELECT id, fecha, total, activo, pedido_id FROM ventas "
                + "WHERE activo = true ORDER BY fecha ASC, id ASC";
        return listar(sql, "Error al listar las ventas activas: ");
    }

    @Override
    public List<Venta> obtenerTodosIncluyendoInactivos() {
        String sql = "SELECT id, fecha, total, activo, pedido_id FROM ventas "
                + "ORDER BY activo DESC, fecha ASC, id ASC";
        return listar(sql, "Error al listar todas las ventas: ");
    }

    private List<Venta> listar(String sql, String mensajeError) {
        List<Venta> lista = new ArrayList<>();
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println(mensajeError + "no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearVenta(rs));
            }

        } catch (SQLException e) {
            System.err.println(mensajeError + e.getMessage());
        }

        return lista;
    }

    private Long obtenerPedidoIdActivo(Connection conn, Long ventaId) throws SQLException {
        String sql = "SELECT pedido_id FROM ventas WHERE id = ? AND activo = true";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, ventaId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("pedido_id");
                }
            }
        }

        return null;
    }

    private boolean obtenerAutoCommit(Connection conn) {
        try {
            return conn.getAutoCommit();
        } catch (SQLException e) {
            throw new RuntimeException("No se pudo consultar el estado de la conexión", e);
        }
    }

    private void rollback(Connection conn) {
        try {
            conn.rollback();
        } catch (SQLException e) {
            System.err.println("Error al revertir la transacción: " + e.getMessage());
        }
    }

    private void restaurarAutoCommit(Connection conn, boolean autoCommitOriginal) {
        try {
            conn.setAutoCommit(autoCommitOriginal);
        } catch (SQLException e) {
            System.err.println("Error al restaurar el autoCommit de la conexión: " + e.getMessage());
        }
    }

    private Venta mapearVenta(ResultSet rs) throws SQLException {
        Venta venta = new Venta();

        venta.setId(rs.getLong("id"));
        venta.setFecha(rs.getDate("fecha"));
        venta.setTotal(rs.getDouble("total"));
        venta.setActivo(rs.getBoolean("activo"));

        Pedido pedido = new Pedido();
        pedido.setId(rs.getLong("pedido_id"));
        venta.setPedido(pedido);

        return venta;
    }
}
