package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Rol;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class PedidoDao implements DAO<Pedido> {

    public PedidoDao() {
    }

    @Override
    public void agregar(Pedido pedido) {
        String sql = "INSERT INTO pedidos (fecha, total, metodo_pago, comercio, modalidad_entrega, direccion, estado, motivo_rechazo, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, pedido.getFecha());
            ps.setDouble(2, pedido.getTotal());
            ps.setString(3, pedido.getMetodoPago());
            ps.setString(4, pedido.getComercio());
            ps.setString(5, pedido.getModalidadEntrega());
            ps.setString(6, pedido.getDireccion());
            ps.setString(7, pedido.getEstado());
            ps.setString(8, pedido.getMotivoRechazo());

            if (pedido.getRol() != null && pedido.getRol().getId() != null) {
                ps.setLong(9, pedido.getRol().getId());
            } else {
                ps.setNull(9, Types.BIGINT);
            }

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar pedido: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM pedidos WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar pedido: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Pedido pedido) {
        String sql = "UPDATE pedidos SET fecha = ?, total = ?, metodo_pago = ?, comercio = ?, modalidad_entrega = ?, direccion = ?, estado = ?, motivo_rechazo = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, pedido.getFecha());
            ps.setDouble(2, pedido.getTotal());
            ps.setString(3, pedido.getMetodoPago());
            ps.setString(4, pedido.getComercio());
            ps.setString(5, pedido.getModalidadEntrega());
            ps.setString(6, pedido.getDireccion());
            ps.setString(7, pedido.getEstado());
            ps.setString(8, pedido.getMotivoRechazo());
            ps.setLong(9, pedido.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar pedido: " + e.getMessage());
        }

    }

    @Override
    public Pedido obtener(Long id) {
        String sql = "SELECT id, fecha, total, metodo_pago, comercio, modalidad_entrega, direccion, estado, motivo_rechazo, rol_id FROM pedidos WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Pedido pedido = new Pedido();

                    ps.setLong(1, pedido.getId());
                    ps.setDate(2, pedido.getFecha());
                    ps.setDouble(3, pedido.getTotal());
                    ps.setString(4, pedido.getMetodoPago());
                    ps.setString(5, pedido.getComercio());
                    ps.setString(6, pedido.getModalidadEntrega());
                    ps.setString(7, pedido.getDireccion());
                    ps.setString(8, pedido.getEstado());
                    ps.setString(9, pedido.getMotivoRechazo());

                    Rol rol = new Rol();
                    rol.setId(rs.getLong("rol_id"));
                    pedido.setRol(rol);

                    return pedido;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener pedido por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Pedido> obtenerTodos() {
        List<Pedido> lista = new ArrayList<>();
        String sql = "SELECT id, fecha, total, metodo_pago, comercio, modalidad_entrega, direccion, estado, motivo_rechazo, rol_id FROM pedidos ORDER BY id ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Pedido pedido = new Pedido();

                pedido.setId(rs.getLong("id"));
                pedido.setFecha(rs.getDate("fecha"));
                pedido.setTotal(rs.getDouble("total"));
                pedido.setMetodoPago(rs.getString("metodo_pago"));
                pedido.setComercio(rs.getString("comercio"));
                pedido.setModalidadEntrega(rs.getString("modalidad_entrega"));
                pedido.setDireccion(rs.getString("direccion"));
                pedido.setEstado(rs.getString("estado"));
                pedido.setMotivoRechazo(rs.getString("motivo_rechazo"));

                Rol rol = new Rol();
                rol.setId(rs.getLong("rol_id"));
                pedido.setRol(rol);

                lista.add(pedido);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los pedidos: " + e.getMessage());
        }

        return lista;
    }

}