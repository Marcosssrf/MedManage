package com.clinica.dto;

import java.util.UUID;

public record MedicoMaisAtendidoDTO(
		UUID medicoId,
		String nome,
		Long totalConsultas) {
}
