package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;

public class Lote {
    private Long id;
    private Integer cantidad;
    private Date fechaArribo;
    private Date fechaVencimiento;
    private boolean activo;
    private OrdenCompra ordenCompra;
    private Producto producto;

    public Lote() {
    }

    public Lote(Long id, Date fechaArribo, Date fechaVencimiento, boolean activo, OrdenCompra ordenCompra,
            Producto producto) {
        this.id = id;
        this.fechaArribo = fechaArribo;
        this.fechaVencimiento = fechaVencimiento;
        this.activo = activo;
        this.ordenCompra = ordenCompra;
        this.producto = producto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
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

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    @Override
    public String toString() {
        return "Lote [id=" + id + ", cantidad=" + cantidad + ", fechaArribo=" + fechaArribo
                + ", fechaVencimiento=" + fechaVencimiento + ", ordenCompra=" + ordenCompra + "]";
    }
}
