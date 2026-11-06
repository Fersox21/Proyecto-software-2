package com.mycompany.javabackend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.Logica.Clases.OrdenCompra;
import com.mycompany.javabackend.Logica.Clases.Proveedor;
import com.mycompany.javabackend.Persistencia.ClasesDAO.LoteDao;
import com.mycompany.javabackend.Persistencia.ClasesDAO.OrdenCompraDao;
import com.mycompany.javabackend.Persistencia.ClasesDAO.ProveedorDao;
import com.mycompany.javabackend.dto.LoteDTO;
import com.mycompany.javabackend.dto.OrdenCompraDTO;
import com.mycompany.javabackend.service.OrdenCompraService;

class OrdenCompraServiceTest {

    private OrdenCompraDao ordenCompraDao;
    private ProveedorDao proveedorDao;
    private LoteDao loteDao;
    private OrdenCompraService service;

    @BeforeEach
    void setUp() {
        ordenCompraDao = mock(OrdenCompraDao.class);
        proveedorDao = mock(ProveedorDao.class);
        loteDao = mock(LoteDao.class);
        service = new OrdenCompraService(ordenCompraDao, proveedorDao, loteDao);

        when(proveedorDao.obtener(1L)).thenReturn(new Proveedor(1L, "Distribuidora Norte", "111222333", true));
    }

    @Test
    void crearRechazaCantidadNoPositiva() {
        OrdenCompraDTO cero = dtoValido();
        cero.setCantidad(0);

        OrdenCompraDTO negativa = dtoValido();
        negativa.setCantidad(-5);

        OrdenCompraDTO nula = dtoValido();
        nula.setCantidad(null);

        for (OrdenCompraDTO dto : List.of(cero, negativa, nula)) {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
            assertTrue(ex.getMessage().contains("cantidad"), "Mensaje inesperado: " + ex.getMessage());
        }

        verify(ordenCompraDao, never()).crearConLotes(any(), anyList());
    }

    @Test
    void crearRechazaTotalNoPositivo() {
        OrdenCompraDTO cero = dtoValido();
        cero.setTotal(0.0);

        OrdenCompraDTO negativo = dtoValido();
        negativo.setTotal(-10.0);

        OrdenCompraDTO nulo = dtoValido();
        nulo.setTotal(null);

        for (OrdenCompraDTO dto : List.of(cero, negativo, nulo)) {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
            assertTrue(ex.getMessage().contains("total"), "Mensaje inesperado: " + ex.getMessage());
        }

        verify(ordenCompraDao, never()).crearConLotes(any(), anyList());
    }

    @Test
    void crearRechazaFechaInvalida() {
        OrdenCompraDTO formatoInvalido = dtoValido();
        formatoInvalido.setFecha("03/11/2026");

        OrdenCompraDTO nula = dtoValido();
        nula.setFecha(null);

        for (OrdenCompraDTO dto : List.of(formatoInvalido, nula)) {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
            assertTrue(ex.getMessage().contains("fecha"), "Mensaje inesperado: " + ex.getMessage());
        }

        verify(ordenCompraDao, never()).crearConLotes(any(), anyList());
    }

    @Test
    void crearRechazaProveedorInexistente() {
        OrdenCompraDTO dto = dtoValido();
        dto.setProveedorId(99L);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.crear(dto));

