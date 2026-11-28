package com.constructora.sistemaObras.controller;

import com.constructora.sistemaObras.entity.Ingreso;
import com.constructora.sistemaObras.service.IngresoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingresos")
@CrossOrigin(origins = "*")
public class IngresoController {

    private final IngresoService ingresoService;

    public IngresoController(IngresoService ingresoService) {
        this.ingresoService = ingresoService;
    }

    @GetMapping
    public ResponseEntity<List<Ingreso>> listar() {
        return ResponseEntity.ok(ingresoService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<?> crear(
            @RequestParam Integer idPresupuesto,
            @RequestParam Integer idCuenta,
            @RequestBody Ingreso ingreso
    ) {
        Object resultado = ingresoService.registrarIngreso(idPresupuesto, idCuenta, ingreso);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    @PatchMapping("/{id}/estatus")
    public ResponseEntity<?> actualizarEstatus(@PathVariable Integer id, @RequestParam String estatus) {
        Object resultado = ingresoService.actualizarEstatus(id, estatus);
        return ResponseEntity.ok(resultado);
    }
}