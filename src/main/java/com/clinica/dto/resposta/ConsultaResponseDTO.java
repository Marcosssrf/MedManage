package com.clinica.dto.resposta;

import com.clinica.model.enums.StatusConsulta;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConsultaResponseDTO(
        UUID id,
        LocalDateTime dataHora,
        String tipoConsulta,
        String observacoes,
        StatusConsulta status,
        PacienteConsultaDTO paciente,
        MedicoConsultaDTO medico

) {
}
