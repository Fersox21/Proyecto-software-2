package com.mycompany.javabackend.dto;
import java.sql.Date;

public class VentasDTO {
    private Long id;
    private Date fecha;
    private Double total;
    private boolean estado;
    private Long pedidoId;

    public VentasDTO() {}

    public VentasDTO(Long id, Date fecha, Double total, boolean estado, Long pedidoId) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.estado = estado;
        this.pedidoId = pedidoId;
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

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public boolean isEstado() {
        return estado;
    }

    public void setEstado(boolean estado) {
        this.estado = estado;
    }

    public Long getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Long pedidoId) {
        this.pedidoId = pedidoId;
    }

    
}
