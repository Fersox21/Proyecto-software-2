package com.mycompany.javabackend.Logica.Clases;

public class Producto {
    private Long id;
    private String nombre;
    private double precioCosto;
    private double precioVenta;
    private String marca;
    private boolean enPromocion = false;
    private int stock;
    private String categoria;
    private double peso;
    private Lote lote;

    public Producto() {
    }

    public Producto(Long id, String nombre, double precioCosto, double precioVenta, String marca, boolean enPromocion,
            int stock, String categoria, double peso, Lote lote) {
        this.id = id;
        this.nombre = nombre;
        this.precioCosto = precioCosto;
        this.precioVenta = precioVenta;
        this.marca = marca;
        this.enPromocion = enPromocion;
        this.stock = stock;
        this.categoria = categoria;
        this.peso = peso;
        this.lote = lote;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getPrecioCosto() {
        return precioCosto;
    }

    public void setPrecioCosto(double precioCosto) {
        this.precioCosto = precioCosto;
    }

    public double getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(double precioVenta) {
        this.precioVenta = precioVenta;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public boolean isEnPromocion() {
        return enPromocion;
    }

    public void setEnPromocion(boolean enPromocion) {
        this.enPromocion = enPromocion;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public double getPeso() {
        return peso;
    }

    public void setPeso(double peso) {
        this.peso = peso;
    }

    public Lote getLote() {
        return lote;
    }

    public void setLote(Lote lote) {
        this.lote = lote;
    }

    @Override
    public String toString() {
        return "Producto [id=" + id + ", nombre=" + nombre + ", precioCosto=" + precioCosto + ", precioVenta="
                + precioVenta + ", marca=" + marca + ", enPromocion=" + enPromocion + ", stock=" + stock
                + ", categoria=" + categoria + ", peso=" + peso + "]";
    }
}