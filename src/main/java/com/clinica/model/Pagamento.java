package com.clinica.model;

import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;
import jakarta.persistence.*;

@Entity
@Table(name = "pagamento")
public class Pagamento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	private TipoPagamento tipoPagamento;
	private FormaPagamento formaPagamento;
	private Double valor;
	private StatusPagamento statusPagamento;
	@OneToOne
	private Consulta consulta;

	public Pagamento() {
	}

	public Pagamento(Integer id, TipoPagamento tipoPagamento,FormaPagamento formaPagamento, Double valor, StatusPagamento statusPagamento, Consulta consulta) {
		this.id = id;
		this.tipoPagamento = tipoPagamento;
		this.formaPagamento = formaPagamento;
		this.valor = valor;
		this.statusPagamento = statusPagamento;
		this.consulta = consulta;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
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
