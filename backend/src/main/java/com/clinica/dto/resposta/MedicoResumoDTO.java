package com.clinica.dto.resposta;

import java.util.UUID;

public record MedicoResumoDTO(
        UUID    id,
        String  nome,
        String  crm,
        String  crmEstado,
        String  especialidade,
        String  email,
        String  telefone,
        Boolean ativo
) {}