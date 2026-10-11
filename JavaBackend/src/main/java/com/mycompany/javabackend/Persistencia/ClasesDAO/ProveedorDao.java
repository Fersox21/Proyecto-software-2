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
import com.mycompany.javabackend.Logica.Clases.Proveedor;

public class ProveedorDao implements DAO<Proveedor> {

    public ProveedorDao() {
    }

    @Override
    public void agregar(Proveedor proveedor) {
        String sql = "INSERT INTO proveedores (nombre, telefono) VALUES (?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, proveedor.getNombre());
            ps.setInt(2, proveedor.getTelefono());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar proveedor: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM proveedores WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar proveedor: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Proveedor proveedor) {
        String sql = "UPDATE proveedors SET nombre = ?, telefono = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, proveedor.getNombre());
            ps.setInt(2, proveedor.getTelefono());
            ps.setLong(3, proveedor.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar proveedor: " + e.getMessage());
        }

    }

    @Override
    public Proveedor obtener(Long id) {
        String sql = "SELECT id, nombre, telefono FROM proveedors WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Proveedor proveedor = new Proveedor();

                    proveedor.setId(rs.getLong("id"));
                    proveedor.setNombre(rs.getString("nombre"));
                    proveedor.setTelefono(rs.getInt("telefono"));

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
        String sql = "SELECT id, nombre, telefono FROM proveedors ORDER BY id ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Proveedor proveedor = new Proveedor();

                proveedor.setId(rs.getLong("id"));
                proveedor.setNombre(rs.getString("nombre"));
                proveedor.setTelefono(rs.getInt("telefono"));

                lista.add(proveedor);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los proveedors: " + e.getMessage());
        }

        return lista;
    }

}