package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Rol;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class PedidoDao implements DAO<Pedido> {

    private static final String SQL_SELECT = "SELECT id, fecha, total, metodo_pago, comercio, modalidad_entrega, "
            + "direccion, estado, motivo_rechazo, activo, rol_id FROM pedidos";

    public PedidoDao() {
    }

    @Override
    public void agregar(Pedido pedido) {
        agregarYObtenerId(pedido);
    }

    public Long agregarYObtenerId(Pedido pedido) {
        String sql = "INSERT INTO pedidos (fecha, total, metodo_pago, comercio, modalidad_entrega, direccion, "
                + "estado, motivo_rechazo, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)";
        Long idGenerado = null;
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al insertar pedido: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setDate(1, pedido.getFecha());
            ps.setDouble(2, pedido.getTotal());
            ps.setString(3, pedido.getMetodoPago());
            ps.setString(4, pedido.getComercio());
            ps.setString(5, pedido.getModalidadEntrega());
            ps.setString(6, pedido.getDireccion());
            ps.setString(7, pedido.getEstado());
            ps.setString(8, pedido.getMotivoRechazo());

            if (pedido.getRol() != null && pedido.getRol().getId() != null) {
                ps.setLong(9, pedido.getRol().getId());
            } else {
                ps.setNull(9, Types.BIGINT);
            }

            int filasAfectadas = ps.executeUpdate();

            if (filasAfectadas > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        idGenerado = rs.getLong(1);
                        pedido.setId(idGenerado);
                    }
                }
            }

        } catch (SQLException e) {
            System.err.println("Error al insertar pedido: " + e.getMessage());
        }

        return idGenerado;
    }

    @Override
    public void eliminar(Long id) {
        String sql = "UPDATE pedidos SET activo = false WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar pedido: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar pedido: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Pedido pedido) {
        String sql = "UPDATE pedidos SET fecha = ?, total = ?, metodo_pago = ?, comercio = ?, "
                + "modalidad_entrega = ?, direccion = ?, estado = ?, motivo_rechazo = ? "
                + "WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar pedido: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, pedido.getFecha());
            ps.setDouble(2, pedido.getTotal());
            ps.setString(3, pedido.getMetodoPago());
            ps.setString(4, pedido.getComercio());
            ps.setString(5, pedido.getModalidadEntrega());
            ps.setString(6, pedido.getDireccion());
            ps.setString(7, pedido.getEstado());
            ps.setString(8, pedido.getMotivoRechazo());
            ps.setLong(9, pedido.getId());

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar pedido: " + e.getMessage());
        }
    }

    @Override
    public Pedido obtener(Long id) {
        String sql = SQL_SELECT + " WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener pedido por ID: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearPedido(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener pedido por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Pedido> obtenerTodos() {
        String sql = SQL_SELECT + " WHERE activo = true ORDER BY fecha ASC, id ASC";
        return listar(sql, "Error al listar los pedidos activos: ");
    }

    @Override
    public List<Pedido> obtenerTodosIncluyendoInactivos() {
        String sql = SQL_SELECT + " ORDER BY activo DESC, fecha ASC, id ASC";
        return listar(sql, "Error al listar todos los pedidos: ");
    }

    private List<Pedido> listar(String sql, String mensajeError) {
        List<Pedido> lista = new ArrayList<>();
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println(mensajeError + "no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearPedido(rs));
            }

        } catch (SQLException e) {
            System.err.println(mensajeError + e.getMessage());
        }

        return lista;
    }

    private Pedido mapearPedido(ResultSet rs) throws SQLException {
        Pedido pedido = new Pedido();

        pedido.setId(rs.getLong("id"));
        pedido.setFecha(rs.getDate("fecha"));
        pedido.setTotal(rs.getDouble("total"));
        pedido.setMetodoPago(rs.getString("metodo_pago"));
        pedido.setComercio(rs.getString("comercio"));
        pedido.setModalidadEntrega(rs.getString("modalidad_entrega"));
        pedido.setDireccion(rs.getString("direccion"));
        pedido.setEstado(rs.getString("estado"));
        pedido.setMotivoRechazo(rs.getString("motivo_rechazo"));
        pedido.setActivo(rs.getBoolean("activo"));

        long rolId = rs.getLong("rol_id");
        if (!rs.wasNull()) {
            Rol rol = new Rol();
            rol.setId(rolId);
            pedido.setRol(rol);
        }

        return pedido;
    }
}
