package com.clinica.service;

import com.clinica.dto.PagamentoDTO;
import com.clinica.model.Consulta;
import com.clinica.model.Pagamento;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagamentoService {

	@Autowired
	PagamentoRepository pagamentoRepository;

	@Autowired
	ConsultaRepository consultaRepository;

	public Pagamento insert(PagamentoDTO dto){
		Consulta consulta = consultaRepository.findById(dto.getConsultaId()).orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

		Pagamento pagamento = new Pagamento();

		pagamento.setConsulta(consulta);
		pagamento.setValor(dto.getValor());
		pagamento.setTipoPagamento(dto.getTipoPagamento());
		pagamento.setFormaPagamento(dto.getFormaPagamento());
		pagamento.setStatusPagamento(dto.getStatusPagamento());

		return pagamentoRepository.save(pagamento);
	}

	public List<Pagamento> findAll(){
		return pagamentoRepository.findAll();
	}

	public Pagamento findById(Integer id) {
		return pagamentoRepository.findById(id).get();
	}

	public Pagamento update(Integer id, Pagamento pagamento) {
		Pagamento entity = pagamentoRepository.getReferenceById(id);
		entity.setStatusPagamento(pagamento.getStatusPagamento());
		return pagamentoRepository.save(entity);
	}

	public void delete(Integer id) {
		pagamentoRepository.deleteById(id);
	}



}
