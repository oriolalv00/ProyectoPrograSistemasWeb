package com.constructora.sistemaObras.repository;

import com.constructora.sistemaObras.entity.EstatusIngreso;
import com.constructora.sistemaObras.entity.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Integer> {
    List<Ingreso> findByPresupuestoIdPresupuesto(Integer idPresupuesto);
    List<Ingreso> findByCuentaBancariaIdCuenta(Integer idCuenta);
    List<Ingreso> findByEstatus(EstatusIngreso estatus);
}