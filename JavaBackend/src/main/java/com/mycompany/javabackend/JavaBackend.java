package com.mycompany.javabackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JavaBackend {

    public static void main(String[] args) {
        System.setProperty("server.port", "8080"); // cambiar el port
        SpringApplication.run(JavaBackend.class, args);
    }
}
