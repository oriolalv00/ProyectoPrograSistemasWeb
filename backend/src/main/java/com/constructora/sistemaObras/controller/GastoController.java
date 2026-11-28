package com.constructora.sistemaObras.controller;

import com.constructora.sistemaObras.entity.Gasto;
import com.constructora.sistemaObras.service.GastoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = "*")
public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @GetMapping
    public ResponseEntity<List<Gasto>> listar() {
        return ResponseEntity.ok(gastoService.listarTodos());
    }

    @PostMapping("/presupuesto/{idPresupuesto}")
    public ResponseEntity<Gasto> crear(@PathVariable Integer idPresupuesto, @RequestBody Gasto gasto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoService.registrarGasto(idPresupuesto, gasto));
    }

    @PatchMapping("/{id}/aprobar")
    public ResponseEntity<Gasto> aprobar(@PathVariable Integer id) {
        return ResponseEntity.ok(gastoService.aprobarGasto(id));
    }

    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<Gasto> rechazar(@PathVariable Integer id) {
        return ResponseEntity.ok(gastoService.rechazarGasto(id));
    }
}