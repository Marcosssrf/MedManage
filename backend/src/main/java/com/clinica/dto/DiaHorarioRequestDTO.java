package com.clinica.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record DiaHorarioRequestDTO(

        @NotNull(message = "Dia da semana é obrigatório")
        DayOfWeek diaSemana,

        @NotNull(message = "Hora de início é obrigatória")
        LocalTime horaInicio,

        @NotNull(message = "Hora de fim é obrigatória")
        LocalTime horaFim,

        @NotNull(message = "Duração padrão é obrigatória")
        @Min(value = 5, message = "Duração mínima é 5 minutos")
        Integer duracaoPadrao
) {}