package com.clinica.controller;

import com.clinica.dto.AuthRequestDTO;
import com.clinica.dto.AuthTokenResponseDTO;
import com.clinica.security.JwtTokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenService jwtTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/token")
    public ResponseEntity<AuthTokenResponseDTO> token(@RequestBody @Valid AuthRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.senha())
            );

            String token = jwtTokenService.generateToken(authentication.getName());

            return ResponseEntity.ok(new AuthTokenResponseDTO(
                    token,
                    "Bearer",
                    jwtTokenService.getExpirationSeconds()
            ));
        } catch (Exception e) {
            e.printStackTrace(); // ← vai aparecer no console com a causa real
            throw e;
        }
    }
}
