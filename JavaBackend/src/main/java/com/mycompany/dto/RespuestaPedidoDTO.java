package com.mycompany.dto;

public class RespuestaPedidoDTO {
    private boolean exito;
    private String mensaje;
    private Long idPedido;

    // Constructor completo
    public RespuestaPedidoDTO(boolean exito, String mensaje, Long idPedido) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.idPedido = idPedido;
    }

    // Getters y Setters
    public boolean isExito() {
        return exito;
    }

    public void setExito(boolean exito) {
        this.exito = exito;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Long getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Long idPedido) {
        this.idPedido = idPedido;
    }
}
