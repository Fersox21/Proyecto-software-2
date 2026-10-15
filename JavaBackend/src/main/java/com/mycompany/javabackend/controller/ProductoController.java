package com.mycompany.javabackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Persistencia.ClasesDAO.ProductoDao;
import com.mycompany.javabackend.dto.ProductoResponseDto;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {

    private final ProductoDao productoDao = new ProductoDao();

    private ProductoResponseDto convertirADto(Producto producto) {
        return new ProductoResponseDto(
                producto.getId(),
                producto.getNombre(),
                producto.getPrecioVenta(),
                producto.getMarca(),
                producto.isEnPromocion(),
                producto.getPrecioPromo(),
                producto.getStock(),
                producto.getCategoria(),
                producto.getPeso());
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponseDto>> listar() {
        List<Producto> productos = productoDao.obtenerTodos();

        List<ProductoResponseDto> dtos = productos.stream()
                .map(this::convertirADto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDto> obtenerPorId(@PathVariable Long id) {
        Producto producto = productoDao.obtener(id);
        if (producto != null) {
            return ResponseEntity.ok(convertirADto(producto));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody Producto producto) {
        productoDao.agregar(producto);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> modificar(@PathVariable Long id, @RequestBody Producto producto) {
        producto.setId(id);
        productoDao.modificar(producto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoDao.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}