package com.mycompany.javabackend.dto;

/**
 * Datos de entrada de un lote dentro de una orden de compra.
 * Las fechas viajan como texto ISO (yyyy-MM-dd) y se convierten en el service.
 */
public class LoteDTO {
    private Long productoId;
    private String fechaArribo;
    private String fechaVencimiento;

    public LoteDTO() {
    }

    public LoteDTO(Long productoId, String fechaArribo, String fechaVencimiento) {
        this.productoId = productoId;
        this.fechaArribo = fechaArribo;
        this.fechaVencimiento = fechaVencimiento;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getFechaArribo() {
        return fechaArribo;
    }

    public void setFechaArribo(String fechaArribo) {
        this.fechaArribo = fechaArribo;
    }

    public String getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(String fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    @Override
    public String toString() {
        return "LoteDTO [productoId=" + productoId + ", fechaArribo=" + fechaArribo + ", fechaVencimiento="
                + fechaVencimiento + "]";
    }
}
