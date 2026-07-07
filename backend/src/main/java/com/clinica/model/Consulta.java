package com.clinica.model;

import com.clinica.model.enums.StatusConsulta;
import com.clinica.model.enums.TipoConsulta;
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

	@Column(nullable = false)
	private LocalDateTime dataHora;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TipoConsulta tipoConsulta; // ex: PRIMEIRA_VEZ / RETORNO / URGENCIA / TELEMEDICINA

	@Enumerated(EnumType.STRING)
	private StatusConsulta status; // ex: AGENDADA / CONFIRMADA / EM_ANDAMENTO / REALIZADA / CANCELADA

	@ManyToOne
	@JoinColumn(name = "paciente_id", nullable = false)
	@JsonIgnoreProperties({"dataCadastro", "dataAtualizacao", "createdBy"})
	private Paciente paciente;

	@ManyToOne
	@JoinColumn(name = "medico_id", nullable = false)
	@JsonIgnoreProperties({"dataCadastro", "dataAtualizacao", "createdBy"})
	private Medico medico;

	@Column
	private Integer duracaoPrevistaMinutos; // ex: 30 / 45 / 60 (duração em minutos)

	@Column
	private String observacoes; // ex: "Paciente solicitou consulta com urgência, relata febre há 2 dias"

	@OneToOne(mappedBy = "consulta", cascade = CascadeType.ALL)
	private Anamnese anamnese; // ex: referência à anamnese preenchida pelo médico durante a consulta

	@OneToMany(mappedBy = "consulta")
	private List<Pagamento> pagamentos; // ex: lista com pagamento de R$ 200,00 via PIX

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

	public Consulta(UUID id, LocalDateTime dataHora, TipoConsulta tipoConsulta, StatusConsulta status,
					Paciente paciente, Medico medico, Integer duracaoPrevistaMinutos, String observacoes,
					LocalDateTime dataCadastro, LocalDateTime dataAtualizacao, User usuario) {
		this.id = id;
		this.dataHora = dataHora;
		this.tipoConsulta = tipoConsulta;
		this.status = status;
		this.paciente = paciente;
		this.medico = medico;
		this.duracaoPrevistaMinutos = duracaoPrevistaMinutos;
		this.observacoes = observacoes;
		this.dataCadastro = dataCadastro;
		this.dataAtualizacao = dataAtualizacao;
		this.usuario = usuario;
	}

	@JsonProperty("createdBy")
	public String getCreatedBy() {
		return usuario != null ? usuario.getUsername() : null;
	}

	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }

	public LocalDateTime getDataHora() { return dataHora; }
	public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

	public TipoConsulta getTipoConsulta() { return tipoConsulta; }
	public void setTipoConsulta(TipoConsulta tipoConsulta) { this.tipoConsulta = tipoConsulta; }

	public StatusConsulta getStatus() { return status; }
	public void setStatus(StatusConsulta status) { this.status = status; }

	public Paciente getPaciente() { return paciente; }
	public void setPaciente(Paciente paciente) { this.paciente = paciente; }

	public Medico getMedico() { return medico; }
	public void setMedico(Medico medico) { this.medico = medico; }

	public Integer getDuracaoPrevistaMinutos() { return duracaoPrevistaMinutos; }
	public void setDuracaoPrevistaMinutos(Integer duracaoPrevistaMinutos) { this.duracaoPrevistaMinutos = duracaoPrevistaMinutos; }

	public String getObservacoes() { return observacoes; }
	public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

	public Anamnese getAnamnese() { return anamnese; }
	public void setAnamnese(Anamnese anamnese) { this.anamnese = anamnese; }

	public LocalDateTime getDataCadastro() { return dataCadastro; }
	public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

	public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
	public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

	public User getUsuario() { return usuario; }
	public void setUsuario(User usuario) { this.usuario = usuario; }
}
