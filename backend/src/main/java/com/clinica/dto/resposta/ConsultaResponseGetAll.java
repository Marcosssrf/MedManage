package com.clinica.dto.resposta;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConsultaResponseGetAll(
        UUID id,
        LocalDateTime dataHora,
        String nomePaciente,
        String nomeMedico,
        String especialidadeMedico,
        String status,
        String tipoConsulta,
        String observacoes
) {
}