package com.mycompany.javabackend.dto;

/**
 * Respuesta de las operaciones de escritura sobre ordenes de compra.
 * Mismo formato que RespuestaPedidoDTO.
 */
public class RespuestaOrdenCompraDTO {
    private boolean exito;
    private String mensaje;
    private Long idOrdenCompra;

    public RespuestaOrdenCompraDTO(boolean exito, String mensaje, Long idOrdenCompra) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.idOrdenCompra = idOrdenCompra;
    }

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

    public Long getIdOrdenCompra() {
        return idOrdenCompra;
    }

    public void setIdOrdenCompra(Long idOrdenCompra) {
        this.idOrdenCompra = idOrdenCompra;
    }
}
