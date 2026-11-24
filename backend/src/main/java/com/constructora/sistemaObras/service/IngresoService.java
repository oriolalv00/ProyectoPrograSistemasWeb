package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.CuentaBancaria;
import com.constructora.sistemaObras.entity.EstatusIngreso;
import com.constructora.sistemaObras.entity.Ingreso;
import com.constructora.sistemaObras.entity.Presupuesto;
import com.constructora.sistemaObras.repository.CuentaBancariaRepository;
import com.constructora.sistemaObras.repository.IngresoRepository;
import com.constructora.sistemaObras.repository.PresupuestoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class IngresoService {

    private final IngresoRepository ingresoRepository;
    private final PresupuestoRepository presupuestoRepository;
    private final CuentaBancariaRepository cuentaBancariaRepository;

    public IngresoService(IngresoRepository ingresoRepository,
                          PresupuestoRepository presupuestoRepository,
                          CuentaBancariaRepository cuentaBancariaRepository) {
        this.ingresoRepository = ingresoRepository;
        this.presupuestoRepository = presupuestoRepository;
        this.cuentaBancariaRepository = cuentaBancariaRepository;
    }

    public List<Ingreso> listarTodos() {
        return ingresoRepository.findAll();
    }

    public List<Ingreso> listarPorPresupuesto(Integer idPresupuesto) {
        return ingresoRepository.findByPresupuestoIdPresupuesto(idPresupuesto);
    }

    @Transactional
    public Ingreso registrarIngreso(Integer idPresupuesto, Integer idCuenta, Ingreso ingreso) {
        Presupuesto presupuesto = presupuestoRepository.findById(idPresupuesto)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado con ID: " + idPresupuesto));

        CuentaBancaria cuenta = cuentaBancariaRepository.findById(idCuenta)
                .orElseThrow(() -> new RuntimeException("Cuenta bancaria no encontrada con ID: " + idCuenta));

        if (ingreso.getMonto() == null || ingreso.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto del ingreso debe ser mayor a cero.");
        }

        ingreso.setPresupuesto(presupuesto);
        ingreso.setCuentaBancaria(cuenta);
        ingreso.setEstatus(EstatusIngreso.PENDIENTE);
        return ingresoRepository.save(ingreso);
    }

    @Transactional
    public Ingreso cambiarEstatus(Integer idIngreso, EstatusIngreso nuevoEstatus) {
        Ingreso ingreso = ingresoRepository.findById(idIngreso)
                .orElseThrow(() -> new RuntimeException("Ingreso no encontrado con ID: " + idIngreso));
        ingreso.setEstatus(nuevoEstatus);
        return ingresoRepository.save(ingreso);
    }
}