package com.clinica.dto;

import com.clinica.model.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UserCreateDTO(
        @NotBlank(message = "Username é obrigatório")
        String username,
        @NotBlank(message = "Senha é obrigatória")
        String senha,
        @NotNull(message = "Role é obrigatória")
        Role role,

        UUID medicoId

) {
}
