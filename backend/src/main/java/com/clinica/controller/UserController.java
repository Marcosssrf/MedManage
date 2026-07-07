package com.clinica.controller;

import com.clinica.dto.UserCreateDTO;
import com.clinica.dto.UserDTO;
import com.clinica.dto.resposta.MedicoConsultaDTO;
import com.clinica.dto.update.MeuPerfilUpdateDTO;
import com.clinica.dto.update.UserUpdateDTO;
import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.model.User;
import com.clinica.repository.UserRepository;
import com.clinica.security.JwtTokenService;
import com.clinica.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
public class UserController {

    @Autowired
    private UserService service;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtTokenService jwtTokenService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserDTO> insert(@RequestBody @Valid UserCreateDTO dto) {
        UserDTO criado = service.insert(dto);
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(criado.id())
                .toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> findAll(){
        List<UserDTO> usuarios = service.findAll();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Usuário não encontrado"));
        UserDTO dto = converterParaDTO(user);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/me")
    public ResponseEntity<Map<String, Object>> patchMe(Authentication authentication,
                                                       @RequestBody MeuPerfilUpdateDTO dto) {
        String usernameAtual = authentication.getName();
        UserDTO userAtualizado = service.patchMe(usernameAtual, dto);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("user", userAtualizado);

        // Se o username mudou, gera novo token com o username atualizado
        boolean usernameMudou = dto.username() != null
                && !dto.username().isBlank()
                && !dto.username().equals(usernameAtual);

        if (usernameMudou) {
            String novoToken = jwtTokenService.generateToken(userAtualizado.username());
            resposta.put("accessToken", novoToken);
            resposta.put("tokenType", "Bearer");
            resposta.put("expiresIn", jwtTokenService.getExpirationSeconds());
        }

        return ResponseEntity.ok(resposta);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> patch(@PathVariable UUID id, @RequestBody UserUpdateDTO dto) {
        return ResponseEntity.ok(service.patch(id, dto));
    }

    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private UserDTO converterParaDTO(User user) {
        MedicoConsultaDTO medicoDTO = null;

        // Só tenta mapear o médico se ele realmente existir para este usuário
        if (user.getMedico() != null) {
            medicoDTO = new MedicoConsultaDTO(
                    user.getMedico().getId(),
                    user.getMedico().getNome(),
                    user.getMedico().getCrm(),
                    user.getMedico().getEspecialidade()
            );
        }

        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                medicoDTO, // Passa apenas o "resumo", quebrando qualquer loop do Hibernate
                user.getAtivo()
        );
    }
}