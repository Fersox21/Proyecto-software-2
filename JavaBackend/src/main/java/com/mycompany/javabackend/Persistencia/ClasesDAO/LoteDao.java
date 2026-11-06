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
import com.mycompany.javabackend.Logica.Clases.Proveedor;
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
        String sql = "INSERT INTO lotes (cantidad, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id) VALUES (?, ?, ?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            if (lote.getCantidad() != null) {
                ps.setInt(1, lote.getCantidad());
            } else {
                ps.setNull(1, Types.INTEGER);
            }

            ps.setDate(2, lote.getFechaArribo());
            ps.setDate(3, lote.getFechaVencimiento());

            if (ordenCompraId != null) {
                ps.setLong(4, ordenCompraId);
            } else {
                ps.setNull(4, Types.BIGINT);
            }

            if (lote.getProducto() != null && lote.getProducto().getId() != null) {
                ps.setLong(5, lote.getProducto().getId());
            } else {
                ps.setNull(5, Types.BIGINT);
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
        String sql = "UPDATE lotes SET cantidad = ?, fecha_arribo = ?, fecha_vencimiento = ?, orden_compra_id = ?, producto_id = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar lote: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            if (lote.getCantidad() != null) {
                ps.setInt(1, lote.getCantidad());
            } else {
                ps.setNull(1, Types.INTEGER);
            }

            ps.setDate(2, lote.getFechaArribo());
            ps.setDate(3, lote.getFechaVencimiento());

            if (lote.getOrdenCompra() != null && lote.getOrdenCompra().getId() != null) {
                ps.setLong(4, lote.getOrdenCompra().getId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }

            if (lote.getProducto() != null && lote.getProducto().getId() != null) {
                ps.setLong(5, lote.getProducto().getId());
            } else {
                ps.setNull(5, Types.BIGINT);
            }

            ps.setLong(6, lote.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar lote: " + e.getMessage());
        }
    }

    @Override
    public Lote obtener(Long id) {
        String sql = "SELECT id, cantidad, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id FROM lotes WHERE id = ?";
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
        String sql = "SELECT id, cantidad, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id FROM lotes ORDER BY id ASC";
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
        String sql = "SELECT l.id, l.cantidad, l.fecha_arribo, l.fecha_vencimiento, l.orden_compra_id, l.producto_id, "
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

    /**
     * Lotes con producto, orden de compra y proveedor resueltos, ordenados por
     * fecha de vencimiento. Es la consulta que alimenta la vista de
     * Vencimientos, evitando que el frontend tenga que pedir cada orden.
     */
    public List<Lote> listarTodosConDetalle() {
        List<Lote> lista = new ArrayList<>();
        String sql = SQL_DETALLE + " ORDER BY l.fecha_vencimiento ASC, l.id ASC";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al listar lotes con detalle: no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearLoteConDetalle(rs));
            }

        } catch (SQLException e) {
            System.err.println("Error al listar lotes con detalle: " + e.getMessage());
        }

        return lista;
    }

    /**
     * Un lote con su producto, orden de compra y proveedor, o null si no existe.
     */
    public Lote obtenerConDetalle(Long id) {
        String sql = SQL_DETALLE + " WHERE l.id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener lote con detalle: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearLoteConDetalle(rs);
                }
            }

        } catch (SQLException e) {
            System.err.println("Error al obtener lote con detalle: " + e.getMessage());
        }

        return null;
    }

    /**
     * Actualiza únicamente la fecha de vencimiento, sin reemplazar el lote ni
     * tocar sus demás columnas.
     *
     * @return true si se modificó una fila, false si el lote no existe.
     */
    public boolean actualizarFechaVencimiento(Long id, java.sql.Date fechaVencimiento) {
        String sql = "UPDATE lotes SET fecha_vencimiento = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            throw new RuntimeException("No hay conexión disponible con la base de datos");
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, fechaVencimiento);
            ps.setLong(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar el vencimiento del lote: " + e.getMessage(), e);
        }
    }

    private static final String SQL_DETALLE = "SELECT l.id, l.cantidad, l.fecha_arribo, l.fecha_vencimiento, "
            + "p.id AS producto_id, p.nombre AS producto_nombre, p.marca AS producto_marca, "
            + "p.categoria AS producto_categoria, p.peso AS producto_peso, p.stock AS producto_stock, "
            + "p.precio_costo AS producto_precio_costo, p.precio_venta AS producto_precio_venta, "
            + "p.en_promocion AS producto_en_promocion, p.precio_promo AS producto_precio_promo, "
            + "p.destacado AS producto_destacado, "
            + "oc.id AS orden_id, oc.cantidad AS orden_cantidad, oc.total AS orden_total, oc.fecha AS orden_fecha, "
            + "pr.id AS proveedor_id, pr.nombre AS proveedor_nombre, pr.telefono AS proveedor_telefono "
            + "FROM lotes l "
            + "JOIN productos p ON p.id = l.producto_id "
            + "JOIN ordenes_compra oc ON oc.id = l.orden_compra_id "
            + "LEFT JOIN proveedores pr ON pr.id = oc.proveedor_id";

    private Lote mapearLoteConDetalle(ResultSet rs) throws SQLException {
        Lote lote = new Lote();

        lote.setId(rs.getLong("id"));

        int cantidad = rs.getInt("cantidad");
        if (!rs.wasNull()) {
            lote.setCantidad(cantidad);
        }

        lote.setFechaArribo(rs.getDate("fecha_arribo"));
        lote.setFechaVencimiento(rs.getDate("fecha_vencimiento"));

        Producto producto = new Producto();
        producto.setId(rs.getLong("producto_id"));
        producto.setNombre(rs.getString("producto_nombre"));
        producto.setMarca(rs.getString("producto_marca"));
        producto.setCategoria(rs.getString("producto_categoria"));
        producto.setPeso(rs.getString("producto_peso"));
        producto.setStock(rs.getInt("producto_stock"));
        producto.setPrecioCosto(rs.getDouble("producto_precio_costo"));
        producto.setPrecioVenta(rs.getDouble("producto_precio_venta"));
        producto.setEnPromocion(rs.getBoolean("producto_en_promocion"));
        producto.setPrecioPromo(rs.getDouble("producto_precio_promo"));
        producto.setDestacado(rs.getBoolean("producto_destacado"));
        lote.setProducto(producto);

        OrdenCompra ordenCompra = new OrdenCompra();
        ordenCompra.setId(rs.getLong("orden_id"));
        ordenCompra.setCantidad(rs.getInt("orden_cantidad"));
        ordenCompra.setTotal(rs.getDouble("orden_total"));
        ordenCompra.setFecha(rs.getDate("orden_fecha"));

        long proveedorId = rs.getLong("proveedor_id");
        if (!rs.wasNull()) {
            Proveedor proveedor = new Proveedor();
            proveedor.setId(proveedorId);
            proveedor.setNombre(rs.getString("proveedor_nombre"));
            proveedor.setTelefono(rs.getString("proveedor_telefono"));
            ordenCompra.setProveedor(proveedor);
        }

        lote.setOrdenCompra(ordenCompra);

        return lote;
    }

    private Lote mapearLote(ResultSet rs) throws SQLException {
        Lote lote = new Lote();

        lote.setId(rs.getLong("id"));

        int cantidad = rs.getInt("cantidad");
        if (!rs.wasNull()) {
            lote.setCantidad(cantidad);
        }

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
