package com.clinica.model;

import com.clinica.model.enums.StatusConsulta;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "consulta")
@EntityListeners(AuditingEntityListener.class)
public class Consulta {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	private LocalDateTime dataHora;

	@Enumerated(EnumType.STRING)
	private StatusConsulta status;

	@ManyToOne
	@JoinColumn(name = "paciente_id", nullable = false)
	@JsonIgnoreProperties({"dataCadastro","dataAtualizacao","createdBy"})
	private Paciente paciente;

	@ManyToOne
	@JoinColumn(name = "medico_id", nullable = false)
	@JsonIgnoreProperties({"dataCadastro","dataAtualizacao","createdBy"})
	private Medico medico;

	@OneToMany(mappedBy = "consulta")
	private List<Pagamento> pagamentos;

	@CreatedDate
	@Column(name = "data_cadastro")
	private LocalDateTime dataCadastro;

	@LastModifiedDate
	@Column(name = "data_atualizacao")
	private LocalDateTime dataAtualizacao;

	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "id_usuario")
	private User usuario;

	public Consulta() {
	}

	public Consulta(UUID id, LocalDateTime dataHora, StatusConsulta status, Paciente paciente, Medico medico, LocalDateTime dataCadastro, LocalDateTime dataAtualizacao, User Usuario) {
		this.id = id;
		this.dataHora = dataHora;
		this.status = status;
		this.paciente = paciente;
		this.medico = medico;
		this.dataCadastro = dataCadastro;
		this.dataAtualizacao = dataAtualizacao;
		this.usuario = Usuario;
	}

	@JsonProperty("createdBy")
	public String getCreatedBy() {
		return usuario != null ? usuario.getUsername() : null;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public LocalDateTime getDataHora() {
		return dataHora;
	}

	public void setDataHora(LocalDateTime dataHora) {
		this.dataHora = dataHora;
	}

	public StatusConsulta getStatus() {
		return status;
	}

	public void setStatus(StatusConsulta status) {
		this.status = status;
	}

	public Paciente getPaciente() {
		return paciente;
	}

	public void setPaciente(Paciente paciente) {
		this.paciente = paciente;
	}

	public Medico getMedico() {
		return medico;
	}

	public void setMedico(Medico medico) {
		this.medico = medico;
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

	public User getUsuario() {
		return usuario;
	}

	public void setUsuario(User usuario) {
		this.usuario = usuario;
	}
}
