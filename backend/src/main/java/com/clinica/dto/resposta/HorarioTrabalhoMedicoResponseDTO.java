package com.clinica.dto.resposta;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record HorarioTrabalhoMedicoResponseDTO(
        UUID id,
        UUID medicoId,
        String medicoNome,
        List<Integer> diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        Integer duracaoPadrao
) {}
