package Logica.Clases;

import java.sql.Date;

public class Venta {
    private Long id;
    private Date fecha;
    private double total;
    private Pedido pedido;

    public Venta() {
    }

    public Venta(Long id, Date fecha, double total, Pedido pedido) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.pedido = pedido;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    @Override
    public String toString() {
        return "Venta [id=" + id + ", fecha=" + fecha + ", total=" + total + ", pedido=" + pedido + "]";
    }
}
