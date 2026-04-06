package com.clinica.dto;

import java.time.LocalTime;

public record ConfiguracaoClinicaDTO(
        String nomeClinica,
        String cnpj,
        String telefone,
        LocalTime horarioAbertura,
        LocalTime horarioFechamento,
        Integer duracaoPadraoConsulta
) {
}
