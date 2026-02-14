package com.clinica.model;

import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "medico")
public class Medico {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	private String nome;
	@Column(nullable = false,  unique = true)
	private String crm;
	@Column(nullable = false)
	private String especialidade;
	private Boolean ativo;

	@OneToMany(mappedBy = "medico")
	private List<Consulta> consultas;

	public Medico() {}

	public Medico(UUID id, String nome, String crm, String especialidade,  Boolean ativo) {
		this.id = id;
		this.nome = nome;
		this.crm = crm;
		this.especialidade = especialidade;
		this.ativo = ativo;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCrm() {
		return crm;
	}

	public void setCrm(String crm) {
		this.crm = crm;
	}

	public String getEspecialidade() {
		return especialidade;
	}

	public void setEspecialidade(String especialidade) {
		this.especialidade = especialidade;
	}

	public Boolean getAtivo() {
		return ativo;
	}

	public void setAtivo(Boolean ativo) {
		this.ativo = ativo;
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass()) return false;

		Medico medico = (Medico) o;
		return Objects.equals(nome, medico.nome);
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(nome);
	}
}
