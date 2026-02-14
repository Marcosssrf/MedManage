package com.clinica.model;

import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pagamento")
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

	public Pagamento() {
	}

	public Pagamento(UUID id, TipoPagamento tipoPagamento,FormaPagamento formaPagamento,LocalDate dataPagamento ,Double valor, StatusPagamento statusPagamento, Consulta consulta) {
		this.id = id;
		this.tipoPagamento = tipoPagamento;
		this.formaPagamento = formaPagamento;
		this.dataPagamento = dataPagamento;
		this.valor = valor;
		this.statusPagamento = statusPagamento;
		this.consulta = consulta;
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
}
