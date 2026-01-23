package com.clinica.model;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "medico")
public class Medico {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	private String nome;
	@Column(nullable = false,  unique = true)
	private String crm;
	private String especialidade;

	public Medico() {}

	public Medico(Integer id, String nome, String crm, String especialidade) {
		this.id = id;
		this.nome = nome;
		this.crm = crm;
		this.especialidade = especialidade;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
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
