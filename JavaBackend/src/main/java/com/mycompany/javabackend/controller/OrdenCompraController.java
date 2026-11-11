package com.mycompany.javabackend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.javabackend.Logica.Clases.OrdenCompra;
import com.mycompany.javabackend.dto.OrdenCompraDTO;
import com.mycompany.javabackend.dto.OrdenCompraResponseDTO;
import com.mycompany.javabackend.dto.RespuestaOrdenCompraDTO;
import com.mycompany.javabackend.service.OrdenCompraService;

@RestController
@RequestMapping("/api/ordenesCompra")
@CrossOrigin(origins = "http://localhost:5173")
public class OrdenCompraController {

    private final OrdenCompraService ordenCompraService;


    public OrdenCompraController(OrdenCompraService ordenCompraService) {
        this.ordenCompraService = ordenCompraService;
    }

    @GetMapping
    public ResponseEntity<List<OrdenCompraResponseDTO>> obtenerTodas() {
        try {
            List<OrdenCompraResponseDTO> ordenes = new ArrayList<>();
            for (OrdenCompra ordenCompra : ordenCompraService.obtenerTodas()) {
                ordenes.add(OrdenCompraResponseDTO.from(ordenCompra));
            }
            return ResponseEntity.ok(ordenes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenCompraResponseDTO> obtenerPorId(@PathVariable("id") Long id) {
        try {
            OrdenCompra ordenCompra = ordenCompraService.obtenerPorId(id);
            if (ordenCompra != null) {
                return ResponseEntity.ok(OrdenCompraResponseDTO.from(ordenCompra, true));
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<RespuestaOrdenCompraDTO> crear(@RequestBody OrdenCompraDTO ordenCompraDTO) {
        try {
            Long idOrdenCompra = ordenCompraService.crear(ordenCompraDTO);
            return ResponseEntity.status(201)
                    .body(new RespuestaOrdenCompraDTO(true, "Orden de compra registrada con éxito", idOrdenCompra));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new RespuestaOrdenCompraDTO(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new RespuestaOrdenCompraDTO(false, "Error interno al registrar la orden de compra", null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RespuestaOrdenCompraDTO> actualizar(@PathVariable("id") Long id,
            @RequestBody OrdenCompraDTO ordenCompraDTO) {
        try {
            ordenCompraService.actualizar(id, ordenCompraDTO);
            return ResponseEntity.ok(new RespuestaOrdenCompraDTO(true, "Orden de compra actualizada", id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new RespuestaOrdenCompraDTO(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new RespuestaOrdenCompraDTO(false, "Error interno al actualizar la orden de compra", null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        try {
            ordenCompraService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
