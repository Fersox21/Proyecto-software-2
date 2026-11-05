package com.mycompany.javabackend.dto;

import java.util.List;

/**
 * Datos de entrada para crear o actualizar una orden de compra.
 */
public class OrdenCompraDTO {

    /**
     * Unidades totales declaradas en la orden.
     * No es derivable: la tabla lotes no registra cantidad por producto.
     */
    private Integer cantidad;

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

    public OrdenCompraDTO(Integer cantidad, Double total, String fecha, Long proveedorId, List<LoteDTO> lotes) {
        this.cantidad = cantidad;
        this.total = total;
        this.fecha = fecha;
        this.proveedorId = proveedorId;
        this.lotes = lotes;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
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
        return "OrdenCompraDTO [cantidad=" + cantidad + ", total=" + total + ", fecha=" + fecha + ", proveedorId="
                + proveedorId + ", lotes=" + lotes + "]";
    }
}
