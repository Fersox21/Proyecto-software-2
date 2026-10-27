package com.mycompany.javabackend.controller;

import java.util.List;
import java.util.stream.Collectors;

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

import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.service.ProductoService;
import com.mycompany.javabackend.dto.ProductoAdminDto;
import com.mycompany.javabackend.dto.ProductoDto;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {

    private final ProductoService productoService = new ProductoService();

    @GetMapping("/catalogo")
    public ResponseEntity<List<ProductoDto>> verCatalogoPublico() {
        List<ProductoDto> lista = productoService.obtenerCatalogoPublico();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ProductoAdminDto>> verProductosAdmin() {
        List<ProductoAdminDto> lista = productoService.obtenerProductosParaAdmin();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Producto producto = productoService.obtenerPorId(id);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody Producto producto) {
        productoService.procesarYGuardarProducto(producto);
        return ResponseEntity.status(201).build();
    }

}