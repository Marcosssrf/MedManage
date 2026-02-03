package com.clinica.dto;

public class MedicoMaisAtendidoDTO {

	private Integer medicoId;
	private String nome;
	private Long totalConsultas;

	public MedicoMaisAtendidoDTO(Integer medicoId, String nome, Long totalConsultas) {
		this.medicoId = medicoId;
		this.nome = nome;
		this.totalConsultas = totalConsultas;
	}

	public Integer getMedicoId() {
		return medicoId;
	}

	public String getNome() {
		return nome;
	}

	public Long getTotalConsultas() {
		return totalConsultas;
	}
}
