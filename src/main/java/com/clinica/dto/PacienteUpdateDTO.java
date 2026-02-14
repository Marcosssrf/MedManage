package com.clinica.dto;

public record PacienteUpdateDTO(
        String nome,
        String email,
        String telefone,
        Boolean ativo
) {
}
