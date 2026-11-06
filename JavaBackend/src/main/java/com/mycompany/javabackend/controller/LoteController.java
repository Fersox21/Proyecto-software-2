package com.mycompany.javabackend.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.dto.LoteDTO;
import com.mycompany.javabackend.dto.RespuestaLoteDTO;
import com.mycompany.javabackend.service.LoteService;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin(origins = "http://localhost:5173")
public class LoteController {

    private final LoteService loteService;

    @Autowired
    public LoteController(LoteService loteService) {
        this.loteService = loteService;
    }

    @GetMapping
    public ResponseEntity<List<Lote>> listar() {
        try {
            return ResponseEntity.ok(loteService.listar());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lote> obtenerPorId(@PathVariable("id") Long id) {
        try {
            Lote lote = loteService.obtenerPorId(id);
            if (lote != null) {
                return ResponseEntity.ok(lote);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RespuestaLoteDTO> actualizarVencimiento(@PathVariable("id") Long id,
            @RequestBody LoteDTO loteDTO) {
        try {
            loteService.actualizarVencimiento(id, loteDTO);
            return ResponseEntity
                    .ok(new RespuestaLoteDTO(true, "Vencimiento del lote actualizado", id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404)
                    .body(new RespuestaLoteDTO(false, e.getMessage(), id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new RespuestaLoteDTO(false, e.getMessage(), id));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new RespuestaLoteDTO(false, "Error interno al actualizar el vencimiento", id));
        }
    }
}
