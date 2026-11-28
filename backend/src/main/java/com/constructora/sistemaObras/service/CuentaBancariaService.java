package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.CuentaBancaria;
import com.constructora.sistemaObras.repository.CuentaBancariaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CuentaBancariaService {

    private final CuentaBancariaRepository cuentaBancariaRepository;

    public CuentaBancariaService(CuentaBancariaRepository cuentaBancariaRepository) {
        this.cuentaBancariaRepository = cuentaBancariaRepository;
    }

    public List<CuentaBancaria> listarActivas() {
        return cuentaBancariaRepository.findByIsActivaTrue();
    }

    @Transactional
    public CuentaBancaria registrarCuenta(CuentaBancaria cuenta) {
        if (cuenta.getNombreBanco() == null || cuenta.getNombreBanco().isBlank()) {
            throw new IllegalArgumentException("El nombre del banco es obligatorio.");
        }
        if (cuenta.getNumeroCuenta() == null || cuenta.getNumeroCuenta().isBlank()) {
            throw new IllegalArgumentException("El número de cuenta es obligatorio.");
        }
        if (cuentaBancariaRepository.existsByNumeroCuenta(cuenta.getNumeroCuenta().trim())) {
            throw new IllegalStateException("Ya existe una cuenta registrada con ese número.");
        }

        cuenta.setNombreBanco(cuenta.getNombreBanco().trim());
        cuenta.setNumeroCuenta(cuenta.getNumeroCuenta().trim());
        if (cuenta.getIsActiva() == null) {
            cuenta.setIsActiva(true);
        }
        return cuentaBancariaRepository.save(cuenta);
    }
}