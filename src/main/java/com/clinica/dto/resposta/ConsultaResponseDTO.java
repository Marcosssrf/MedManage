package com.clinica.dto.resposta;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ConsultaResponseDTO(
        UUID id,
        LocalDateTime dataHora,
        String tipoConsulta,
        String observacoes,
        String status,
        PacienteResponseDTO paciente,
        MedicoConsultaDTO medico,
        AnamneseResponseDTO anamnese,
        List<PrescricaoResponseDTO> prescricoes
) {
}
