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
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al insertar lote: no hay conexión disponible");
            return;
        }

        Long ordenCompraId = (lote.getOrdenCompra() != null) ? lote.getOrdenCompra().getId() : null;

        try {
            agregar(conn, lote, ordenCompraId);
        } catch (SQLException e) {
            System.err.println("Error al insertar lote: " + e.getMessage());
        }
    }

    /**
     * Inserta un lote sobre una conexión concreta. Propaga SQLException para que
     * quien abrió la transacción pueda hacer rollback.
     */
    public void agregar(Connection conn, Lote lote, Long ordenCompraId) throws SQLException {
        String sql = "INSERT INTO lotes (fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id) VALUES (?, ?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, lote.getFechaArribo());
            ps.setDate(2, lote.getFechaVencimiento());

            if (ordenCompraId != null) {
                ps.setLong(3, ordenCompraId);
            } else {
                ps.setNull(3, Types.BIGINT);
            }

            if (lote.getProducto() != null && lote.getProducto().getId() != null) {
                ps.setLong(4, lote.getProducto().getId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }

            ps.executeUpdate();
        }
    }

    @Override
    public void eliminar(Long id) {
        String sql = "DELETE FROM lotes WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar lote: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar lote: " + e.getMessage());
        }
    }

    @Override
    public void modificar(Lote lote) {
        String sql = "UPDATE lotes SET fecha_arribo = ?, fecha_vencimiento = ?, orden_compra_id = ?, producto_id = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar lote: no hay conexión disponible");
            return;
        }

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

            ps.setLong(5, lote.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar lote: " + e.getMessage());
        }
    }

    @Override
    public Lote obtener(Long id) {
        String sql = "SELECT id, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id FROM lotes WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener lote por ID: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearLote(rs);
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
        if (conn == null) {
            System.err.println("Error al listar lotes: no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearLote(rs));
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todos los lotes: " + e.getMessage());
        }

        return lista;
    }

    /**
     * Lotes asociados a una orden de compra, para el detalle del GET.
     */
    public List<Lote> listarPorOrdenCompra(Long ordenCompraId) {
        List<Lote> lista = new ArrayList<>();
        String sql = "SELECT l.id, l.fecha_arribo, l.fecha_vencimiento, l.orden_compra_id, l.producto_id, "
                + "p.nombre AS producto_nombre "
                + "FROM lotes l "
                + "LEFT JOIN productos p ON p.id = l.producto_id "
                + "WHERE l.orden_compra_id = ? ORDER BY l.id ASC";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al listar lotes de la orden: no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, ordenCompraId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapearLote(rs));
                }
            }

        } catch (SQLException e) {
            System.err.println("Error al listar los lotes de la orden " + ordenCompraId + ": " + e.getMessage());
        }

        return lista;
    }

    private Lote mapearLote(ResultSet rs) throws SQLException {
        Lote lote = new Lote();

        lote.setId(rs.getLong("id"));
        lote.setFechaArribo(rs.getDate("fecha_arribo"));
        lote.setFechaVencimiento(rs.getDate("fecha_vencimiento"));

        long ordenCompraId = rs.getLong("orden_compra_id");
        if (!rs.wasNull()) {
            OrdenCompra ordenCompra = new OrdenCompra();
            ordenCompra.setId(ordenCompraId);
            lote.setOrdenCompra(ordenCompra);
        }

        long productoId = rs.getLong("producto_id");
        if (!rs.wasNull()) {
            Producto producto = new Producto();
            producto.setId(productoId);
            
            // Si la consulta SQL incluyó producto_nombre, lo mapeamos
            try {
                String nombreProd = rs.getString("producto_nombre");
                if (nombreProd != null) {
                    producto.setNombre(nombreProd);
                }
            } catch (SQLException ignored) {
                // Si la columna no está presente en la query, se ignora de forma segura
            }
            
            lote.setProducto(producto);
        }

        return lote;
    }
}
