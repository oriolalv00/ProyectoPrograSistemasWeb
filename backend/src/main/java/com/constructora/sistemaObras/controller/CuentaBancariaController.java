package com.constructora.sistemaObras.controller;

import com.constructora.sistemaObras.entity.CuentaBancaria;
import com.constructora.sistemaObras.service.CuentaBancariaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuentas-bancarias")
@CrossOrigin(origins = "*")
public class CuentaBancariaController {

    private final CuentaBancariaService cuentaBancariaService;

    public CuentaBancariaController(CuentaBancariaService cuentaBancariaService) {
        this.cuentaBancariaService = cuentaBancariaService;
    }

    @GetMapping
    public ResponseEntity<List<CuentaBancaria>> listar() {
        return ResponseEntity.ok(cuentaBancariaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<CuentaBancaria> crear(@RequestBody CuentaBancaria cuenta) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cuentaBancariaService.guardar(cuenta));
    }
}