package com.clinica.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record HorarioTrabalhoRequestDTO(

        @NotEmpty(message = "Informe ao menos um dia")
        @Valid
        List<DiaHorarioRequestDTO> horarios
) {}