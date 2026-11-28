package com.constructora.sistemaObras.repository;

import com.constructora.sistemaObras.entity.CuentaBancaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuentaBancariaRepository extends JpaRepository<CuentaBancaria, Integer> {
    List<CuentaBancaria> findByIsActivaTrue();
    boolean existsByNumeroCuenta(String numeroCuenta);
}
