package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Proveedor;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class ProveedorDao implements DAO<Proveedor> {

    private static final String SQL_SELECT = "SELECT id, nombre, telefono, activo FROM proveedores";

    public ProveedorDao() {
    }

    @Override
    public void agregar(Proveedor proveedor) {
        String sql = "INSERT INTO proveedores (nombre, telefono, activo) VALUES (?, ?, true)";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al insertar proveedor: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, proveedor.getNombre());
            ps.setString(2, proveedor.getTelefono());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar proveedor: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "UPDATE proveedores SET activo = false WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar proveedor: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar proveedor: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Proveedor proveedor) {
        String sql = "UPDATE proveedores SET nombre = ?, telefono = ? WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar proveedor: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, proveedor.getNombre());
            ps.setString(2, proveedor.getTelefono());
            ps.setLong(3, proveedor.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar proveedor: " + e.getMessage());
        }
    }

    @Override
    public Proveedor obtener(Long id) {
        String sql = SQL_SELECT + " WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener proveedor por ID: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearProveedor(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener proveedor por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Proveedor> obtenerTodos() {
        String sql = SQL_SELECT + " WHERE activo = true ORDER BY nombre ASC";
        return listar(sql, "Error al listar los proveedores activos: ");
    }

    @Override
    public List<Proveedor> obtenerTodosIncluyendoInactivos() {
        String sql = SQL_SELECT + " ORDER BY activo DESC, nombre ASC";
        return listar(sql, "Error al listar todos los proveedores: ");
    }

    private List<Proveedor> listar(String sql, String mensajeError) {
        List<Proveedor> lista = new ArrayList<>();
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println(mensajeError + "no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearProveedor(rs));
            }

        } catch (SQLException e) {
            System.err.println(mensajeError + e.getMessage());
        }

        return lista;
    }

    private Proveedor mapearProveedor(ResultSet rs) throws SQLException {
        Proveedor proveedor = new Proveedor();

        proveedor.setId(rs.getLong("id"));
        proveedor.setNombre(rs.getString("nombre"));
        proveedor.setTelefono(rs.getString("telefono"));
        proveedor.setActivo(rs.getBoolean("activo"));

        return proveedor;
    }
}
