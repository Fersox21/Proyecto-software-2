package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.sql.Types;
import com.mycompany.javabackend.Persistencia.DAO;
import com.mycompany.javabackend.Persistencia.Conexion;
import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.Logica.Clases.Producto;

public class ProductoDao implements DAO<Producto> {

    public ProductoDao() {
    }

    @Override
    public void agregar(Producto producto) {
        String sql = "INSERT INTO productos (nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso, lote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, producto.getNombre());
            ps.setDouble(2, producto.getPrecioCosto());
            ps.setDouble(3, producto.getPrecioVenta());
            ps.setString(4, producto.getMarca());
            ps.setBoolean(5, producto.isEnPromocion());
            ps.setInt(6, producto.getStock());
            ps.setString(7, producto.getCategoria());
            ps.setDouble(8, producto.getPeso());

            if (producto.getLote() != null && producto.getLote().getId() != null) {
                ps.setLong(4, producto.getLote().getId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar producto: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM productos WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar producto: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Producto producto) {
        String sql = "UPDATE productos SET nombre = ?, precioCosto = ?, precioVenta = ?, marca = ?, stock = ?, categoria = ?, peso = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, producto.getNombre());
            ps.setDouble(2, producto.getPrecioCosto());
            ps.setDouble(3, producto.getPrecioVenta());
            ps.setString(4, producto.getMarca());
            ps.setBoolean(5, producto.isEnPromocion());
            ps.setInt(6, producto.getStock());
            ps.setString(7, producto.getCategoria());
            ps.setDouble(8, producto.getPeso());
            ps.setLong(9, producto.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar producto: " + e.getMessage());
        }

    }

    @Override
    public Producto obtener(Long id) {
        String sql = "SELECT id, nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso, lote_id FROM productos WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Producto producto = new Producto();

                    producto.setId(rs.getLong("id"));
                    producto.setNombre(rs.getString("nombre"));
                    producto.setPrecioCosto(rs.getDouble("precioCosto"));
                    producto.setPrecioVenta(rs.getDouble("precioVenta"));
                    producto.setMarca(rs.getString("marca"));
                    producto.setEnPromocion(rs.getBoolean("enPromocion"));
                    producto.setStock(rs.getInt("stock"));
                    producto.setCategoria(rs.getString("categoria"));
                    producto.setPeso(rs.getDouble("peso"));

                    Lote lote = new Lote();
                    lote.setId(rs.getLong("lote_id"));
                    producto.setLote(lote);

                    return producto;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener producto por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Producto> obtenerTodos() {
        List<Producto> lista = new ArrayList<>();
        String sql = "SELECT id, nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso, lote_id FROM productos ORDER BY id ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Producto producto = new Producto();

                producto.setId(rs.getLong("id"));
                producto.setNombre(rs.getString("nombre"));
                producto.setPrecioCosto(rs.getDouble("precioCosto"));
                producto.setPrecioVenta(rs.getDouble("precioVenta"));
                producto.setMarca(rs.getString("marca"));
                producto.setEnPromocion(rs.getBoolean("enPromocion"));
                producto.setStock(rs.getInt("stock"));
                producto.setCategoria(rs.getString("categoria"));
                producto.setPeso(rs.getDouble("peso"));

                Lote lote = new Lote();
                lote.setId(rs.getLong("lote_id"));
                producto.setLote(lote);

                lista.add(producto);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los productos: " + e.getMessage());
        }

        return lista;
    }

}