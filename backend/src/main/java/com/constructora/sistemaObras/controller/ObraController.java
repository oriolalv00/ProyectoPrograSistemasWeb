package com.constructora.sistemaObras.controller;

import com.constructora.sistemaObras.entity.EstadoObra;
import com.constructora.sistemaObras.entity.Obra;
import com.constructora.sistemaObras.service.ObraService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/obras")
@CrossOrigin(origins = "*")
public class ObraController {

    private final ObraService obraService;

    public ObraController(ObraService obraService) {
        this.obraService = obraService;
    }

    @GetMapping
    public ResponseEntity<List<Obra>> listar() {
        return ResponseEntity.ok(obraService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<Obra> crear(@RequestBody Obra obra) {
        return ResponseEntity.status(HttpStatus.CREATED).body(obraService.crearObra(obra));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Obra> cambiarEstado(@PathVariable Integer id, @RequestParam EstadoObra estado) {
        return ResponseEntity.ok(obraService.cambiarEstado(id, estado));
    }
}