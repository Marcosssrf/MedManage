package com.clinica.model;

import com.clinica.model.enums.StatusConsulta;
import jakarta.persistence.*;
import jakarta.validation.Constraint;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "consulta")
public class Consulta {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	private LocalDateTime dataHora;

	@Enumerated(EnumType.STRING)
	private StatusConsulta status;

	@ManyToOne
	@JoinColumn(name = "paciente_id", nullable = false)
	private Paciente paciente;

	@ManyToOne
	@JoinColumn(name = "medico_id", nullable = false)
	private Medico medico;

	@OneToMany(mappedBy = "consulta")
	private List<Pagamento> pagamentos;

	public Consulta() {
	}

	public Consulta(UUID id, LocalDateTime dataHora, StatusConsulta status, Paciente paciente, Medico medico) {
		this.id = id;
		this.dataHora = dataHora;
		this.status = status;
		this.paciente = paciente;
		this.medico = medico;
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
}
