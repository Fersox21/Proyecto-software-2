package com.mycompany.javabackend.dto;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mycompany.javabackend.Logica.Clases.Lote;


public class LoteResponseDTO {

    private Long id;
    private Integer cantidad;
    private Date fechaArribo;
    private Date fechaVencimiento;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ProductoResumenDTO producto;

    public LoteResponseDTO() {
    }

    public static LoteResponseDTO from(Lote lote) {
        if (lote == null) {
            return null;
        }

        LoteResponseDTO dto = new LoteResponseDTO();
        dto.id = lote.getId();
        dto.cantidad = lote.getCantidad();
        dto.fechaArribo = lote.getFechaArribo();
        dto.fechaVencimiento = lote.getFechaVencimiento();
        dto.producto = ProductoResumenDTO.from(lote.getProducto());

        return dto;
    }

    public static List<LoteResponseDTO> fromList(List<Lote> lotes) {
        if (lotes == null) {
            return null;
        }

        List<LoteResponseDTO> lista = new ArrayList<>();
        for (Lote lote : lotes) {
            if (lote != null) {
                lista.add(from(lote));
            }
        }

        return lista;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Date getFechaArribo() {
        return fechaArribo;
    }

    public void setFechaArribo(Date fechaArribo) {
        this.fechaArribo = fechaArribo;
    }

    public Date getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(Date fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public ProductoResumenDTO getProducto() {
        return producto;
    }

    public void setProducto(ProductoResumenDTO producto) {
        this.producto = producto;
    }
}
