package com.mycompany.javabackend.Logica.Clases;

public class Proveedor {
    private Long id;
    private String nombre;
    private boolean activo;

    // VARCHAR(40) en el schema: no es un entero.
    private String telefono;

    public Proveedor() {
    }

    public Proveedor(Long id, String nombre, String telefono, boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.telefono = telefono;
        this.activo = activo;
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

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    @Override
    public String toString() {
        return "Proveedor [id=" + id + ", nombre=" + nombre + ", telefono=" + telefono + ", activo=" + activo + "]";
    }
}
