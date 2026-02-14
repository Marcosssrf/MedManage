package com.clinica.dto;

import com.clinica.model.enums.StatusConsulta;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConsultaDTO(
		@Future
		@NotNull
		LocalDateTime dataHora,
		@NotNull
		UUID pacienteId,
		@NotNull
		UUID medicoId
) {
}
