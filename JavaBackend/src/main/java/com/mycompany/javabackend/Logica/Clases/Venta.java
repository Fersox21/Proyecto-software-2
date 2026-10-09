package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

public class Venta {
    private Long id;
    private Date fecha;
    private double total;
    private List<Producto> productos = new ArrayList<Producto>();

    public Venta() {
    }

    public Venta(Long id, Date fecha, double total, List<Producto> productos) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.productos = productos;
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

    public List<Producto> getProductos() {
        return productos;
    }

    public void setProductos(List<Producto> productos) {
        this.productos = productos;
    }

    @Override
    public String toString() {
        return "Venta [id=" + id + ", fecha=" + fecha + ", total=" + total + ", productos=" + productos + "]";
    }
}
