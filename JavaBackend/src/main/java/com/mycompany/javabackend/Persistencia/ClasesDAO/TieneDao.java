package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Logica.Clases.Tiene;
import com.mycompany.javabackend.Persistencia.connection.Conexion;


public class TieneDao {

    public TieneDao() {
    }

    public void agregar(Tiene tiene) {
        String sql = "INSERT INTO tiene (producto_id, pedido_id, cantidad, precio, activo) "
                + "VALUES (?, ?, ?, ?, true)";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al insertar detalle del pedido (tiene): no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, tiene.getProducto().getId());
            ps.setLong(2, tiene.getPedido().getId());
            ps.setInt(3, tiene.getCantidad());
            ps.setDouble(4, tiene.getPrecio());

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar detalle del pedido (tiene): " + e.getMessage());
        }
    }

    public void modificar(Tiene tiene) {
        String sql = "UPDATE tiene SET cantidad = ?, precio = ? "
                + "WHERE pedido_id = ? AND producto_id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar tiene: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, tiene.getCantidad());
            ps.setDouble(2, tiene.getPrecio());
            ps.setLong(3, tiene.getPedido().getId());
            ps.setLong(4, tiene.getProducto().getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar tiene: " + e.getMessage());
        }
    }

   
    public Tiene obtener(Long pedidoId, Long productoId) {
        String sql = "SELECT cantidad, precio, producto_id, pedido_id, activo "
                + "FROM tiene WHERE pedido_id = ? AND producto_id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener tiene: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, pedidoId);
            ps.setLong(2, productoId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearTiene(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener tiene: " + e.getMessage());
        }

        return null;
    }

   
    public void eliminar(Long pedidoId, Long productoId) {
        String sql = "UPDATE tiene SET activo = false WHERE pedido_id = ? AND producto_id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar tiene: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, pedidoId);
            ps.setLong(2, productoId);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar tiene: " + e.getMessage());
        }
    }

    
    public void eliminarPorPedido(Long pedidoId) {
        String sql = "UPDATE tiene SET activo = false WHERE pedido_id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar los ítems del pedido: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, pedidoId);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar los ítems del pedido: " + e.getMessage());
        }
    }

    public List<Tiene> obtenerTodos() {
        String sql = "SELECT cantidad, precio, producto_id, pedido_id, activo "
                + "FROM tiene WHERE activo = true ORDER BY pedido_id ASC, producto_id ASC";
        return listar(sql, "Error al listar los ítems activos: ");
    }

    public List<Tiene> obtenerTodosIncluyendoInactivos() {
        String sql = "SELECT cantidad, precio, producto_id, pedido_id, activo "
                + "FROM tiene ORDER BY activo DESC, pedido_id ASC, producto_id ASC";
        return listar(sql, "Error al listar todos los ítems: ");
    }

   
    public List<Tiene> listarPorPedido(Long pedidoId) {
        String sql = "SELECT cantidad, precio, producto_id, pedido_id, activo "
                + "FROM tiene WHERE pedido_id = ? AND activo = true ORDER BY producto_id ASC";
        return listarPorPedido(pedidoId, sql, "Error al listar los ítems activos del pedido ");
    }

   
    public List<Tiene> listarPorPedidoIncluyendoInactivos(Long pedidoId) {
        String sql = "SELECT cantidad, precio, producto_id, pedido_id, activo "
                + "FROM tiene WHERE pedido_id = ? ORDER BY activo DESC, producto_id ASC";
        return listarPorPedido(pedidoId, sql, "Error al listar todos los ítems del pedido ");
    }

    private List<Tiene> listar(String sql, String mensajeError) {
        List<Tiene> lista = new ArrayList<>();
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println(mensajeError + "no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearTiene(rs));
            }

        } catch (SQLException e) {
            System.err.println(mensajeError + e.getMessage());
        }

        return lista;
    }

    private List<Tiene> listarPorPedido(Long pedidoId, String sql, String mensajeError) {
        List<Tiene> lista = new ArrayList<>();
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println(mensajeError + ": no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, pedidoId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapearTiene(rs));
                }
            }

        } catch (SQLException e) {
            System.err.println(mensajeError + pedidoId + ": " + e.getMessage());
        }

        return lista;
    }

    private Tiene mapearTiene(ResultSet rs) throws SQLException {
        Tiene tiene = new Tiene();

        tiene.setCantidad(rs.getInt("cantidad"));
        tiene.setPrecio(rs.getDouble("precio"));
        tiene.setActivo(rs.getBoolean("activo"));

        Producto producto = new Producto();
        producto.setId(rs.getLong("producto_id"));
        tiene.setProducto(producto);

        Pedido pedido = new Pedido();
        pedido.setId(rs.getLong("pedido_id"));
        tiene.setPedido(pedido);

        return tiene;
    }
}
