package com.constructora.sistemaObras.service;

import com.constructora.sistemaObras.entity.Rol;
import com.constructora.sistemaObras.entity.Usuario;
import com.constructora.sistemaObras.repository.RolRepository;
import com.constructora.sistemaObras.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
        return usuarioRepository.findAll();
    }

    public Usuario guardar(Usuario usuario) {
        if (usuario.getRol() != null && usuario.getRol().getIdRol() != null) {
            Rol rol = rolRepository.findById(usuario.getRol().getIdRol())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "El rol especificado no existe."
                    ));
            usuario.setRol(rol);
        }

        if (usuario.getRfc() != null) {
            usuario.setRfc(usuario.getRfc().trim().toUpperCase());
        }

        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }

        return usuarioRepository.save(usuario);
    }
}