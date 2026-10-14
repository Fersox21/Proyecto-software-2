package Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.sql.Types;
import Persistencia.DAO;
import Logica.Clases.Rol;
import Persistencia.Conexion;

public class RolDao implements DAO<Rol> {

    public RolDao() {
    }

    @Override
    public void agregar(Rol rol) {
        String sql = "INSERT INTO roles (correo, password) VALUES (?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, rol.getCorreo());
            ps.setString(2, rol.getPassword());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar rol: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM roles WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar rol: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Rol rol) {
        String sql = "UPDATE roles SET correo = ?, password = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, rol.getCorreo());
            ps.setString(2, rol.getPassword());
            ps.setLong(3, rol.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar rol: " + e.getMessage());
        }

    }

    @Override
    public Rol obtener(Long id) {
        String sql = "SELECT id, correo, password FROM roles WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Rol rol = new Rol();

                    rol.setId(rs.getLong("id"));
                    rol.setCorreo(rs.getString("correo"));
                    rol.setPassword(rs.getString("password"));

                    return rol;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener rol por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Rol> obtenerTodos() {
        List<Rol> lista = new ArrayList<>();
        String sql = "SELECT id, correo, password FROM roles ORDER BY id ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Rol rol = new Rol();

                rol.setId(rs.getLong("id"));
                rol.setCorreo(rs.getString("correo"));
                rol.setPassword(rs.getString("password"));

                lista.add(rol);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los roles: " + e.getMessage());
        }

        return lista;
    }

}