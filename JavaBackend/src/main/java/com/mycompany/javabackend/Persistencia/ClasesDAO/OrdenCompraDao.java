package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.OrdenCompra;
import com.mycompany.javabackend.Logica.Clases.Proveedor;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class OrdenCompraDao implements DAO<OrdenCompra> {

    public OrdenCompraDao() {
    }

    @Override
    public void agregar(OrdenCompra ordenCompra) {
        String sql = "INSERT INTO ordenes_compra (cantidad, total, fecha, proveedor) VALUES (?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, ordenCompra.getCantidad());
            ps.setDouble(2, ordenCompra.getTotal());
            ps.setDate(3, ordenCompra.getFecha());

            if (ordenCompra.getProveedor() != null && ordenCompra.getProveedor().getId() != null) {
                ps.setLong(4, ordenCompra.getProveedor().getId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }

            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar ordenCompra: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM ordenes_compra WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar ordenCompra: " + e.getMessage());
        }
    }

    @Override
    public void modificar(OrdenCompra ordenCompra) {
        String sql = "UPDATE ordenes_compra SET cantidad = ?, total = ?, fecha = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, ordenCompra.getCantidad());
            ps.setDouble(2, ordenCompra.getTotal());
            ps.setDate(3, ordenCompra.getFecha());

            ps.setLong(4, ordenCompra.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar ordenCompra: " + e.getMessage());
        }

    }

    @Override
    public OrdenCompra obtener(Long id) {
        String sql = "SELECT id, cantidad, total, fecha, proveedor_id FROM ordenes_compra WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    OrdenCompra ordenCompra = new OrdenCompra();

                    ordenCompra.setId(rs.getLong("id"));
                    ordenCompra.setCantidad(rs.getInt("cantidad"));
                    ordenCompra.setTotal(rs.getDouble("total"));
                    ordenCompra.setFecha(rs.getDate("fecha"));

                    Proveedor proveedor = new Proveedor();
                    proveedor.setId(rs.getLong("proveedor_id"));
                    ordenCompra.setProveedor(proveedor);

                    return ordenCompra;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener ordenCompra por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<OrdenCompra> obtenerTodos() {
        List<OrdenCompra> lista = new ArrayList<>();
        String sql = "SELECT id, cantidad, total, fecha, proveedor_id FROM ordenes_compra ORDER BY id ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                OrdenCompra ordenCompra = new OrdenCompra();

                ordenCompra.setId(rs.getLong("id"));
                ordenCompra.setCantidad(rs.getInt("cantidad"));
                ordenCompra.setTotal(rs.getDouble("total"));
                ordenCompra.setFecha(rs.getDate("fecha"));

                Proveedor proveedor = new Proveedor();
                proveedor.setId(rs.getLong("proveedor_id"));
                ordenCompra.setProveedor(proveedor);

                lista.add(ordenCompra);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los ordenCompra: " + e.getMessage());
        }

        return lista;
    }

}