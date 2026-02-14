package com.clinica.dto.update;

import jakarta.validation.constraints.Future;

import java.time.LocalDateTime;

public record ConsultaUpdateDTO(
        @Future
        LocalDateTime dataHora
) {
}
