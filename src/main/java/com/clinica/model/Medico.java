package com.clinica.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "medico")
@EntityListeners(AuditingEntityListener.class)
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

	@CreatedDate
	@Column(name = "data_cadastro")
	private LocalDateTime dataCadastro;

	@LastModifiedDate
	@Column(name = "data_atualizacao")
	private LocalDateTime dataAtualizacao;


	@Column(name = "id_usuario")
	private UUID idUsuario;

	public Medico() {}

	public Medico(UUID id, String nome, String crm, String especialidade,  Boolean ativo, LocalDateTime dataCadastro, LocalDateTime dataAtualizacao, UUID idUsuario) {
		this.id = id;
		this.nome = nome;
		this.crm = crm;
		this.especialidade = especialidade;
		this.ativo = ativo;
		this.dataCadastro = dataCadastro;
		this.dataAtualizacao = dataAtualizacao;
		this.idUsuario = idUsuario;
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

	public LocalDateTime getDataCadastro() {
		return dataCadastro;
	}

	public void setDataCadastro(LocalDateTime dataCadastro) {
		this.dataCadastro = dataCadastro;
	}

	public LocalDateTime getDataAtualizacao() {
		return dataAtualizacao;
	}

	public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
		this.dataAtualizacao = dataAtualizacao;
	}

	public UUID getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(UUID idUsuario) {
		this.idUsuario = idUsuario;
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
