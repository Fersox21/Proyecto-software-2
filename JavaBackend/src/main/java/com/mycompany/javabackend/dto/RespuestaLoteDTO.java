package com.mycompany.javabackend.dto;

/**
 * Respuesta de las operaciones de escritura sobre lotes.
 * Mismo formato que RespuestaOrdenCompraDTO.
 */
public class RespuestaLoteDTO {
    private boolean exito;
    private String mensaje;
    private Long idLote;

    public RespuestaLoteDTO(boolean exito, String mensaje, Long idLote) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.idLote = idLote;
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

    public Long getIdLote() {
        return idLote;
    }

    public void setIdLote(Long idLote) {
        this.idLote = idLote;
    }
}
