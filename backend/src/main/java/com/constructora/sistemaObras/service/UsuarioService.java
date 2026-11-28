package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.Rol;
import com.constructora.sistemaObras.entity.Usuario;
import com.constructora.sistemaObras.repository.RolRepository;
import com.constructora.sistemaObras.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    public List<Usuario> listarActivos() {
        return usuarioRepository.findByActivoTrue();
    }

    public Usuario autenticarPorCorreo(String correo) {
        if (correo == null || correo.isBlank()) {
            throw new IllegalArgumentException("Debes ingresar un correo electrónico.");
        }

        Usuario usuario = usuarioRepository.findByCorreo(correo.trim())
                .orElseThrow(() -> new IllegalArgumentException("No existe ningún usuario registrado con ese correo."));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new IllegalStateException("Esta cuenta de usuario se encuentra desactivada.");
        }

        return usuario;
    }

    @Transactional
    public Usuario registrarUsuario(Integer idRol, Usuario usuario) {
        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + idRol));

        if (usuario.getCorreo() == null || usuario.getCorreo().isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio.");
        }
        if (usuarioRepository.existsByCorreo(usuario.getCorreo().trim())) {
            throw new IllegalStateException("Ya existe un usuario registrado con ese correo.");
        }
        if (usuario.getRfc() == null || usuario.getRfc().trim().length() != 13) {
            throw new IllegalArgumentException("El RFC debe contener exactamente 13 caracteres.");
        }
        if (usuarioRepository.existsByRfc(usuario.getRfc().trim().toUpperCase())) {
            throw new IllegalStateException("Ya existe un usuario registrado con ese RFC.");
        }

        usuario.setRol(rol);
        usuario.setRfc(usuario.getRfc().trim().toUpperCase());
        usuario.setCorreo(usuario.getCorreo().trim());
        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            usuario.setPassword("Constructora2026*");
        }
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }

        return usuarioRepository.save(usuario);
    }
}