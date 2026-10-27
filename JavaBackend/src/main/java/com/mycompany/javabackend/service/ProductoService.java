package com.mycompany.javabackend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.mycompany.javabackend.Logica.Clases.Producto;
import com.mycompany.javabackend.Persistencia.ClasesDAO.ProductoDao;
import com.mycompany.javabackend.dto.ProductoAdminDto;
import com.mycompany.javabackend.dto.ProductoDto;

@Service
public class ProductoService {

    private final ProductoDao productoDao = new ProductoDao();

    public void procesarYGuardarProducto(Producto producto) {
        this.productoDao.agregar(producto);
    }

    public List<Producto> obtenerTodosLosProductos() {
        return this.productoDao.obtenerTodos();
    }

    public Producto obtenerPorId(Long id) {
        return this.productoDao.obtener(id);
    }

    // Para el catálogo público
    public List<ProductoDto> obtenerCatalogoPublico() {
        List<Producto> productosCrudos = productoDao.obtenerTodos();

        return productosCrudos.stream().map(producto -> {
            ProductoDto productoDto = new ProductoDto();
            productoDto.setId(producto.getId());
            productoDto.setNombre(producto.getNombre());
            productoDto.setPrecioVenta(producto.getPrecioVenta());
            productoDto.setMarca(producto.getMarca());
            productoDto.setEnPromocion(producto.isEnPromocion());
            productoDto.setPrecioPromo(producto.getPrecioPromo());
            productoDto.setStock(producto.getStock());
            productoDto.setCategoria(producto.getCategoria());
            productoDto.setPeso(producto.getPeso());
            productoDto.setDestacado(producto.isDestacado());

            return productoDto;
        }).collect(Collectors.toList());
    }

    // Para el panel de administración
    public List<ProductoAdminDto> obtenerProductosParaAdmin() {
        List<Producto> productosCrudos = productoDao.obtenerTodos();

        return productosCrudos.stream().map(producto -> {
            ProductoAdminDto productoDto = new ProductoAdminDto();
            productoDto.setId(producto.getId());
            productoDto.setNombre(producto.getNombre());
            productoDto.setPrecioCosto(producto.getPrecioCosto());
            productoDto.setPrecioVenta(producto.getPrecioVenta());
            productoDto.setMarca(producto.getMarca());
            productoDto.setEnPromocion(producto.isEnPromocion());
            productoDto.setPrecioPromo(producto.getPrecioPromo());
            productoDto.setStock(producto.getStock());
            productoDto.setCategoria(producto.getCategoria());
            productoDto.setPeso(producto.getPeso());
            productoDto.setDestacado(producto.isDestacado());

            return productoDto;
        }).collect(Collectors.toList());
    }
}