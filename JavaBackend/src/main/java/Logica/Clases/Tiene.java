package Logica.Clases;

public class Tiene {
    private Long id;
    private int cantidad;
    private double precio;
    private Producto producto;
    private Venta venta;

    public Tiene() {
    }

    public Tiene(Long id, int cantidad, double precio, Producto producto, Venta venta) {
        this.id = id;
        this.cantidad = cantidad;
        this.precio = precio;
        this.producto = producto;
        this.venta = venta;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Venta getVenta() {
        return venta;
    }

    public void setVenta(Venta venta) {
        this.venta = venta;
    }

    @Override
    public String toString() {
        return "Tiene [cantidad=" + cantidad + ", precio=" + precio + ", producto=" + producto + ", venta=" + venta
                + "]";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
