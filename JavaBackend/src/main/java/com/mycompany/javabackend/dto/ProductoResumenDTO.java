package com.mycompany.javabackend.dto;

import com.mycompany.javabackend.Logica.Clases.Producto;


public class ProductoResumenDTO {

    private Long id;
    private String nombre;
    private String marca;

    public ProductoResumenDTO() {
    }

    public ProductoResumenDTO(Long id, String nombre, String marca) {
        this.id = id;
        this.nombre = nombre;
        this.marca = marca;
    }

    public static ProductoResumenDTO from(Producto producto) {
        if (producto == null) {
            return null;
        }

        return new ProductoResumenDTO(producto.getId(), producto.getNombre(), producto.getMarca());
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

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }
}
