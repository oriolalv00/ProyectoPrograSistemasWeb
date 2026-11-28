package com.constructora.sistemaObras.controller;

import com.constructora.sistemaObras.entity.Usuario;
import com.constructora.sistemaObras.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody Map<String, String> credenciales) {
        String correo = credenciales.get("correo");
        String password = credenciales.get("password");
        Usuario usuario = usuarioService.autenticar(correo, password);
        return ResponseEntity.ok(usuario);
    }
}