package com.clinica.dto;

import com.clinica.model.enums.StatusConsulta;
import com.clinica.model.enums.TipoConsulta;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConsultaDTO(
		@Future(message = "A data da consulta deve ser no futuro")
		@NotNull(message = "Data e hora são obrigatórios")
		LocalDateTime dataHora,

		@NotNull(message = "Tipo de consulta é obrigatório")
		TipoConsulta tipoConsulta,
		StatusConsulta statusConsulta,

		@Positive(message = "Duração deve ser positiva")
		@Max(value = 240, message = "Duração máxima de 4 horas")
		Integer duracaoPrevistaMinutos,
		String observacoes,
		@NotNull
		UUID pacienteId,
		@NotNull
		UUID medicoId
) {
}
