package com.mycompany.javabackend.Logica.Clases;

import java.sql.Date;
import Logica.Clases.Producto;

public class Carrito extends Venta {

    public Carrito() {
        super();
    }

    public Carrito(Long id, Date fecha, double total) {
        super(id, fecha, total);
    }

    public void agregarProducto(Producto producto) {
        this.getProductos().add(producto);
        this.calcularTotal();
    }

    public void vaciar() {
        this.getProductos().clear();
        this.setTotal(0.0);
    }

    public void calcularTotal() {
        double suma = 0;
        for (Producto p : this.getProductos()) {
            suma += p.getPrecioVenta(); // Utiliza atributo de Producto del diagrama
        }
        this.setTotal(suma);
    }

}
