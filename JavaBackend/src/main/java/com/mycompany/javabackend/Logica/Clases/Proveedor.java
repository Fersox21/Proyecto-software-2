package com.mycompany.javabackend.Logica.Clases;

public class Proveedor {
    private Long id;
    private String nombre;
    private int telefono;

    public Proveedor() {
    }

    public Proveedor(Long id, String nombre, int telefono) {
        this.id = id;
        this.nombre = nombre;
        this.telefono = telefono;
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

    public int getTelefono() {
        return telefono;
    }

    public void setTelefono(int telefono) {
        this.telefono = telefono;
    }

    @Override
    public String toString() {
        return "Proveedor [id=" + id + ", nombre=" + nombre + ", telefono=" + telefono + "]";
    }
}
