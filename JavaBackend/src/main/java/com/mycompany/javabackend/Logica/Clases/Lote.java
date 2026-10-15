package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;

public class Lote {
    private Long id;
    private Date fechaArribo;
    private Date fechaVencimiento;
    private OrdenCompra ordenCompra;
    private Producto producto;

    public Lote() {
    }

    public Lote(Long id, Date fechaArribo, Date fechaVencimiento, OrdenCompra ordenCompra) {
        this.id = id;
        this.fechaArribo = fechaArribo;
        this.fechaVencimiento = fechaVencimiento;
        this.ordenCompra = ordenCompra;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getFechaArribo() {
        return fechaArribo;
    }

    public void setFechaArribo(Date fechaArribo) {
        this.fechaArribo = fechaArribo;
    }

    public Date getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(Date fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public OrdenCompra getOrdenCompra() {
        return ordenCompra;
    }

    public void setOrdenCompra(OrdenCompra ordenCompra) {
        this.ordenCompra = ordenCompra;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    @Override
    public String toString() {
        return "Lote [id=" + id + ", fechaArribo=" + fechaArribo + ", fechaVencimiento=" + fechaVencimiento
                + ", ordenCompra=" + ordenCompra + "]";
    }
}
