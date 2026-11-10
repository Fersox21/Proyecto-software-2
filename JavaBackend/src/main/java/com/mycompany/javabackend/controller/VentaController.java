package com.mycompany.javabackend.controller;

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

import com.mycompany.javabackend.Logica.Clases.Tiene;
import com.mycompany.javabackend.service.VentasService;
import com.mycompany.javabackend.dto.VentasDTO;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:5173")
public class VentaController {

    private final VentasService ventasService = new VentasService();

    @GetMapping
    public ResponseEntity<List<VentasDTO>> mostrarVentas() {
        List<VentasDTO> lista = ventasService.obtenerTodo();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Void> crearVenta(@RequestBody VentasDTO venta) {
        try {
            ventasService.crearVenta(venta);
            return ResponseEntity.status(201).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentasDTO> obtenerVentaPorId(@PathVariable Long id) {
        VentasDTO venta = ventasService.obtenerPorId(id);
        if (venta != null) {
            return ResponseEntity.ok(venta);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/productos")
    public ResponseEntity<List<Tiene>> obtenerProductosDeVenta(@PathVariable Long id) {
        List<Tiene> productos = ventasService.obtenerProductosPorVenta(id);
        return ResponseEntity.ok(productos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizarVenta(@PathVariable Long id, @RequestBody VentasDTO venta) {
        try {
            ventasService.actualizarVenta(id, venta);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        try {
            ventasService.eliminarVenta(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
