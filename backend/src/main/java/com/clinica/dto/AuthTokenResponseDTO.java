package com.clinica.dto;

public record AuthTokenResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
