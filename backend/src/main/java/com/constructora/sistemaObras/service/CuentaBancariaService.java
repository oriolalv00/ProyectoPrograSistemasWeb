package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.CuentaBancaria;
import com.constructora.sistemaObras.repository.CuentaBancariaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CuentaBancariaService {

    private final CuentaBancariaRepository cuentaBancariaRepository;

    public CuentaBancariaService(CuentaBancariaRepository cuentaBancariaRepository) {
        this.cuentaBancariaRepository = cuentaBancariaRepository;
    }

    public List<CuentaBancaria> listarTodas() {
        return cuentaBancariaRepository.findAll();
    }

    public CuentaBancaria guardar(CuentaBancaria cuenta) {
        if (cuenta == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los datos de la cuenta son obligatorios.");
        }

        if (cuenta.getNombreBanco() != null) {
            cuenta.setNombreBanco(cuenta.getNombreBanco().trim());
        }

        if (cuenta.getNumeroCuenta() != null) {
            cuenta.setNumeroCuenta(cuenta.getNumeroCuenta().trim());
        }

        if (cuenta.getIsActiva() == null) {
            cuenta.setIsActiva(true);
        }

        return cuentaBancariaRepository.save(cuenta);
    }
}