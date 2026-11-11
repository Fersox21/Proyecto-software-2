package com.mycompany.javabackend.dto;

import java.sql.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mycompany.javabackend.Logica.Clases.OrdenCompra;


public class OrdenCompraResponseDTO {

    private Long id;
    private Date fecha;
    private double total;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ProveedorResumenDTO proveedor;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<LoteResponseDTO> lotes;

    public OrdenCompraResponseDTO() {
    }

   
    public static OrdenCompraResponseDTO from(OrdenCompra ordenCompra) {
        return from(ordenCompra, false);
    }

    public static OrdenCompraResponseDTO from(OrdenCompra ordenCompra, boolean incluirLotes) {
        if (ordenCompra == null) {
            return null;
        }

        OrdenCompraResponseDTO dto = new OrdenCompraResponseDTO();
        dto.id = ordenCompra.getId();
        dto.fecha = ordenCompra.getFecha();
        dto.total = ordenCompra.getTotal();
        dto.proveedor = ProveedorResumenDTO.from(ordenCompra.getProveedor());

        if (incluirLotes) {
            dto.lotes = LoteResponseDTO.fromList(ordenCompra.getLotes());
        }

        return dto;
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

    public ProveedorResumenDTO getProveedor() {
        return proveedor;
    }

    public void setProveedor(ProveedorResumenDTO proveedor) {
        this.proveedor = proveedor;
    }

    public List<LoteResponseDTO> getLotes() {
        return lotes;
    }

    public void setLotes(List<LoteResponseDTO> lotes) {
        this.lotes = lotes;
    }
}
