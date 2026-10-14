package Logica.Clases;

import java.sql.Date;

public class OrdenCompra {
    private Long id;
    private int cantidad;
    private double total;
    private Date fecha;
    private Proveedor proveedor;

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

    @Override
    public String toString() {
        return "OrdenCompra [id=" + id + ", cantidad=" + cantidad + ", total=" + total + ", fecha=" + fecha
                + ", proveedor=" + proveedor + "]";
    }
}
