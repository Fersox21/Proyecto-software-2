package com.mycompany.javabackend.Logica.Clases;

public class Rol {
    private Long id;
    private String correo;
    private String password;

    public Rol() {
    }

    public Rol(Long id, String correo, String password) {
        this.id = id;
        this.correo = correo;
        this.password = password;
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

    @Override
    public String toString() {
        return "Rol [id=" + id + ", correo=" + correo + ", password=" + password + "]";
    }
}
