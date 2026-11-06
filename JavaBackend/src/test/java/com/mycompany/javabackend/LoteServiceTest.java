package com.mycompany.javabackend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.Persistencia.ClasesDAO.LoteDao;
import com.mycompany.javabackend.dto.LoteDTO;
import com.mycompany.javabackend.service.LoteService;

class LoteServiceTest {

    private LoteDao loteDao;
    private LoteService service;

    @BeforeEach
    void setUp() {
        loteDao = mock(LoteDao.class);
        service = new LoteService(loteDao);
    }

    @Test
    void actualizarVencimientoRechazaFechaInexistente() {
        LoteDTO dto = new LoteDTO(null, null, null, " ");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.actualizarVencimiento(1L, dto));

        assertTrue(ex.getMessage().contains("vencimiento"));
        verify(loteDao, never()).actualizarFechaVencimiento(anyLong(), any());
    }

    @Test
    void actualizarVencimientoRechazaFormatoInvalido() {
        LoteDTO dto = new LoteDTO(null, null, null, "05/11/2026");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.actualizarVencimiento(1L, dto));

        assertTrue(ex.getMessage().contains("yyyy-MM-dd"));
    }

    @Test
    void actualizarVencimientoRechazaLoteInexistente() {
        when(loteDao.obtener(404L)).thenReturn(null);

        assertThrows(NoSuchElementException.class,
                () -> service.actualizarVencimiento(404L, new LoteDTO(null, null, null, "2027-01-01")));

        verify(loteDao, never()).actualizarFechaVencimiento(anyLong(), any());
    }

    @Test
    void actualizarVencimientoRechazaFechaAnteriorAlArribo() {
        Lote lote = loteExistente();
        when(loteDao.obtener(1L)).thenReturn(lote);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.actualizarVencimiento(1L, new LoteDTO(null, null, null, "2026-01-01")));

        assertTrue(ex.getMessage().contains("arribo"));
        verify(loteDao, never()).actualizarFechaVencimiento(anyLong(), any());
    }

    @Test
    void actualizarVencimientoActualizaSoloLaFecha() {
        Lote lote = loteExistente();
        when(loteDao.obtener(1L)).thenReturn(lote);
        when(loteDao.actualizarFechaVencimiento(1L, Date.valueOf("2027-06-30"))).thenReturn(true);

        Lote actualizado = service.actualizarVencimiento(1L,
                new LoteDTO(null, null, null, "2027-06-30"));

        assertEquals(Date.valueOf("2027-06-30"), actualizado.getFechaVencimiento());
        assertEquals(Date.valueOf("2026-11-10"), actualizado.getFechaArribo());
        assertEquals(5, actualizado.getCantidad().intValue());
        verify(loteDao).actualizarFechaVencimiento(1L, Date.valueOf("2027-06-30"));
    }

    @Test
    void obtenerPorIdRechazaIdNulo() {
        assertThrows(IllegalArgumentException.class, () -> service.obtenerPorId(null));
    }

    @Test
    void obtenerPorIdDevuelveNullCuandoNoExiste() {
        when(loteDao.obtenerConDetalle(404L)).thenReturn(null);

        assertNull(service.obtenerPorId(404L));
    }

    private Lote loteExistente() {
        Lote lote = new Lote();
        lote.setId(1L);
        lote.setCantidad(5);
        lote.setFechaArribo(Date.valueOf("2026-11-10"));
        lote.setFechaVencimiento(Date.valueOf("2027-05-10"));
        return lote;
    }
}
