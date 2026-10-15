package com.mycompany.javabackend.Logica.Clases;

public class Tiene {
    private Long id;
    private int cantidad;
    private double precio;
    private Producto producto;
    private Pedido pedido;

    public Tiene() {
    }

    public Tiene(Long id, int cantidad, double precio, Producto producto, Pedido pedido) {
        this.id = id;
        this.cantidad = cantidad;
        this.precio = precio;
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

    @Override
    public String toString() {
        return "Tiene [cantidad=" + cantidad + ", precio=" + precio + ", producto=" + producto + ", pedido=" + pedido
                + "]";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
