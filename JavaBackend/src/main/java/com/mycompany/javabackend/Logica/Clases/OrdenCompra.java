package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;
import java.util.List;

public class OrdenCompra {
    private Long id;

    /**
     * Unidades totales declaradas en la orden.
     * No es derivable: la tabla lotes no registra cantidad por producto.
     */
    private int cantidad;

    private double total;
    private Date fecha;
    private Proveedor proveedor;
    private List<Lote> lotes;

    public OrdenCompra() {
    }

    public OrdenCompra(Long id, int cantidad, double total, Date fecha, Proveedor proveedor) {
        this.id = id;
        this.cantidad = cantidad;
        this.total = total;
        this.fecha = fecha;
        this.proveedor = proveedor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public Proveedor getProveedor() {
        return proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public List<Lote> getLotes() {
        return lotes;
    }

    public void setLotes(List<Lote> lotes) {
        this.lotes = lotes;
    }

    @Override
    public String toString() {
        return "OrdenCompra [id=" + id + ", cantidad=" + cantidad + ", total=" + total + ", fecha=" + fecha
                + ", proveedor=" + proveedor + ", lotes=" + lotes + "]";
    }
}
