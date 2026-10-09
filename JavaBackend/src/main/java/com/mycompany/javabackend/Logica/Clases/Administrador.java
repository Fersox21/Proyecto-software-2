package com.mycompany.javabackend.Logica.Clases;

public class Administrador {
    private Long id;
    private String correo;
    private String password_hash;

    public Administrador() {
    }

    public Administrador(Long id, String correo, String password_hash) {
        this.id = id;
        this.correo = correo;
        this.password_hash = password_hash;
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

    public String getPassword_hash() {
        return password_hash;
    }

    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }

    @Override
    public String toString() {
        return "Administrador [id=" + id + ", correo=" + correo + ", password_hash=" + password_hash + "]";
    }
}
