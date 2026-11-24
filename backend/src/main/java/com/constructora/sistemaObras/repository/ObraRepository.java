package com.constructora.sistemaObras.repository;

import com.constructora.sistemaObras.entity.EstadoObra;
import com.constructora.sistemaObras.entity.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObraRepository extends JpaRepository<Obra, Integer> {
    List<Obra> findByEstatus(EstadoObra estatus);
}