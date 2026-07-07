package com.clinica.dto.resposta;

import java.util.UUID;

public record MedicoConsultaDTO(
        UUID id,
        String nome,
        String crm,
        String especialidade
) {
}
