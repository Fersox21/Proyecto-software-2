package com.mycompany.javabackend.service;

import java.sql.Date;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.Persistencia.ClasesDAO.LoteDao;
import com.mycompany.javabackend.dto.LoteDTO;

@Service
public class LoteService {

    private static final String FORMATO_FECHA = "yyyy-MM-dd";

    private final LoteDao loteDao;

    @Autowired
    public LoteService() {
        this(new LoteDao());
    }

    /**
     * Constructor con DAO inyectable, pensado para los tests.
     */
    public LoteService(LoteDao loteDao) {
        this.loteDao = loteDao;
    }

    public List<Lote> listar() {
        return loteDao.listarTodosConDetalle();
    }

    public Lote obtenerPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El id del lote es obligatorio");
        }

        return loteDao.obtenerConDetalle(id);
    }

    /**
     * Actualiza solo la fecha de vencimiento del lote, conservando su id y el
     * resto de sus datos.
     *
     * @return el lote actualizado.
     */
    public Lote actualizarVencimiento(Long id, LoteDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("El id del lote es obligatorio");
        }

        if (dto == null || dto.getFechaVencimiento() == null || dto.getFechaVencimiento().isBlank()) {
            throw new IllegalArgumentException("La fecha de vencimiento es obligatoria");
        }

        Date nuevaFecha = parsearFecha(dto.getFechaVencimiento(), "La fecha de vencimiento");

        Lote lote = loteDao.obtener(id);
        if (lote == null) {
            throw new NoSuchElementException("Lote no encontrado");
        }

        if (lote.getFechaArribo() != null && nuevaFecha.before(lote.getFechaArribo())) {
            throw new IllegalArgumentException(
                    "La fecha de vencimiento no puede ser anterior a la fecha de arribo");
        }

        if (!loteDao.actualizarFechaVencimiento(id, nuevaFecha)) {
            throw new NoSuchElementException("Lote no encontrado");
        }

        lote.setFechaVencimiento(nuevaFecha);
        return lote;
    }

    private Date parsearFecha(String fecha, String campo) {
        try {
            return Date.valueOf(fecha.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(campo + " debe tener el formato " + FORMATO_FECHA);
        }
    }
}
