package com.mycompany.javabackend.dto;

import java.util.List;

/**
 * Datos de entrada para crear o actualizar una orden de compra.
 */
public class OrdenCompraDTO {

    private Double total;
    private String fecha;
    private Long proveedorId;

    /**
     * Lotes de la orden. En un PUT, si el campo llega nulo los lotes existentes
     * se conservan; si llega una lista (incluso vacía) se reemplazan por completo.
     */
    private List<LoteDTO> lotes;

    public OrdenCompraDTO() {
    }

    public OrdenCompraDTO(Double total, String fecha, Long proveedorId, List<LoteDTO> lotes) {
        this.total = total;
        this.fecha = fecha;
        this.proveedorId = proveedorId;
        this.lotes = lotes;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public Long getProveedorId() {
        return proveedorId;
    }

    public void setProveedorId(Long proveedorId) {
        this.proveedorId = proveedorId;
    }

    public List<LoteDTO> getLotes() {
        return lotes;
    }

    public void setLotes(List<LoteDTO> lotes) {
        this.lotes = lotes;
    }

    @Override
    public String toString() {
        return "OrdenCompraDTO [total=" + total + ", fecha=" + fecha + ", proveedorId="
                + proveedorId + ", lotes=" + lotes + "]";
    }
}
