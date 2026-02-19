package com.clinica.model;

import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pagamento")
@EntityListeners(AuditingEntityListener.class)
public class Pagamento {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Enumerated(EnumType.STRING)
	private TipoPagamento tipoPagamento;

	@Enumerated(EnumType.STRING)
	private FormaPagamento formaPagamento;

	private LocalDate dataPagamento;

	private Double valor;

	@Enumerated(EnumType.STRING)
	private StatusPagamento statusPagamento;

	@ManyToOne
	@JoinColumn(name = "consulta_id", nullable = false)
	@JsonBackReference
	private Consulta consulta;

	@CreatedDate
	@Column(name = "data_cadastro")
	private LocalDateTime dataCadastro;

	@LastModifiedDate
	@Column(name = "data_atualizacao")
	private LocalDateTime dataAtualizacao;


	@Column(name = "id_usuario")
	private UUID idUsuario;

	public Pagamento() {
	}

	public Pagamento(UUID id, TipoPagamento tipoPagamento,FormaPagamento formaPagamento,LocalDate dataPagamento ,Double valor, StatusPagamento statusPagamento, Consulta consulta, LocalDateTime dataCadastro, LocalDateTime dataAtualizacao, UUID idUsuario) {
		this.id = id;
		this.tipoPagamento = tipoPagamento;
		this.formaPagamento = formaPagamento;
		this.dataPagamento = dataPagamento;
		this.valor = valor;
		this.statusPagamento = statusPagamento;
		this.consulta = consulta;
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

	public TipoPagamento getTipoPagamento() {
		return tipoPagamento;
	}

	public void setTipoPagamento(TipoPagamento tipoPagamento) {
		this.tipoPagamento = tipoPagamento;
	}

	public FormaPagamento getFormaPagamento() {
		return formaPagamento;
	}

	public void setFormaPagamento(FormaPagamento formaPagamento) {
		this.formaPagamento = formaPagamento;
	}

	public LocalDate getDataPagamento() {
		return dataPagamento;
	}

	public void setDataPagamento(LocalDate dataPagamento) {
		this.dataPagamento = dataPagamento;
	}

	public Double getValor() {
		return valor;
	}

	public void setValor(Double valor) {
		this.valor = valor;
	}

	public StatusPagamento getStatusPagamento() {
		return statusPagamento;
	}

	public void setStatusPagamento(StatusPagamento statusPagamento) {
		this.statusPagamento = statusPagamento;
	}

	public Consulta getConsulta() {
		return consulta;
	}

	public void setConsulta(Consulta consulta) {
		this.consulta = consulta;
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

}
