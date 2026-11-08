package com.mycompany.javabackend.Logica.Clases;

public class Tiene {
    private int cantidad;
    private double precio;
    private boolean activo;
    private Producto producto;
    private Pedido pedido;

    public Tiene() {
    }

    public Tiene(int cantidad, double precio, boolean activo, Producto producto, Pedido pedido) {
        this.cantidad = cantidad;
        this.precio = precio;
        this.activo = activo;
        this.producto = producto;
        this.pedido = pedido;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
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
        return "Tiene [cantidad=" + cantidad + ", precio=" + precio + ", activo=" + activo + ", producto=" + producto
                + ", pedido=" + pedido
                + "]";
    }

}
