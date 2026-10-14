package Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.sql.Types;
import Persistencia.DAO;
import Logica.Clases.Producto;
import Logica.Clases.Rol;
import Logica.Clases.Tiene;
import Logica.Clases.Venta;
import Persistencia.Conexion;

public class TieneDao implements DAO<Tiene> {

    public TieneDao() {
    }

    @Override
    public void agregar(Tiene tiene) {
        String sql = "INSERT INTO tiene (cantidad, precio, producto, venta) VALUES (?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, tiene.getCantidad());
            ps.setDouble(2, tiene.getPrecio());

            if (tiene.getProducto() != null && tiene.getProducto().getId() != null) {
                ps.setLong(3, tiene.getProducto().getId());
            } else {
                ps.setNull(3, Types.BIGINT);
            }

            if (tiene.getVenta() != null && tiene.getVenta().getId() != null) {
                ps.setLong(4, tiene.getVenta().getId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar tiene: " + e.getMessage());
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
        String sql = "SELECT id, cantidad, precio, producto_id, venta_id FROM tiene WHERE id = ?";
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

                    Venta venta = new Venta();
                    venta.setId(rs.getLong("venta_id"));
                    tiene.setVenta(venta);

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
        String sql = "SELECT id, cantidad, precio, producto_id, venta_id FROM tiene ORDER BY id ASC";
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

                Venta venta = new Venta();
                venta.setId(rs.getLong("venta_id"));
                tiene.setVenta(venta);

                lista.add(tiene);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los tiene: " + e.getMessage());
        }

        return lista;
    }

}