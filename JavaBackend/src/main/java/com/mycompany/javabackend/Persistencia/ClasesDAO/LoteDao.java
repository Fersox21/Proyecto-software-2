package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.Logica.Clases.OrdenCompra;
import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class LoteDao implements DAO<Lote> {

    public LoteDao() {
    }

    @Override
    public void agregar(Lote lote) {
        String sql = "INSERT INTO lotes (fecha_arribo, fecha_vencimiento, orden_compra, producto) VALUES (?, ?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, lote.getFechaArribo());
            ps.setDate(2, lote.getFechaVencimiento());

            if (lote.getOrdenCompra() != null && lote.getOrdenCompra().getId() != null) {
                ps.setLong(3, lote.getOrdenCompra().getId());
            } else {
                ps.setNull(3, Types.BIGINT);
            }

            if (lote.getProducto() != null && lote.getProducto().getId() != null) {
                ps.setLong(4, lote.getProducto().getId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al insertar lote: " + e.getMessage());
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM lotes WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar lote: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Lote lote) {
        String sql = "UPDATE lotes SET fecha_arribo = ?, fecha_vencimiento = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, lote.getFechaArribo());
            ps.setDate(2, lote.getFechaVencimiento());
            ps.setLong(3, lote.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar lote: " + e.getMessage());
        }

    }

    @Override
    public Lote obtener(Long id) {
        String sql = "SELECT id, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id FROM lotes WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Lote lote = new Lote();

                    lote.setId(rs.getLong("id"));
                    lote.setFechaArribo(rs.getDate("fecha_arribo"));
                    lote.setFechaVencimiento(rs.getDate("fecha_vencimiento"));

                    OrdenCompra ordenCompra = new OrdenCompra();
                    ordenCompra.setId(rs.getLong("orden_compra_id"));
                    lote.setOrdenCompra(ordenCompra);

                    Producto producto = new Producto();
                    producto.setId(rs.getLong("producto_id"));
                    lote.setProducto(producto);

                    return lote;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al obtener lote por ID: " + e.getMessage());
        }

        return null;
    }

    @Override
    public List<Lote> obtenerTodos() {
        List<Lote> lista = new ArrayList<>();
        String sql = "SELECT id, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id FROM lotes ORDER BY id ASC";
        Connection conn = Conexion.getInstance().getConnection();

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Lote lote = new Lote();

                lote.setId(rs.getLong("id"));
                lote.setFechaArribo(rs.getDate("fecha_arribo"));
                lote.setFechaVencimiento(rs.getDate("fecha_vencimiento"));

                OrdenCompra ordenCompra = new OrdenCompra();
                ordenCompra.setId(rs.getLong("orden_compra_id"));
                lote.setOrdenCompra(ordenCompra);

                Producto producto = new Producto();
                producto.setId(rs.getLong("producto_id"));
                lote.setProducto(producto);

                lista.add(lote);
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los lotes: " + e.getMessage());
        }

        return lista;
    }

}