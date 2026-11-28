package com.constructora.sistemaObras.controller;

import com.constructora.sistemaObras.entity.Presupuesto;
import com.constructora.sistemaObras.service.PresupuestoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presupuestos")
@CrossOrigin(origins = "*")
public class PresupuestoController {

    private final PresupuestoService presupuestoService;

    public PresupuestoController(PresupuestoService presupuestoService) {
        this.presupuestoService = presupuestoService;
    }

    @GetMapping
    public ResponseEntity<List<Presupuesto>> listar() {
        return ResponseEntity.ok(presupuestoService.listarTodos());
    }

    @PostMapping("/obra/{idObra}")
    public ResponseEntity<Presupuesto> crearPorObra(@PathVariable Integer idObra, @RequestBody Presupuesto presupuesto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presupuestoService.crearPresupuesto(idObra, presupuesto));
    }
}