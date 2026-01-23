package com.clinica.dto;

import com.clinica.model.enums.StatusConsulta;

import java.time.LocalDateTime;

public class ConsultaDTO {

	private LocalDateTime dataHora;
	private Integer pacienteId;
	private Integer medicoId;
	private StatusConsulta status;

	public LocalDateTime getDataHora() {
		return dataHora;
	}

	public void setDataHora(LocalDateTime dataHora) {
		this.dataHora = dataHora;
	}

	public Integer getPacienteId() {
		return pacienteId;
	}

	public void setPacienteId(Integer pacienteId) {
		this.pacienteId = pacienteId;
	}

	public Integer getMedicoId() {
		return medicoId;
	}

	public void setMedicoId(Integer medicoId) {
		this.medicoId = medicoId;
	}

	public StatusConsulta getStatus() {
		return status;
	}

	public void setStatus(StatusConsulta status) {
		this.status = status;
	}
}
