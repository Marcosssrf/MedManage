package com.clinica.dto.update;

import java.time.LocalTime;
import java.util.List;

public record HorarioTrabalhoMedicoUpdateDTO(
        List<Integer> diasSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        Integer duracaoPadrao
) {
}
