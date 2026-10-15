package com.mycompany.service;

import java.sql.Date;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.mycompany.dto.PedidoDTO;
import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Persistencia.ClasesDAO.PedidoDao;

@Service
public class PedidoService {

    private final PedidoDao pedidoDao = new PedidoDao();

    public Long procesarYGuardarPedido(PedidoDTO dto) {
        Pedido pedido = new Pedido();
        
        // Mapeamos los datos que vienen del Frontend (DTO) hacia tu Entidad
        pedido.setComercio(dto.getNombreComercio());
        pedido.setTotal(dto.getTotal()); // Según los getters de tu DTO
        pedido.setModalidadEntrega(dto.getMetodoEntrega());
        pedido.setDireccion(dto.getDireccion() != null ? dto.getDireccion() : "Retiro en local");
        pedido.setEstado("PENDIENTE"); // Estado inicial por defecto
        pedido.setFecha(Date.valueOf(LocalDate.now())); // Fecha actual
        pedido.setMetodoPago("Efectivo/Transferencia"); // O el que manejes

        // Llamamos a tu DAO existente para insertar en la base de datos
        pedidoDao.agregar(pedido);

        // Si necesitas guardar los ítems del carrito, aquí mismo harías un bucle 
        // recorriendo dto.getItems() y llamando a un ItemPedidoDao.

        return 1L; // Retornas el ID generado o simulado
    }
}