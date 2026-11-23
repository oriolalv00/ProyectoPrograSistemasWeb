package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.EstatusAprobacion;
import com.constructora.sistemaObras.entity.Gasto;
import com.constructora.sistemaObras.entity.Presupuesto;
import com.constructora.sistemaObras.repository.GastoRepository;
import com.constructora.sistemaObras.repository.PresupuestoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;
    private final PresupuestoRepository presupuestoRepository;

    public GastoService(GastoRepository gastoRepository, PresupuestoRepository presupuestoRepository) {
        this.gastoRepository = gastoRepository;
        this.presupuestoRepository = presupuestoRepository;
    }

    public List<Gasto> listarTodos() {
        return gastoRepository.findAll();
    }

    public List<Gasto> listarPorPresupuesto(Integer idPresupuesto) {
        return gastoRepository.findByPresupuestoIdPresupuesto(idPresupuesto);
    }

    public List<Gasto> listarPorEstatus(EstatusAprobacion estatus) {
        return gastoRepository.findByEstatusAprobacion(estatus);
    }

    @Transactional
    public Gasto registrarGasto(Integer idPresupuesto, Gasto gasto) {
        Presupuesto presupuesto = presupuestoRepository.findById(idPresupuesto)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado con ID: " + idPresupuesto));

        if (gasto.getMonto() == null || gasto.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto del gasto debe ser mayor a cero.");
        }

        gasto.setPresupuesto(presupuesto);
        gasto.setEstatusAprobacion(EstatusAprobacion.PENDIENTE);
        return gastoRepository.save(gasto);
    }

    @Transactional
    public Gasto aprobarGasto(Integer idGasto) {
        Gasto gasto = gastoRepository.findById(idGasto)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado con ID: " + idGasto));

        if (gasto.getEstatusAprobacion() != EstatusAprobacion.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden aprobar gastos en estado PENDIENTE.");
        }

        Presupuesto presupuesto = gasto.getPresupuesto();

        BigDecimal ejercidoActual = gastoRepository
                .findByPresupuestoIdPresupuesto(presupuesto.getIdPresupuesto())
                .stream()
                .filter(g -> g.getEstatusAprobacion() == EstatusAprobacion.APROBADO)
                .map(Gasto::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal nuevoEjercido = ejercidoActual.add(gasto.getMonto());

        if (nuevoEjercido.compareTo(presupuesto.getMontoTotal()) > 0) {
            throw new IllegalStateException("El gasto excede el saldo disponible del presupuesto.");
        }

        gasto.setEstatusAprobacion(EstatusAprobacion.APROBADO);
        return gastoRepository.save(gasto);
    }

    @Transactional
    public Gasto rechazarGasto(Integer idGasto) {
        Gasto gasto = gastoRepository.findById(idGasto)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado con ID: " + idGasto));

        if (gasto.getEstatusAprobacion() != EstatusAprobacion.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden rechazar gastos en estado PENDIENTE.");
        }

        gasto.setEstatusAprobacion(EstatusAprobacion.RECHAZADO);
        return gastoRepository.save(gasto);
    }
}
