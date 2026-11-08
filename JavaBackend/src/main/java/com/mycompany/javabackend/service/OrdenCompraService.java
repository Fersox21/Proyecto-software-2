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

    /**
     * Constructor sin argumentos: es el que usa Spring para crear el bean y el
     * que permite que el controller instancie el service con "new", igual que
     * ProductoService y PedidoService.
     */
    @Autowired
    public OrdenCompraService() {
        this(new OrdenCompraDao(), new ProveedorDao(), new LoteDao());
    }

    /**
     * Constructor con DAO inyectables, pensado para los tests.
     */
    public OrdenCompraService(OrdenCompraDao ordenCompraDao, ProveedorDao proveedorDao, LoteDao loteDao) {
        this.ordenCompraDao = ordenCompraDao;
        this.proveedorDao = proveedorDao;
        this.loteDao = loteDao;
    }

    public List<OrdenCompra> obtenerTodas() {
        return ordenCompraDao.obtenerTodos();
    }

    /**
     * Devuelve la orden con sus lotes, o null si no existe.
     */
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

    /**
     * Valida, mapea y guarda la orden junto con sus lotes.
     *
     * @return id generado para la orden.
     */
    public Long crear(OrdenCompraDTO dto) {
        validarOrden(dto);

        OrdenCompra ordenCompra = mapearOrden(dto);
        List<Lote> lotes = mapearLotes(dto.getLotes());

        Long id = ordenCompraDao.crearConLotes(ordenCompra, lotes);
        if (id == null) {
            throw new RuntimeException("No se pudo generar el ID de la orden de compra");
        }

        return id;
    }

    /**
     * Actualiza la cabecera de la orden. Si el DTO trae el campo "lotes", el
     * conjunto de lotes se reemplaza por completo; si no lo trae, se conservan.
     */
    public void actualizar(Long id, OrdenCompraDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("El id de la orden de compra es obligatorio");
        }

        if (ordenCompraDao.obtener(id) == null) {
            throw new NoSuchElementException("Orden de compra no encontrada");
        }

        validarOrden(dto);

        OrdenCompra ordenCompra = mapearOrden(dto);
        ordenCompra.setId(id);

        if (dto.getLotes() != null) {
            ordenCompraDao.actualizarConLotes(ordenCompra, mapearLotes(dto.getLotes()));
        } else {
            ordenCompraDao.modificar(ordenCompra);
        }
    }

    /**
     * Elimina la orden y sus lotes en cascada.
     */
    public void eliminar(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El id de la orden de compra es obligatorio");
        }

        if (ordenCompraDao.obtener(id) == null) {
            throw new NoSuchElementException("Orden de compra no encontrada");
        }

        ordenCompraDao.eliminarConLotes(id);
    }

    // ------------------------------------------------------------------
    // Validaciones y mapeo
    // ------------------------------------------------------------------

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
