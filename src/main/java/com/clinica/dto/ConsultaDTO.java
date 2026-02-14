package com.clinica.dto;

import com.clinica.model.enums.StatusConsulta;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConsultaDTO {

	private LocalDateTime dataHora;
	private UUID pacienteId;
	private UUID medicoId;
	private StatusConsulta status;

	public LocalDateTime getDataHora() {
		return dataHora;
	}

	public void setDataHora(LocalDateTime dataHora) {
		this.dataHora = dataHora;
	}

	public UUID getPacienteId() {
		return pacienteId;
	}

	public void setPacienteId(UUID pacienteId) {
		this.pacienteId = pacienteId;
	}

	public UUID getMedicoId() {
		return medicoId;
	}

	public void setMedicoId(UUID medicoId) {
		this.medicoId = medicoId;
	}

	public StatusConsulta getStatus() {
		return status;
	}

	public void setStatus(StatusConsulta status) {
		this.status = status;
	}
}
