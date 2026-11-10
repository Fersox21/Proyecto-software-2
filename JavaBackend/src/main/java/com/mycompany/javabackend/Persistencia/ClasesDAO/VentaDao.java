package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Tiene;
import com.mycompany.javabackend.Logica.Clases.Venta;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class VentaDao implements DAO<Venta> {

    public VentaDao() {
    }

    @Override
    public void agregar(Venta venta) {
        String sql = "INSERT INTO ventas (fecha, total, pedido_id) VALUES (?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, venta.getFecha());
            ps.setDouble(2, venta.getTotal());

            if (venta.getPedido() != null && venta.getPedido().getId() != null) {
                ps.setLong(3, venta.getPedido().getId());
            } else {
                ps.setNull(3, Types.BIGINT);
            }

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar venta: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "UPDATE ventas SET activo = false WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        Venta venta = obtener(id);
        List<Tiene> itemsVenta = new TieneDao().obtenerPorVenta(venta.getPedido().getId());
       

        for (Tiene item : itemsVenta) {
            new TieneDao().eliminar(item.getId());
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar venta: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Venta venta) {
        String sql = "UPDATE ventas SET fecha = ?, total = ?, activo = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, venta.getFecha());
            ps.setDouble(2, venta.getTotal());
            ps.setBoolean(3, venta.isActivo());
            ps.setLong(4, venta.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar venta: " + e.getMessage());
        }

    }

    @Override
    public Venta obtener(Long id) {
        String sql = "SELECT id, fecha, total, activo, pedido_id FROM ventas WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Venta venta = new Venta();

                    venta.setId(rs.getLong("id"));
                    venta.setFecha(rs.getDate("fecha"));
                    venta.setTotal(rs.getDouble("total"));
                    venta.setActivo(rs.getBoolean("activo"));
                    Pedido pedido = new Pedido();
                    pedido.setId(rs.getLong("pedido_id"));
                    venta.setPedido(pedido);

                    return venta;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener venta por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Venta> obtenerTodos() {
        List<Venta> lista = new ArrayList<>();
        String sql = "SELECT id, fecha, total, activo, pedido_id FROM ventas WHERE activo = true ORDER BY fecha ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Venta venta = new Venta();

                venta.setId(rs.getLong("id"));
                venta.setFecha(rs.getDate("fecha"));
                venta.setTotal(rs.getDouble("total"));
                venta.setActivo(rs.getBoolean("activo"));
                Pedido pedido = new Pedido();
                pedido.setId(rs.getLong("pedido_id"));
                venta.setPedido(pedido);

                lista.add(venta);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los venta: " + e.getMessage());
        }

        return lista;
    }

}