package com.clinica.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record HorarioTrabalhoMedicoDTO(
        @NotNull
        UUID medicoId,
        @NotNull
        @NotEmpty
        List<Integer> diasSemana,
        @NotNull
        LocalTime horaInicio,
        @NotNull
        LocalTime horaFim,
        @NotNull
        Integer duracaoPadrao
) {}
