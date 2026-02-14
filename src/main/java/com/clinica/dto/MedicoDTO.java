package com.clinica.dto;

import jakarta.validation.constraints.NotBlank;

public record MedicoDTO(

        @NotBlank
        String nome,
        String crm,
        @NotBlank
        String especialidade,
        Boolean ativo
) {
}
