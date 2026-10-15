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

    public PedidoDao() {
    }

    @Override
    public void agregar(Pedido pedido) {
        agregarYObtenerId(pedido);
    }

    public Long agregarYObtenerId(Pedido pedido) {
        // NOTA: Ajusta los nombres de las columnas según la estructura real de PostgreSQL
        String sql = "INSERT INTO pedidos (fecha, total, metodopago, comercio, modalidadentrega, direccion, estado, motivorechazo, rol_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Long idGenerado = null;

        try (Connection conn = Conexion.getInstance().getConnection();
             PreparedStatement ps = (conn != null) ? conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS) : null) {

            if (conn == null) {
                System.err.println("Error: La conexión a la base de datos es nula.");
                return null;
            }

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
        String sql = "DELETE FROM pedidos WHERE id = ?";

        try (Connection conn = Conexion.getInstance().getConnection();
             PreparedStatement ps = (conn != null) ? conn.prepareStatement(sql) : null) {

            if (ps != null) {
                ps.setLong(1, id);
                ps.executeUpdate();
            }

        } catch (SQLException e) {
            System.err.println("Error al eliminar pedido: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Pedido pedido) {
        String sql = "UPDATE pedidos SET fecha = ?, total = ?, metodopago = ?, comercio = ?, modalidadentrega = ?, direccion = ?, estado = ?, motivorechazo = ? WHERE id = ?";

        try (Connection conn = Conexion.getInstance().getConnection();
             PreparedStatement ps = (conn != null) ? conn.prepareStatement(sql) : null) {

            if (ps != null) {
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
            }

        } catch (SQLException e) {
            System.err.println("Error al modificar pedido: " + e.getMessage());
        }
    }

    @Override
    public Pedido obtener(Long id) {
        String sql = "SELECT id, fecha, total, metodopago, comercio, modalidadentrega, direccion, estado, motivorechazo, rol_id FROM pedidos WHERE id = ?";

        try (Connection conn = Conexion.getInstance().getConnection();
             PreparedStatement ps = (conn != null) ? conn.prepareStatement(sql) : null) {

            if (ps == null) return null;

            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Pedido pedido = new Pedido();

                    // LECTURA CORRECTA DESDE EL RESULTSET
                    pedido.setId(rs.getLong("id"));
                    pedido.setFecha(rs.getDate("fecha"));
                    pedido.setTotal(rs.getDouble("total"));
                    pedido.setMetodoPago(rs.getString("metodopago"));
                    pedido.setComercio(rs.getString("comercio"));
                    pedido.setModalidadEntrega(rs.getString("modalidadentrega"));
                    pedido.setDireccion(rs.getString("direccion"));
                    pedido.setEstado(rs.getString("estado"));
                    pedido.setMotivoRechazo(rs.getString("motivorechazo"));

                    long rolId = rs.getLong("rol_id");
                    if (!rs.wasNull()) {
                        Rol rol = new Rol();
                        rol.setId(rolId);
                        pedido.setRol(rol);
                    }

                    return pedido;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener pedido por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Pedido> obtenerTodos() {
        List<Pedido> lista = new ArrayList<>();
        String sql = "SELECT id, fecha, total, metodopago, comercio, modalidadentrega, direccion, estado, motivorechazo, rol_id FROM pedidos ORDER BY id ASC";

        try (Connection conn = Conexion.getInstance().getConnection();
             PreparedStatement ps = (conn != null) ? conn.prepareStatement(sql) : null;
             ResultSet rs = (ps != null) ? ps.executeQuery() : null) {

            while (rs != null && rs.next()) {
                Pedido pedido = new Pedido();

                pedido.setId(rs.getLong("id"));
                pedido.setFecha(rs.getDate("fecha"));
                pedido.setTotal(rs.getDouble("total"));
                pedido.setMetodoPago(rs.getString("metodopago"));
                pedido.setComercio(rs.getString("comercio"));
                pedido.setModalidadEntrega(rs.getString("modalidadentrega"));
                pedido.setDireccion(rs.getString("direccion"));
                pedido.setEstado(rs.getString("estado"));
                pedido.setMotivoRechazo(rs.getString("motivorechazo"));

                long rolId = rs.getLong("rol_id");
                if (!rs.wasNull()) {
                    Rol rol = new Rol();
                    rol.setId(rolId);
                    pedido.setRol(rol);
                }

                lista.add(pedido);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los pedidos: " + e.getMessage());
        }

        return lista;
    }
}