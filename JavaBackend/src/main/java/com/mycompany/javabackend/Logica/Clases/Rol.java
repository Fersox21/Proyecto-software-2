package com.mycompany.javabackend.Logica.Clases;

public class Rol {
    private Long id;
    private String correo;
    private String password;
    private String rol;
    private boolean activo;

    public Rol() {
    }

    public Rol(Long id, String correo, String password, String rol, boolean activo) {
        this.id = id;
        this.correo = correo;
        this.password = password;
        this.rol = rol;
        this.activo = activo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    @Override
    public String toString() {
        return "Rol [id=" + id + ", correo=" + correo + ", password=" + password + ", rol=" + rol + ", activo=" + activo
                + "]";
    }
}
