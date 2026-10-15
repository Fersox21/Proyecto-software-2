package com.mycompany.javabackend.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.dto.PedidoDTO;
import com.mycompany.javabackend.dto.RespuestaPedidoDTO;
import com.mycompany.javabackend.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoController {

    private final PedidoService pedidoService = new PedidoService();

    @PostMapping
    public ResponseEntity<RespuestaPedidoDTO> crearPedido(@RequestBody PedidoDTO pedidoDTO) {
        try {
            Long idPedido = pedidoService.procesarYGuardarPedido(pedidoDTO);
            return ResponseEntity.ok(new RespuestaPedidoDTO(true, "Pedido registrado con éxito", idPedido));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RespuestaPedidoDTO(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodos() {
        List<Pedido> pedidos = pedidoService.obtenerTodosLosPedidos();
        return ResponseEntity.ok(pedidos);
    }
}