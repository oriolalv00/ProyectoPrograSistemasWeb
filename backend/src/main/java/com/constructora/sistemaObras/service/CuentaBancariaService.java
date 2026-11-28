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

    public List<CuentaBancaria> listarTodas() {
        return cuentaBancariaRepository.findByIsActivaTrue();
    }

    @Transactional
    public CuentaBancaria guardar(CuentaBancaria cuenta) {
        if (cuenta == null || cuenta.getNombreBanco() == null || cuenta.getNombreBanco().isBlank()) {
            throw new IllegalArgumentException("El nombre del banco es obligatorio.");
        }
        if (cuenta.getNumeroCuenta() == null || cuenta.getNumeroCuenta().isBlank()) {
            throw new IllegalArgumentException("El número de cuenta es obligatorio.");
        }

        String numeroLimpio = cuenta.getNumeroCuenta().trim();
        if (cuentaBancariaRepository.existsByNumeroCuenta(numeroLimpio)) {
            throw new IllegalStateException("Ya existe una cuenta registrada con ese número.");
        }

        cuenta.setNombreBanco(cuenta.getNombreBanco().trim());
        cuenta.setNumeroCuenta(numeroLimpio);
        if (cuenta.getIsActiva() == null) {
            cuenta.setIsActiva(true);
        }

        return cuentaBancariaRepository.save(cuenta);
    }
}