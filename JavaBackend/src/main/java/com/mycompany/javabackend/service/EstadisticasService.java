package com.mycompany.javabackend.service;

import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.javabackend.Persistencia.ClasesDAO.EstadisticasDao;

@Service
public class EstadisticasService {

    private static final Pattern FORMATO_MES = Pattern.compile("^\\d{4}-(0[1-9]|1[0-2])$");

    private final EstadisticasDao estadisticasDao;

    @Autowired
    public EstadisticasService() {
        this(new EstadisticasDao());
    }


    public EstadisticasService(EstadisticasDao estadisticasDao) {
        this.estadisticasDao = estadisticasDao;
    }

    public List<Map<String, Object>> obtenerGananciasMensuales() {
        return estadisticasDao.gananciasMensuales();
    }

    public List<Map<String, Object>> obtenerProductosVencidos() {
        return estadisticasDao.productosVencidos();
    }


    public Map<String, Object> obtenerMasVendidos(String mes) {
        String mesConsulta = (mes == null || mes.isBlank()) ? mesAnterior() : mes.trim();

        if (!FORMATO_MES.matcher(mesConsulta).matches()) {
            throw new IllegalArgumentException("El parámetro \"mes\" debe tener el formato YYYY-MM");
        }

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("mes", mesConsulta);
        respuesta.put("items", estadisticasDao.masVendidosPorMes(mesConsulta));
        return respuesta;
    }

    public Map<String, Object> obtenerPromedioDiario() {
        return estadisticasDao.promedioDiario();
    }

    private String mesAnterior() {
        return YearMonth.now().minusMonths(1).toString();
    }
}
