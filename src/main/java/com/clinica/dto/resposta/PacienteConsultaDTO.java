package com.clinica.dto.resposta;

import java.time.LocalDate;

public record PacienteConsultaDTO(
        String nome,
        LocalDate dataNascimento
) {}