package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;
import java.util.List;
import java.util.ArrayList;
import Logica.Clases.Pedido;
import Logica.Clases.Producto;

public class Venta {
    private Long id;
    private Date fecha;
    private double total;
    private Pedido pedido;
    private List<Producto> productos;

    public Venta() {
    }

    public Venta(Long id, Date fecha, double total, Pedido pedido) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.pedido = pedido;
        this.productos = new ArrayList<>();
    }

    public Venta(Long id, Date fecha, double total) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.productos = new ArrayList<>();
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

    public List<Producto> getProductos() {
        return productos;
    }

    public void setProductos(List<Producto> productos) {
        this.productos = productos;
    }

    @Override
    public String toString() {
        return "Venta [id=" + id + ", fecha=" + fecha + ", total=" + total + ", pedido=" + pedido + ", productos="
                + productos + "]";
    }
}
