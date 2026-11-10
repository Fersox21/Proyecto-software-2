package com.mycompany.javabackend.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import com.mycompany.javabackend.dto.VentasDTO;
import com.mycompany.javabackend.Logica.Clases.Pedido;
import com.mycompany.javabackend.Logica.Clases.Tiene;
import com.mycompany.javabackend.Logica.Clases.Venta;
import com.mycompany.javabackend.Persistencia.ClasesDAO.ProductoDao;
import com.mycompany.javabackend.Persistencia.ClasesDAO.TieneDao;
import com.mycompany.javabackend.Persistencia.ClasesDAO.VentaDao;

public class VentasService {
    private final VentaDao ventaDao = new VentaDao();

    public List<VentasDTO> obtenerTodo() {
        return ventaDao.obtenerTodos().stream()
                .map(this::convertirAVentaDTO)
                .collect(Collectors.toList());
    }

    public VentasDTO obtenerPorId(Long id) {
        Venta venta = ventaDao.obtener(id);
        if (venta == null) {
            return null;
        }
        return convertirAVentaDTO(venta);
    }

    public List<Tiene> obtenerProductosPorVenta(Long id) {
        Venta venta = ventaDao.obtener(id);
        if (venta == null || venta.getPedido() == null) {
            return List.of();
        }
        List<Tiene> items = new TieneDao().obtenerPorVenta(venta.getPedido().getId());
        ProductoDao productoDao = new ProductoDao();
        for (Tiene item : items) {
            if (item.getProducto() != null) {
                item.setProducto(productoDao.obtener(item.getProducto().getId()));
            }
        }
        return items;
    }

    public void crearVenta(VentasDTO venta) {
        validarVenta(venta); //aca puede saltar el illega argument
        Venta nuevaVenta = convertirDtoAVenta(venta);
        ventaDao.agregar(nuevaVenta);
    }

    public void actualizarVenta(Long id, VentasDTO venta) {
        if (ventaDao.obtener(id) == null) {
            throw new NoSuchElementException("La venta con ID " + id + " no existe");
        }

        validarVenta(venta);
        Venta ventaExistente = convertirDtoAVenta(venta);
        ventaExistente.setId(id);
        ventaDao.modificar(ventaExistente);
    }

    public void eliminarVenta(Long id) {
        if (ventaDao.obtener(id) == null) {
            throw new NoSuchElementException("La venta con ID " + id + " no existe");
        }
        ventaDao.eliminar(id);
    }

    private VentasDTO convertirAVentaDTO(Venta venta) {
        Long pedidoId = (venta.getPedido() != null) ? venta.getPedido().getId() : null;

        return new VentasDTO(
            venta.getId(), venta.getFecha(), venta.getTotal(), venta.isActivo(), pedidoId
        );
    }

    private void validarVenta(VentasDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Los datos de la venta son obligatorios");
        }
        if (dto.getFecha() == null) {
            throw new IllegalArgumentException("La fecha de la venta es obligatoria");
        }
        if (dto.getTotal() == null || dto.getTotal() <= 0) {
            throw new IllegalArgumentException("El total de la venta debe ser mayor a 0");
        }
        if (dto.getPedidoId() == null || dto.getPedidoId() <= 0) {
            throw new IllegalArgumentException("El pedido asociado es obligatorio");
        }
    }

    private Venta convertirDtoAVenta(VentasDTO dto) {
        Pedido pedido = new Pedido();
        pedido.setId((long) dto.getPedidoId());
        return new Venta(
            null,
            dto.getFecha(),
            dto.getTotal(),
            dto.isEstado(),
            pedido
        );
    }
}
