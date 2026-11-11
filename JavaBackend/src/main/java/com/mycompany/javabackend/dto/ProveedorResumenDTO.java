package com.mycompany.javabackend.dto;

import com.mycompany.javabackend.Logica.Clases.Proveedor;


public class ProveedorResumenDTO {

    private Long id;
    private String nombre;
    private String telefono;

    public ProveedorResumenDTO() {
    }

    public ProveedorResumenDTO(Long id, String nombre, String telefono) {
        this.id = id;
        this.nombre = nombre;
        this.telefono = telefono;
    }

    public static ProveedorResumenDTO from(Proveedor proveedor) {
        if (proveedor == null) {
            return null;
        }

        return new ProveedorResumenDTO(proveedor.getId(), proveedor.getNombre(), proveedor.getTelefono());
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
}
