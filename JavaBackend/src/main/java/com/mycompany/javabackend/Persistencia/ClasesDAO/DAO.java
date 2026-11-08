package com.mycompany.javabackend.Persistencia.ClasesDAO;

import java.util.List;

public interface DAO<Type> {

    void agregar(Type c);

    void modificar(Type c);

    void eliminar(Long id);

    Type obtener(Long id);

    List<Type> obtenerTodos();

    List<Type> obtenerTodosIncluyendoInactivos();
}