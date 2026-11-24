package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.EstadoObra;
import com.constructora.sistemaObras.entity.Obra;
import com.constructora.sistemaObras.repository.ObraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ObraService {

    private final ObraRepository obraRepository;

    public ObraService(ObraRepository obraRepository) {
        this.obraRepository = obraRepository;
    }

    public List<Obra> listarTodas() {
        return obraRepository.findAll();
    }

    public List<Obra> listarPorEstado(EstadoObra estatus) {
        return obraRepository.findByEstatus(estatus);
    }

    public Obra obtenerPorId(Integer id) {
        return obraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Obra no encontrada con ID: " + id));
    }

    @Transactional
    public Obra crearObra(Obra obra) {
        if (obra.getEstatus() == null) {
            obra.setEstatus(EstadoObra.ACTIVA);
        }
        return obraRepository.save(obra);
    }

    @Transactional
    public Obra cambiarEstado(Integer id, EstadoObra nuevoEstatus) {
        Obra obra = obtenerPorId(id);
        obra.setEstatus(nuevoEstatus);
        return obraRepository.save(obra);
    }
}