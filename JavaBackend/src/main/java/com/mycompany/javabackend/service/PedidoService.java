package com.mycompany.javabackend.service;

import java.sql.Date;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Logica.Clases.Tiene;
import com.mycompany.javabackend.Persistencia.ClasesDAO.PedidoDao;
import com.mycompany.javabackend.Persistencia.ClasesDAO.TieneDao;
import com.mycompany.javabackend.dto.ItemPedidoDTO;
import com.mycompany.javabackend.dto.PedidoDTO;

@Service
public class PedidoService {

    private final PedidoDao pedidoDao = new PedidoDao();
    private final TieneDao tieneDao = new TieneDao();

    public Long procesarYGuardarPedido(PedidoDTO dto) {
        // 1. Instanciar y llenar la entidad Pedido
        Pedido pedido = new Pedido();
        pedido.setFecha(Date.valueOf(LocalDate.now()));
        pedido.setTotal(dto.getTotal());
        pedido.setMetodoPago("EFECTIVO"); // O el valor mapeado del dto
        pedido.setComercio(dto.getNombreComercio());
        pedido.setModalidadEntrega(dto.getMetodoEntrega());
        pedido.setDireccion(dto.getDireccion() != null ? dto.getDireccion() : "Retiro en local");
        pedido.setEstado("PENDIENTE");
        pedido.setMotivoRechazo(null);

        // 2. Guardar Pedido y recuperar su ID
        Long idPedido = pedidoDao.agregarYObtenerId(pedido);

        if (idPedido == null) {
            throw new RuntimeException("No se pudo generar el ID del pedido.");
        }

        pedido.setId(idPedido);

        // 3. Guardar los ítems en la tabla intermedia 'tienen'
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (ItemPedidoDTO itemDto : dto.getItems()) {
                Tiene tiene = new Tiene();
                
                Producto prod = new Producto();
                prod.setId(itemDto.getProductoId());

                tiene.setProducto(prod);
                tiene.setPedido(pedido);
                tiene.setCantidad(itemDto.getCantidad());
                tiene.setPrecio(itemDto.getPrecioUnitario());

                tieneDao.agregar(tiene);
            }
        }

        return idPedido;
    }
}