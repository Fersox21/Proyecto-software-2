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

    public ProveedorDao() {
    }

    @Override
    public void agregar(Proveedor proveedor) {
        String sql = "INSERT INTO proveedores (nombre, telefono) VALUES (?, ?)";
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
        String sql = "UPDATE proveedores SET nombre = ?, telefono = ? WHERE id = ?";
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
        String sql = "SELECT id, nombre, telefono, activo FROM proveedores WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener proveedor por ID: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Proveedor proveedor = new Proveedor();

                    proveedor.setId(rs.getLong("id"));
                    proveedor.setNombre(rs.getString("nombre"));
                    proveedor.setTelefono(rs.getString("telefono"));
                    proveedor.setActivo(rs.getBoolean("activo"));
                    return proveedor;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener proveedor por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Proveedor> obtenerTodos() {
        List<Proveedor> lista = new ArrayList<>();
        String sql = "SELECT id, nombre, telefono, activo FROM proveedores ORDER BY activo DESC, nombre ASC";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al listar proveedores: no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Proveedor proveedor = new Proveedor();

                proveedor.setId(rs.getLong("id"));
                proveedor.setNombre(rs.getString("nombre"));
                proveedor.setTelefono(rs.getString("telefono"));
                proveedor.setActivo(rs.getBoolean("activo"));

                lista.add(proveedor);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los proveedores: " + e.getMessage());
        }

        return lista;
    }
}