        assertTrue(ex.getMessage().contains("proveedor"), "Mensaje inesperado: " + ex.getMessage());
        verify(ordenCompraDao, never()).crearConLotes(any(), anyList());
    }

    @Test
    void crearRechazaLoteSinProducto() {
        OrdenCompraDTO dto = dtoValido();
        dto.getLotes().get(0).setProductoId(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.crear(dto));

        assertTrue(ex.getMessage().contains("producto"), "Mensaje inesperado: " + ex.getMessage());
        verify(ordenCompraDao, never()).crearConLotes(any(), anyList());
    }

    @Test
    void crearRechazaLoteSinFechaDeArribo() {
        OrdenCompraDTO dto = dtoValido();
        dto.getLotes().get(0).setFechaArribo(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.crear(dto));

        assertTrue(ex.getMessage().contains("fecha"), "Mensaje inesperado: " + ex.getMessage());
        verify(ordenCompraDao, never()).crearConLotes(any(), anyList());
    }

    @Test
    void crearRechazaCantidadDeLoteNoPositiva() {
        OrdenCompraDTO cero = dtoValido();
        cero.getLotes().get(0).setCantidad(0);

        OrdenCompraDTO negativa = dtoValido();
        negativa.getLotes().get(0).setCantidad(-3);

        for (OrdenCompraDTO dto : List.of(cero, negativa)) {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
            assertTrue(ex.getMessage().contains("cantidad"), "Mensaje inesperado: " + ex.getMessage());
        }

        verify(ordenCompraDao, never()).crearConLotes(any(), anyList());
    }

    @Test
    void crearGuardaLaOrdenConSusLotesYDevuelveElId() {
        when(ordenCompraDao.crearConLotes(any(OrdenCompra.class), anyList())).thenReturn(42L);

        Long id = service.crear(dtoValido());

        assertEquals(42L, id);

        ArgumentCaptor<OrdenCompra> ordenCaptor = ArgumentCaptor.forClass(OrdenCompra.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Lote>> lotesCaptor = ArgumentCaptor.forClass(List.class);

        verify(ordenCompraDao).crearConLotes(ordenCaptor.capture(), lotesCaptor.capture());

        OrdenCompra orden = ordenCaptor.getValue();
        assertEquals(10, orden.getCantidad());
        assertEquals(25000.0, orden.getTotal(), 0.001);
        assertEquals(Date.valueOf("2026-11-03"), orden.getFecha());
        assertEquals(1L, orden.getProveedor().getId().longValue());
        assertEquals("Distribuidora Norte", orden.getProveedor().getNombre());

        List<Lote> lotes = lotesCaptor.getValue();
        assertEquals(1, lotes.size());

        Lote lote = lotes.get(0);
        assertEquals(10L, lote.getProducto().getId().longValue());
        assertEquals(10, lote.getCantidad().intValue());
        assertEquals(Date.valueOf("2026-11-10"), lote.getFechaArribo());
        assertEquals(Date.valueOf("2027-05-10"), lote.getFechaVencimiento());
    }

    @Test
    void crearSinLotesGuardaUnaListaVacia() {
        when(ordenCompraDao.crearConLotes(any(OrdenCompra.class), anyList())).thenReturn(7L);

        OrdenCompraDTO dto = dtoValido();
        dto.setLotes(null);

        assertEquals(7L, service.crear(dto));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Lote>> lotesCaptor = ArgumentCaptor.forClass(List.class);

        verify(ordenCompraDao).crearConLotes(any(OrdenCompra.class), lotesCaptor.capture());
        assertTrue(lotesCaptor.getValue().isEmpty());
    }

    @Test
    void actualizarSinCampoLotesConservaLosExistentes() {
        when(ordenCompraDao.obtener(5L)).thenReturn(new OrdenCompra());

        OrdenCompraDTO dto = dtoValido();
        dto.setLotes(null);

        service.actualizar(5L, dto);

        verify(ordenCompraDao).modificar(any(OrdenCompra.class));
        verify(ordenCompraDao, never()).actualizarConLotes(any(), anyList());
    }

    @Test
    void actualizarConLotesReemplazaElConjunto() {
        when(ordenCompraDao.obtener(5L)).thenReturn(new OrdenCompra());

        service.actualizar(5L, dtoValido());

        verify(ordenCompraDao).actualizarConLotes(any(OrdenCompra.class), anyList());
        verify(ordenCompraDao, never()).modificar(any(OrdenCompra.class));
    }

    @Test
    void actualizarOrdenInexistenteLanzaNoSuchElement() {
        when(ordenCompraDao.obtener(404L)).thenReturn(null);

        assertThrows(NoSuchElementException.class, () -> service.actualizar(404L, dtoValido()));

        verify(ordenCompraDao, never()).modificar(any(OrdenCompra.class));
        verify(ordenCompraDao, never()).actualizarConLotes(any(), anyList());
    }

    @Test
    void eliminarOrdenInexistenteLanzaNoSuchElement() {
        when(ordenCompraDao.obtener(404L)).thenReturn(null);

        assertThrows(NoSuchElementException.class, () -> service.eliminar(404L));

        verify(ordenCompraDao, never()).eliminarConLotes(anyLong());
    }

    @Test
    void eliminarOrdenExistenteUsaElBorradoEnCascada() {
        when(ordenCompraDao.obtener(5L)).thenReturn(new OrdenCompra());

        service.eliminar(5L);

        verify(ordenCompraDao).eliminarConLotes(5L);
    }

    @Test
    void obtenerPorIdDevuelveNullCuandoNoExiste() {
        when(ordenCompraDao.obtener(404L)).thenReturn(null);

        assertNull(service.obtenerPorId(404L));
    }

    @Test
    void obtenerPorIdCargaSusLotes() {
        OrdenCompra orden = new OrdenCompra();
        orden.setId(5L);

        when(ordenCompraDao.obtener(5L)).thenReturn(orden);
        when(loteDao.listarPorOrdenCompra(5L)).thenReturn(List.of(new Lote(), new Lote()));

        OrdenCompra resultado = service.obtenerPorId(5L);

        assertNotNull(resultado);
        assertNotNull(resultado.getLotes());
        assertEquals(2, resultado.getLotes().size());
    }

    private OrdenCompraDTO dtoValido() {
        List<LoteDTO> lotes = new ArrayList<>();
        lotes.add(new LoteDTO(10L, 10, "2026-11-10", "2027-05-10"));

        return new OrdenCompraDTO(10, 25000.0, "2026-11-03", 1L, lotes);
    }
}
