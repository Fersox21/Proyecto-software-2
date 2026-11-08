package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Rol;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class RolDao implements DAO<Rol> {

    private static final String SQL_SELECT = "SELECT id, rol, correo, password, activo FROM usuarios";

    public RolDao() {
    }

    @Override
    public void agregar(Rol rol) {
        String sql = "INSERT INTO usuarios (rol, correo, password, activo) VALUES (?, ?, ?, true)";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al insertar rol: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, rol.getRol());
            ps.setString(2, rol.getCorreo());
            ps.setString(3, rol.getPassword());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar rol: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "UPDATE usuarios SET activo = false WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar rol: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar rol: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Rol rol) {
        String sql = "UPDATE usuarios SET rol = ?, correo = ?, password = ? WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar rol: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, rol.getRol());
            ps.setString(2, rol.getCorreo());
            ps.setString(3, rol.getPassword());
            ps.setLong(4, rol.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar rol: " + e.getMessage());
        }
    }

    @Override
    public Rol obtener(Long id) {
        String sql = SQL_SELECT + " WHERE id = ? AND activo = true";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener rol por ID: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearRol(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener rol por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Rol> obtenerTodos() {
        String sql = SQL_SELECT + " WHERE activo = true ORDER BY rol ASC";
        return listar(sql, "Error al listar los roles activos: ");
    }

    @Override
    public List<Rol> obtenerTodosIncluyendoInactivos() {
        String sql = SQL_SELECT + " ORDER BY activo DESC, rol ASC";
        return listar(sql, "Error al listar todos los roles: ");
    }

    private List<Rol> listar(String sql, String mensajeError) {
        List<Rol> lista = new ArrayList<>();
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println(mensajeError + "no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearRol(rs));
            }

        } catch (SQLException e) {
            System.err.println(mensajeError + e.getMessage());
        }

        return lista;
    }

    private Rol mapearRol(ResultSet rs) throws SQLException {
        Rol rol = new Rol();

        rol.setId(rs.getLong("id"));
        rol.setRol(rs.getString("rol"));
        rol.setCorreo(rs.getString("correo"));
        rol.setPassword(rs.getString("password"));
        rol.setActivo(rs.getBoolean("activo"));

        return rol;
    }
}
