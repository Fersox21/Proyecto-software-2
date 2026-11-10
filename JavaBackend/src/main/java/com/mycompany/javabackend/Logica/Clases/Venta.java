package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;


public class Venta {
    private Long id;
    private Date fecha;
    private double total;
    private boolean activo;
    private Pedido pedido;
  

    public Venta() {
    }

    public Venta(Long id, Date fecha, double total, boolean activo, Pedido pedido) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.activo = activo;
        this.pedido = pedido;
        
    }

    public Venta(Long id, Date fecha, double total) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.activo = true;
        
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

   

    

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    @Override
    public String toString() {
        return "Venta [id=" + id + ", fecha=" + fecha + ", total=" + total + ", activo=" + activo + ", pedido=" + pedido
                +   "]";
    }
}
