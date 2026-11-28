package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.Rol;
import com.constructora.sistemaObras.entity.Usuario;
import com.constructora.sistemaObras.repository.RolRepository;
import com.constructora.sistemaObras.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    public Usuario autenticar(String correo, String password) {
        if (correo == null || correo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo es obligatorio.");
        }

        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "No existe ningún usuario con ese correo."
                ));

        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario está inactivo.");
        }

        if (password != null && !password.isBlank() && usuario.getPassword() != null
                && !usuario.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta.");
        }

        return usuario;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findByIsActivoTrue();
    }

    @Transactional
    public Usuario guardar(Usuario usuario) {
        if (usuario == null || usuario.getRol() == null || usuario.getRol().getIdRol() == null) {
            throw new IllegalArgumentException("El rol del usuario es obligatorio.");
        }

        Rol rol = rolRepository.findById(usuario.getRol().getIdRol())
                .orElseThrow(() -> new IllegalArgumentException("El rol especificado no existe."));

        if (usuario.getCorreo() == null || usuario.getCorreo().isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio.");
        }
        String correoLimpio = usuario.getCorreo().trim();
        if (usuarioRepository.existsByCorreoIgnoreCase(correoLimpio)) {
            throw new IllegalStateException("Ya existe un usuario registrado con ese correo.");
        }

        if (usuario.getRfc() == null || usuario.getRfc().trim().length() != 13) {
            throw new IllegalArgumentException("El RFC debe contener exactamente 13 caracteres.");
        }
        String rfcLimpio = usuario.getRfc().trim().toUpperCase();
        if (usuarioRepository.existsByRfcIgnoreCase(rfcLimpio)) {
            throw new IllegalStateException("Ya existe un usuario registrado con ese RFC.");
        }

        usuario.setRol(rol);
        usuario.setCorreo(correoLimpio);
        usuario.setRfc(rfcLimpio);
        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            usuario.setPassword("Constructora2026*");
        }
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }

        return usuarioRepository.save(usuario);
    }
}