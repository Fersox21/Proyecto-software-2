package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;
import java.util.List;

public class OrdenCompra {
    private Long id;

    private double total;
    private Date fecha;
    private boolean activo;
    private Proveedor proveedor;
    private List<Lote> lotes;

    public OrdenCompra() {
    }

    public OrdenCompra(Long id, double total, Date fecha, boolean activo, Proveedor proveedor) {
        this.id = id;
        this.total = total;
        this.fecha = fecha;
        this.activo = activo;
        this.proveedor = proveedor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
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
        return "OrdenCompra [id=" + id + ", total=" + total + ", fecha=" + fecha
                + ", activo=" + activo + ", proveedor=" + proveedor + ", lotes=" + lotes + "]";
    }
}
