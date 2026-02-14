package com.clinica.dto;

import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;

import java.time.LocalDate;
import java.util.UUID;

public class PagamentoDTO {

	private UUID consultaId;
	private TipoPagamento tipoPagamento;
	private FormaPagamento formaPagamento;
	private LocalDate dataPagamento;
	private Double valor;
	private StatusPagamento statusPagamento;

	public UUID getConsultaId() {
		return consultaId;
	}

	public void setConsultaId(UUID consultaId) {
		this.consultaId = consultaId;
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
}
