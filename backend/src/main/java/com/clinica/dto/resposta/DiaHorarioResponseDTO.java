package com.clinica.dto.resposta;

import com.clinica.model.HorarioTrabalhoMedico;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record DiaHorarioResponseDTO(
        UUID id,
        DayOfWeek diaSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        Integer duracaoPadrao
) {
    public static DiaHorarioResponseDTO from(HorarioTrabalhoMedico h) {
        return new DiaHorarioResponseDTO(
                h.getId(),
                h.getDiaSemana(),
                h.getHoraInicio(),
                h.getHoraFim(),
                h.getDuracaoPadrao()
        );
    }
}