package com.constructora.sistemaObras.repository;

import com.constructora.sistemaObras.entity.EstatusAprobacion;
import com.constructora.sistemaObras.entity.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Integer> {
    List<Gasto> findByPresupuestoIdPresupuesto(Integer idPresupuesto);
    List<Gasto> findByEstatusAprobacion(EstatusAprobacion estatusAprobacion);
    List<Gasto> findByPresupuestoObraIdObra(Integer idObra);
}