package com.mycompany.javabackend.service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Logica.Clases.Rol;
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

        Rol rolPorDefecto = new Rol();
        rolPorDefecto.setId(1L);
        pedido.setRol(rolPorDefecto);

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
                
                // Si el precio viene nulo en el DTO, puedes evitar que falle
                Double precio = itemDto.getPrecioUnitario() != null ? itemDto.getPrecioUnitario() : 0.0;
                tiene.setPrecio(precio);

                tieneDao.agregar(tiene);
            }
        }

        return idPedido;
    }

    public List<Pedido> obtenerTodosLosPedidos() {
    return pedidoDao.obtenerTodos();
    }
}