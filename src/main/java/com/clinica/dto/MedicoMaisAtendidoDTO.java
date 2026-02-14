package com.clinica.dto;

import java.util.UUID;

public class MedicoMaisAtendidoDTO {

	private UUID medicoId;
	private String nome;
	private Long totalConsultas;

	public MedicoMaisAtendidoDTO(UUID medicoId, String nome, Long totalConsultas) {
		this.medicoId = medicoId;
		this.nome = nome;
		this.totalConsultas = totalConsultas;
	}

	public UUID getMedicoId() {
		return medicoId;
	}

	public String getNome() {
		return nome;
	}

	public Long getTotalConsultas() {
		return totalConsultas;
	}
}
