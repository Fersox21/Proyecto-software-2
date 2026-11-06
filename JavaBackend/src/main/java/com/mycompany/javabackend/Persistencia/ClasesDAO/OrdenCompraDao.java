package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.Logica.Clases.OrdenCompra;
import com.mycompany.javabackend.Logica.Clases.Proveedor;
import com.mycompany.javabackend.Persistencia.connection.Conexion;

public class OrdenCompraDao implements DAO<OrdenCompra> {

    private final LoteDao loteDao = new LoteDao();

    public OrdenCompraDao() {
    }

    @Override
    public void agregar(OrdenCompra ordenCompra) {
        agregarYObtenerId(ordenCompra);
    }

    /**
     * Inserta la orden y devuelve el id generado por la base.
     */
    public Long agregarYObtenerId(OrdenCompra ordenCompra) {
        String sql = "INSERT INTO ordenes_compra (cantidad, total, fecha, proveedor_id) VALUES (?, ?, ?, ?)";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al insertar ordenCompra: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            setParametrosOrden(ps, ordenCompra);

            if (ps.executeUpdate() > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        Long idGenerado = rs.getLong(1);
                        ordenCompra.setId(idGenerado);
                        return idGenerado;
                    }
                }
            }

        } catch (SQLException e) {
            System.err.println("Error al insertar ordenCompra: " + e.getMessage());
        }

        return null;
    }

    @Override
    public void eliminar(Long id) {
        String sql = "UPDATE ordenes_compra SET activo = false WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al eliminar ordenCompra: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al eliminar ordenCompra: " + e.getMessage());
        }
    }

    @Override
    public void modificar(OrdenCompra ordenCompra) {
        String sql = "UPDATE ordenes_compra SET cantidad = ?, total = ?, fecha = ?, proveedor_id = ? WHERE id = ?";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al modificar ordenCompra: no hay conexión disponible");
            return;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            setParametrosOrden(ps, ordenCompra);
            ps.setLong(5, ordenCompra.getId());
            ps.executeUpdate();

        } catch (SQLException e) {
            System.err.println("Error al modificar ordenCompra: " + e.getMessage());
        }
    }

    @Override
    public OrdenCompra obtener(Long id) {
        String sql = "SELECT oc.id, oc.cantidad, oc.total, oc.fecha, oc.activo, oc.proveedor_id, "
                + "p.nombre AS proveedor_nombre, p.telefono AS proveedor_telefono "
                + "FROM ordenes_compra oc LEFT JOIN proveedores p ON p.id = oc.proveedor_id WHERE oc.id = ? ORDER BY oc.activo DESC, oc.fecha ASC";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al obtener ordenCompra por ID: no hay conexión disponible");
            return null;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearOrden(rs);
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
        String sql = "SELECT oc.id, oc.cantidad, oc.total, oc.fecha, oc.activo, oc.proveedor_id, "
                + "p.nombre AS proveedor_nombre, p.telefono AS proveedor_telefono "
                + "FROM ordenes_compra oc LEFT JOIN proveedores p ON p.id = oc.proveedor_id ORDER BY oc.activo DESC, oc.fecha ASC";
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            System.err.println("Error al listar ordenesCompra: no hay conexión disponible");
            return lista;
        }

        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapearOrden(rs));
            }

        } catch (SQLException e) {
            System.err.println("Error al listar todas las ordenesCompra: " + e.getMessage());
        }

        return lista;
    }

    /**
     * Inserta la orden junto con sus lotes en una sola transacción.
     *
     * @return id generado para la orden.
     */
    public Long crearConLotes(OrdenCompra ordenCompra, List<Lote> lotes) {
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            throw new RuntimeException("No hay conexión disponible con la base de datos");
        }

        boolean autoCommitOriginal = obtenerAutoCommit(conn);

        try {
            conn.setAutoCommit(false);

            Long idOrden = insertarOrden(conn, ordenCompra);

            if (lotes != null) {
                for (Lote lote : lotes) {
                    loteDao.agregar(conn, lote, idOrden);
                }
            }

            conn.commit();
            ordenCompra.setId(idOrden);
            return idOrden;

        } catch (SQLException e) {
            rollback(conn);
            throw new RuntimeException("Error al registrar la orden de compra: " + e.getMessage(), e);
        } finally {
            restaurarAutoCommit(conn, autoCommitOriginal);
        }
    }

    /**
     * Actualiza la orden y reemplaza por completo sus lotes en una sola
     * transacción. Si la lista es nula, la orden queda sin lotes: quien llama
     * debe usar modificar() cuando quiera conservarlos.
     */
    public void actualizarConLotes(OrdenCompra ordenCompra, List<Lote> lotes) {
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            throw new RuntimeException("No hay conexión disponible con la base de datos");
        }

        boolean autoCommitOriginal = obtenerAutoCommit(conn);

        try {
            conn.setAutoCommit(false);

            actualizarOrden(conn, ordenCompra);
            eliminarLotesDeOrden(conn, ordenCompra.getId());

            if (lotes != null) {
                for (Lote lote : lotes) {
                    loteDao.agregar(conn, lote, ordenCompra.getId());
                }
            }

            conn.commit();

        } catch (SQLException e) {
            rollback(conn);
            throw new RuntimeException("Error al actualizar la orden de compra: " + e.getMessage(), e);
        } finally {
            restaurarAutoCommit(conn, autoCommitOriginal);
        }
    }

    /**
     * Elimina la orden y sus lotes en cascada, dentro de una transacción.
     */
    public void eliminarConLotes(Long id) {
        Connection conn = Conexion.getInstance().getConnection();
        if (conn == null) {
            throw new RuntimeException("No hay conexión disponible con la base de datos");
        }

        boolean autoCommitOriginal = obtenerAutoCommit(conn);

        try {
            conn.setAutoCommit(false);

            eliminarLotesDeOrden(conn, id);

            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM ordenes_compra WHERE id = ?")) {
                ps.setLong(1, id);
                ps.executeUpdate();
            }

            conn.commit();

        } catch (SQLException e) {
            rollback(conn);
            throw new RuntimeException("Error al eliminar la orden de compra: " + e.getMessage(), e);
        } finally {
            restaurarAutoCommit(conn, autoCommitOriginal);
        }
    }

    // ------------------------------------------------------------------
    // Helpers de transacción
    // ------------------------------------------------------------------

    private Long insertarOrden(Connection conn, OrdenCompra ordenCompra) throws SQLException {
        String sql = "INSERT INTO ordenes_compra (cantidad, total, fecha, proveedor_id) VALUES (?, ?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            setParametrosOrden(ps, ordenCompra);

            if (ps.executeUpdate() == 0) {
                throw new SQLException("No se insertó la orden de compra");
            }

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }
        }

        throw new SQLException("No se pudo obtener el id de la orden de compra generada");
    }

    private void actualizarOrden(Connection conn, OrdenCompra ordenCompra) throws SQLException {
        String sql = "UPDATE ordenes_compra SET cantidad = ?, total = ?, fecha = ?, proveedor_id = ? WHERE id = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            setParametrosOrden(ps, ordenCompra);
            ps.setLong(5, ordenCompra.getId());
            ps.executeUpdate();
        }
    }

    private void eliminarLotesDeOrden(Connection conn, Long ordenCompraId) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement("DELETE FROM lotes WHERE orden_compra_id = ?")) {
            ps.setLong(1, ordenCompraId);
            ps.executeUpdate();
        }
    }

    private boolean obtenerAutoCommit(Connection conn) {
        try {
            return conn.getAutoCommit();
        } catch (SQLException e) {
            throw new RuntimeException("No se pudo consultar el estado de la conexión", e);
        }
    }

    private void rollback(Connection conn) {
        try {
            conn.rollback();
        } catch (SQLException e) {
            System.err.println("Error al revertir la transacción: " + e.getMessage());
        }
    }

    private void restaurarAutoCommit(Connection conn, boolean autoCommitOriginal) {
        try {
            conn.setAutoCommit(autoCommitOriginal);
        } catch (SQLException e) {
            System.err.println("Error al restaurar el autoCommit de la conexión: " + e.getMessage());
        }
    }

    private void setParametrosOrden(PreparedStatement ps, OrdenCompra ordenCompra) throws SQLException {
        ps.setInt(1, ordenCompra.getCantidad());
        ps.setDouble(2, ordenCompra.getTotal());
        ps.setDate(3, ordenCompra.getFecha());

        if (ordenCompra.getProveedor() != null && ordenCompra.getProveedor().getId() != null) {
            ps.setLong(4, ordenCompra.getProveedor().getId());
        } else {
            ps.setNull(4, Types.BIGINT);
        }
    }

    private OrdenCompra mapearOrden(ResultSet rs) throws SQLException {
        OrdenCompra ordenCompra = new OrdenCompra();

        ordenCompra.setId(rs.getLong("id"));
        ordenCompra.setCantidad(rs.getInt("cantidad"));
        ordenCompra.setTotal(rs.getDouble("total"));
        ordenCompra.setFecha(rs.getDate("fecha"));

        long proveedorId = rs.getLong("proveedor_id");
        if (!rs.wasNull()) {
            Proveedor proveedor = new Proveedor();
            proveedor.setId(proveedorId);
            proveedor.setNombre(rs.getString("proveedor_nombre"));
            proveedor.setTelefono(rs.getString("proveedor_telefono"));
            ordenCompra.setProveedor(proveedor);
        }

        return ordenCompra;
    }
}
