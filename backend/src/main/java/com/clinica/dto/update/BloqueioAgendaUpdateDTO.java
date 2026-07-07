package com.clinica.dto.update;

import com.clinica.model.enums.TipoBloqueio;

import java.time.LocalDate;

public record BloqueioAgendaUpdateDTO(
        LocalDate dataInicio,
        LocalDate dataFim,
        TipoBloqueio tipo,
        String motivo,
        Boolean ativo
) {}
