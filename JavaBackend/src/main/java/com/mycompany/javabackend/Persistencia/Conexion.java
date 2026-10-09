package com.mycompany.javabackend.Persistencia;

import io.github.cdimascio.dotenv.Dotenv;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    private static Conexion INSTANCE = null;
    private Connection connection;
    private final String url;
    private final String user;
    private final String password;
    private final String driver;

    private Conexion() {
        Dotenv dotenv = Dotenv.load();
        this.url = dotenv.get("DB_URL");
        this.user = dotenv.get("DB_USER");
        this.password = dotenv.get("DB_PASSWORD");
        this.driver = dotenv.get("DB_DRIVER");

        try {
            Class.forName(this.driver);
        } catch (ClassNotFoundException e) {
            System.err.println("No se encontró el driver JDBC: " + e.getMessage());
        }
    }

    public static synchronized Conexion getInstance() {
        if (INSTANCE == null) {
            INSTANCE = new Conexion();
        }
        return INSTANCE;
    }

    public Connection getConnection() {
        try {
            if (this.connection == null || this.connection.isClosed()) {
                this.connection = DriverManager.getConnection(this.url, this.user, this.password);
            }
        } catch (SQLException e) {
            System.err.println("Error al conectar a la BD: " + e.getMessage());
        }
        return this.connection;
    }

    public void cerrarConexion() {
        try {
            if (this.connection != null && !this.connection.isClosed()) {
                this.connection.close();
            }
        } catch (SQLException e) {
            System.err.println("Error al cerrar conexión: " + e.getMessage());
        }
    }
}