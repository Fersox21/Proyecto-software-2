package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;

public class Pedido {
    private Long id;
    private Date fecha;
    private double total;
    private String metodoPago;
    private String comercio;
    private String modalidadEntrega;
    private String direccion;
    private String estado;
    private String motivoRechazo;

    public Pedido() {
    }

    public Pedido(Long id, Date fecha, double total, String metodoPago, String comercio, String modalidadEntrega,
            String direccion, String estado, String motivoRechazo) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.metodoPago = metodoPago;
        this.comercio = comercio;
        this.modalidadEntrega = modalidadEntrega;
        this.direccion = direccion;
        this.estado = estado;
        this.motivoRechazo = motivoRechazo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getComercio() {
        return comercio;
    }

    public void setComercio(String comercio) {
        this.comercio = comercio;
    }

    public String getModalidadEntrega() {
        return modalidadEntrega;
    }

    public void setModalidadEntrega(String modalidadEntrega) {
        this.modalidadEntrega = modalidadEntrega;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    @Override
    public String toString() {
        return "Pedido [id=" + id + ", fecha=" + fecha + ", total=" + total + ", metodoPago=" + metodoPago
                + ", comercio=" + comercio + ", modalidadEntrega=" + modalidadEntrega + ", direccion=" + direccion
                + ", estado=" + estado + ", motivoRechazo=" + motivoRechazo + "]";
    }
}