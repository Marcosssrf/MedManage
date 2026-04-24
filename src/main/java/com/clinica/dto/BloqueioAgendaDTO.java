package com.clinica.dto;

import com.clinica.model.enums.TipoBloqueio;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record BloqueioAgendaDTO(

        UUID medicoId,

        @NotNull(message = "Data de início é obrigatória")
        LocalDate dataInicio,

        @NotNull(message = "Data de fim é obrigatória")
        LocalDate dataFim,

        @NotNull(message = "Tipo de bloqueio é obrigatório")
        TipoBloqueio tipo,

        String motivo
) {}
