package com.constructora.sistemaObras.repository;

import com.constructora.sistemaObras.entity.EstatusPresupuesto;
import com.constructora.sistemaObras.entity.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresupuestoRepository extends JpaRepository<Presupuesto, Integer> {
    List<Presupuesto> findByObraIdObra(Integer idObra);
    List<Presupuesto> findByEstatus(EstatusPresupuesto estatus);
}