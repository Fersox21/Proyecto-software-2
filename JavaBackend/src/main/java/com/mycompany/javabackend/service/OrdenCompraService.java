package com.mycompany.javabackend.service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mycompany.javabackend.Logica.Clases.Lote;
import com.mycompany.javabackend.Logica.Clases.OrdenCompra;
import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Logica.Clases.Proveedor;
import com.mycompany.javabackend.Persistencia.ClasesDAO.LoteDao;
import com.mycompany.javabackend.Persistencia.ClasesDAO.OrdenCompraDao;
import com.mycompany.javabackend.Persistencia.ClasesDAO.ProveedorDao;
import com.mycompany.javabackend.dto.LoteDTO;
import com.mycompany.javabackend.dto.OrdenCompraDTO;

@Service
public class OrdenCompraService {

    private static final String FORMATO_FECHA = "yyyy-MM-dd";

    private final OrdenCompraDao ordenCompraDao;
    private final ProveedorDao proveedorDao;
    private final LoteDao loteDao;


    @Autowired
    public OrdenCompraService() {
        this(new OrdenCompraDao(), new ProveedorDao(), new LoteDao());
    }


    public OrdenCompraService(OrdenCompraDao ordenCompraDao, ProveedorDao proveedorDao, LoteDao loteDao) {
        this.ordenCompraDao = ordenCompraDao;
        this.proveedorDao = proveedorDao;
        this.loteDao = loteDao;
    }

    public List<OrdenCompra> obtenerTodas() {
        return ordenCompraDao.obtenerTodos();
    }


    public OrdenCompra obtenerPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El id de la orden de compra es obligatorio");
        }

        OrdenCompra ordenCompra = ordenCompraDao.obtener(id);
        if (ordenCompra == null) {
            return null;
        }

        ordenCompra.setLotes(loteDao.listarPorOrdenCompra(id));
        return ordenCompra;
    }

  
    public Long crear(OrdenCompraDTO dto) {
        validarOrden(dto);
        validarLotesObligatorios(dto.getLotes());

        OrdenCompra ordenCompra = mapearOrden(dto);
        List<Lote> lotes = mapearLotes(dto.getLotes());

        Long id = ordenCompraDao.crearConLotes(ordenCompra, lotes);
        if (id == null) {
            throw new RuntimeException("No se pudo generar el ID de la orden de compra");
        }

        return id;
    }

    public void actualizar(Long id, OrdenCompraDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("El id de la orden de compra es obligatorio");
        }

        if (ordenCompraDao.obtener(id) == null) {
            throw new NoSuchElementException("Orden de compra no encontrada");
        }

        validarOrden(dto);
        validarLotesDeLaActualizacion(id, dto.getLotes());

        OrdenCompra ordenCompra = mapearOrden(dto);
        ordenCompra.setId(id);

        if (dto.getLotes() != null) {
            ordenCompraDao.actualizarConLotes(ordenCompra, mapearLotes(dto.getLotes()));
        } else {
            ordenCompraDao.modificar(ordenCompra);
        }
    }

  
    public void eliminar(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El id de la orden de compra es obligatorio");
        }

        if (ordenCompraDao.obtener(id) == null) {
            throw new NoSuchElementException("Orden de compra no encontrada");
        }

        ordenCompraDao.eliminarConLotes(id);
    }



    private void validarOrden(OrdenCompraDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Los datos de la orden de compra son obligatorios");
        }

        if (dto.getTotal() == null || dto.getTotal() <= 0) {
            throw new IllegalArgumentException("El total de la orden de compra debe ser mayor a 0");
        }

        if (dto.getFecha() == null || dto.getFecha().isBlank()) {
            throw new IllegalArgumentException("La fecha de la orden de compra es obligatoria");
        }

        parsearFecha(dto.getFecha(), "La fecha de la orden de compra");

        if (dto.getProveedorId() == null) {
            throw new IllegalArgumentException("El proveedor de la orden de compra es obligatorio");
        }
    }

    private OrdenCompra mapearOrden(OrdenCompraDTO dto) {
        Proveedor proveedor = proveedorDao.obtener(dto.getProveedorId());
        if (proveedor == null) {
            throw new IllegalArgumentException("El proveedor indicado no existe");
        }

        OrdenCompra ordenCompra = new OrdenCompra();
        ordenCompra.setTotal(dto.getTotal());
        ordenCompra.setFecha(parsearFecha(dto.getFecha(), "La fecha de la orden de compra"));
        ordenCompra.setProveedor(proveedor);

        return ordenCompra;
    }

    private void validarLotesDeLaActualizacion(Long id, List<LoteDTO> lotes) {
        if (lotes != null) {
            validarLotesObligatorios(lotes);
            return;
        }

        if (loteDao.listarPorOrdenCompra(id).isEmpty()) {
            throw new IllegalArgumentException("La orden de compra debe tener al menos un lote");
        }
    }

    private void validarLotesObligatorios(List<LoteDTO> lotes) {
        if (lotes == null || lotes.isEmpty()) {
            throw new IllegalArgumentException("La orden de compra debe tener al menos un lote");
        }
    }

    private List<Lote> mapearLotes(List<LoteDTO> lotesDto) {
        List<Lote> lotes = new ArrayList<>();

        if (lotesDto == null) {
            return lotes;
        }

        for (int i = 0; i < lotesDto.size(); i++) {
            LoteDTO loteDto = lotesDto.get(i);
            int posicion = i + 1;

            if (loteDto == null) {
                throw new IllegalArgumentException("El lote " + posicion + " es obligatorio");
            }

            if (loteDto.getProductoId() == null) {
                throw new IllegalArgumentException("El producto del lote " + posicion + " es obligatorio");
            }

            if (loteDto.getCantidad() != null && loteDto.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad del lote " + posicion + " debe ser mayor a 0");
            }

            Lote lote = new Lote();
            lote.setCantidad(loteDto.getCantidad());
            lote.setFechaArribo(parsearFecha(loteDto.getFechaArribo(),
                    "La fecha de arribo del lote " + posicion));
            lote.setFechaVencimiento(parsearFecha(loteDto.getFechaVencimiento(),
                    "La fecha de vencimiento del lote " + posicion));

            Producto producto = new Producto();
            producto.setId(loteDto.getProductoId());
            lote.setProducto(producto);

            lotes.add(lote);
        }

        return lotes;
    }

    private Date parsearFecha(String fecha, String campo) {
        if (fecha == null || fecha.isBlank()) {
            throw new IllegalArgumentException(campo + " es obligatoria");
        }

        try {
            return Date.valueOf(fecha.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(campo + " debe tener el formato " + FORMATO_FECHA);
        }
    }
}
