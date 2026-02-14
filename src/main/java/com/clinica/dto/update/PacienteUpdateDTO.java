package com.clinica.dto.update;

public record PacienteUpdateDTO(
        String nome,
        String email,
        String telefone,
        Boolean ativo
) {
}
