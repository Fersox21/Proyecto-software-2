package com.mycompany.javabackend.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.javabackend.service.EstadisticasService;

@RestController
@RequestMapping("/api/estadisticas")
@CrossOrigin(origins = "http://localhost:5173")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    
    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    @GetMapping("/ganancias-mensuales")
    public ResponseEntity<Object> gananciasMensuales() {
        try {
            List<Map<String, Object>> data = estadisticasService.obtenerGananciasMensuales();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return errorInterno();
        }
    }

    @GetMapping("/productos-vencidos")
    public ResponseEntity<Object> productosVencidos() {
        try {
            List<Map<String, Object>> data = estadisticasService.obtenerProductosVencidos();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return errorInterno();
        }
    }

    @GetMapping("/mas-vendidos")
    public ResponseEntity<Object> masVendidos(
            @RequestParam(value = "mes", required = false) String mes) {
        try {
            Map<String, Object> data = estadisticasService.obtenerMasVendidos(mes);
            return ResponseEntity.ok(data);
        } catch (IllegalArgumentException e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return errorInterno();
        }
    }

    @GetMapping("/promedio-diario")
    public ResponseEntity<Object> promedioDiario() {
        try {
            Map<String, Object> data = estadisticasService.obtenerPromedioDiario();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return errorInterno();
        }
    }

    private ResponseEntity<Object> errorInterno() {
        return error("No se pudieron obtener las estadísticas", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<Object> error(String mensaje, HttpStatus status) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("success", false);
        cuerpo.put("error", mensaje);
        cuerpo.put("statusCode", status.value());
        return ResponseEntity.status(status).body(cuerpo);
    }
}
