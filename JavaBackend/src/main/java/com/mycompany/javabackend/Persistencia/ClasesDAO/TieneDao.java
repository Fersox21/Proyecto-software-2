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

public class TieneDao implements DAO<Tiene> {

    public TieneDao() {
    }

    @Override
    public void agregar(Tiene tiene) {
        // Inserción en la tabla de asociación con la clave compuesta
        String sql = "INSERT INTO tienen (producto_id, pedido_id, cantidad, precio) VALUES (?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, tiene.getProducto().getId());
            ps.setLong(2, tiene.getPedido().getId());
            ps.setInt(3, tiene.getCantidad());
            ps.setDouble(4, tiene.getPrecio());

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar detalle del pedido (tienen): " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM tiene WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar tiene: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Tiene tiene) {
        String sql = "UPDATE tiene SET cantidad = ?, precio = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, tiene.getCantidad());
            ps.setDouble(2, tiene.getPrecio());
            ps.setLong(3, tiene.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar tiene: " + e.getMessage());
        }

    }

    @Override
    public Tiene obtener(Long id) {
        String sql = "SELECT id, cantidad, precio, producto_id, Pedido_id FROM tiene WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Tiene tiene = new Tiene();

                    tiene.setId(rs.getLong("id"));
                    tiene.setCantidad(rs.getInt("cantidad"));
                    tiene.setPrecio(rs.getDouble("precio"));

                    Producto producto = new Producto();
                    producto.setId(rs.getLong("producto_id"));
                    tiene.setProducto(producto);

                    Pedido pedido = new Pedido();
                    pedido.setId(rs.getLong("pedido_id"));
                    tiene.setPedido(pedido);

                    return tiene;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener tiene por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Tiene> obtenerTodos() {
        List<Tiene> lista = new ArrayList<>();
        String sql = "SELECT id, cantidad, precio, producto_id, pedido_id FROM tiene ORDER BY id ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Tiene tiene = new Tiene();

                tiene.setId(rs.getLong("id"));
                tiene.setCantidad(rs.getInt("cantidad"));
                tiene.setPrecio(rs.getDouble("precio"));

                Producto producto = new Producto();
                producto.setId(rs.getLong("producto_id"));
                tiene.setProducto(producto);

                Pedido pedido = new Pedido();
                pedido.setId(rs.getLong("pedido_id"));
                tiene.setPedido(pedido);

                lista.add(tiene);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los tiene: " + e.getMessage());
        }

        return lista;
    }

}