package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class ProductoDao implements DAO<Producto> {

    public ProductoDao() {
    }

    @Override
    public void agregar(Producto producto) {
        String sql = "INSERT INTO productos (nombre, precio_costo, precio_venta, marca, en_promocion, precio_promo, stock, categoria, peso, destacado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, producto.getNombre());
            ps.setDouble(2, producto.getPrecioCosto());
            ps.setDouble(3, producto.getPrecioVenta());
            ps.setString(4, producto.getMarca());
            ps.setBoolean(5, producto.isEnPromocion());
            ps.setDouble(6, producto.getPrecioPromo());
            ps.setInt(7, producto.getStock());
            ps.setString(8, producto.getCategoria());
            ps.setString(9, producto.getPeso());
            ps.setBoolean(10, producto.isDestacado());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar producto: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "UPDATE productos SET activo = false WHERE id = ?";
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
        String sql = "UPDATE productos SET nombre = ?, precio_costo = ?, precio_venta = ?, marca = ?, en_promocion = ?, precio_promo = ?, stock = ?, categoria = ?, peso = ?, destacado = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, producto.getNombre());
            ps.setDouble(2, producto.getPrecioCosto());
            ps.setDouble(3, producto.getPrecioVenta());
            ps.setString(4, producto.getMarca());
            ps.setBoolean(5, producto.isEnPromocion());
            ps.setDouble(6, producto.getPrecioPromo());
            ps.setInt(7, producto.getStock());
            ps.setString(8, producto.getCategoria());
            ps.setString(9, producto.getPeso());
            ps.setBoolean(10, producto.isDestacado());
            ps.setLong(11, producto.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar producto: " + e.getMessage());
        }

    }

    @Override
    public Producto obtener(Long id) {
        String sql = "SELECT id, nombre, precio_costo, precio_venta, marca, en_promocion, precio_promo, stock, categoria, peso, destacado, activo FROM productos WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Producto producto = new Producto();

                    producto.setId(rs.getLong("id"));
                    producto.setNombre(rs.getString("nombre"));
                    producto.setPrecioCosto(rs.getDouble("precio_costo"));
                    producto.setPrecioVenta(rs.getDouble("precio_venta"));
                    producto.setMarca(rs.getString("marca"));
                    producto.setEnPromocion(rs.getBoolean("en_promocion"));
                    producto.setPrecioPromo(rs.getDouble("precio_promo"));
                    producto.setStock(rs.getInt("stock"));
                    producto.setCategoria(rs.getString("categoria"));
                    producto.setPeso(rs.getString("peso"));
                    producto.setDestacado(rs.getBoolean("destacado"));
                    producto.setActivo(rs.getBoolean("activo"));
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
        String sql = "SELECT id, nombre, precio_costo, precio_venta, marca, en_promocion, precio_promo, stock, categoria, peso, destacado, activo FROM productos ORDER BY activo DESC, nombre ASC";
        try (Connection conn = Conexion.getInstance().getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Producto producto = new Producto();
                producto.setId(rs.getLong("id"));
                producto.setNombre(rs.getString("nombre"));
                producto.setPrecioCosto(rs.getDouble("precio_costo"));
                producto.setPrecioVenta(rs.getDouble("precio_venta"));
                producto.setMarca(rs.getString("marca"));
                producto.setEnPromocion(rs.getBoolean("en_promocion"));
                producto.setPrecioPromo(rs.getDouble("precio_promo"));
                producto.setStock(rs.getInt("stock"));
                producto.setCategoria(rs.getString("categoria"));
                producto.setPeso(rs.getString("peso"));
                producto.setDestacado(rs.getBoolean("destacado"));
                producto.setActivo(rs.getBoolean("activo"));
                lista.add(producto);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los productos: " + e.getMessage());
        }

        return lista;
    }
}