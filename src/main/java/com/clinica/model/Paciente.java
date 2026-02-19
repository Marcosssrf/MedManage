package com.clinica.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "paciente")
@EntityListeners(AuditingEntityListener.class)
public class Paciente {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	private String nome;
	@Column(nullable = false,  unique = true)
	private String cpf;
	@Column(nullable = false)
	private LocalDate dataNascimento;
	@Column(nullable = false)
	private String telefone;
	@Column(nullable = false)
	private String email;
	private Boolean ativo;

	@OneToMany(mappedBy = "paciente")
	private List<Consulta> consultas;


	@CreatedDate
	@Column(name = "data_cadastro")
	private LocalDateTime dataCadastro;

	@LastModifiedDate
	@Column(name = "data_atualizacao")
	private LocalDateTime dataAtualizacao;


	@Column(name = "id_usuario")
	private UUID idUsuario;

	public Paciente() {
	}

	public Paciente(UUID id, String nome, String cpf, LocalDate dataNascimento, String telefone, String email, Boolean ativo, LocalDateTime dataCadastro, LocalDateTime dataAtualizacao, UUID idUsuario) {
		this.id = id;
		this.nome = nome;
		this.cpf = cpf;
		this.dataNascimento = dataNascimento;
		this.telefone = telefone;
		this.email = email;
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

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public LocalDate getDataNascimento() {
		return dataNascimento;
	}

	public void setDataNascimento(LocalDate dataNascimento) {
		this.dataNascimento = dataNascimento;
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
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

		Paciente paciente = (Paciente) o;
		return Objects.equals(cpf, paciente.cpf);
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(cpf);
	}
}
