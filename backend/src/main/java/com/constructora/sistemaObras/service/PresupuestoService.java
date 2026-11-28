package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.EstatusPresupuesto;
import com.constructora.sistemaObras.entity.Obra;
import com.constructora.sistemaObras.entity.Presupuesto;
import com.constructora.sistemaObras.repository.ObraRepository;
import com.constructora.sistemaObras.repository.PresupuestoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PresupuestoService {

    private final PresupuestoRepository presupuestoRepository;
    private final ObraRepository obraRepository;

    public PresupuestoService(PresupuestoRepository presupuestoRepository, ObraRepository obraRepository) {
        this.presupuestoRepository = presupuestoRepository;
        this.obraRepository = obraRepository;
    }

    public List<Presupuesto> listarTodos() {
        return presupuestoRepository.findAll();
    }

    public List<Presupuesto> listarPorObra(Integer idObra) {
        return presupuestoRepository.findByObraIdObra(idObra);
    }

    public Presupuesto obtenerPorId(Integer id) {
        return presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado con ID: " + id));
    }



    @Transactional
    public Presupuesto crearPresupuesto(Integer idObra, Presupuesto presupuesto) {
        Obra obra = obraRepository.findById(idObra)
                .orElseThrow(() -> new RuntimeException("Obra no encontrada con ID: " + idObra));

        if (!presupuestoRepository.findByObraIdObra(idObra).isEmpty()) {
            throw new IllegalStateException("Esta obra ya cuenta con un presupuesto asignado (relación 1 a 1).");
        }

        if (presupuesto.getMontoTotal() == null || presupuesto.getMontoTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto total del presupuesto debe ser mayor a cero.");
        }

        presupuesto.setObra(obra);
        if (presupuesto.getEstatus() == null) {
            presupuesto.setEstatus(EstatusPresupuesto.BORRADOR);
        }
        return presupuestoRepository.save(presupuesto);
    }
}