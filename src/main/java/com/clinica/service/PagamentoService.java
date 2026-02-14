package com.clinica.service;

import com.clinica.dto.PagamentoDTO;
import com.clinica.model.Consulta;
import com.clinica.model.Pagamento;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PagamentoService {

	@Autowired
	PagamentoRepository pagamentoRepository;

	@Autowired
	ConsultaRepository consultaRepository;

	public Pagamento insert(PagamentoDTO dto){

		Consulta consulta = consultaRepository.findById(dto.getConsultaId())
				.orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

		if (consulta.getStatus() != StatusConsulta.REALIZADA) {
			throw new RuntimeException("Consulta não realizada, impossível pagar");
		}

		if (pagamentoRepository.existsByConsultaIdAndStatusPagamento(
				dto.getConsultaId(),
				StatusPagamento.PAGO
		)) {
			throw new RuntimeException("Essa consulta já foi paga!");
		}

		Pagamento pagamento = new Pagamento();
		pagamento.setConsulta(consulta);
		pagamento.setDataPagamento(dto.getDataPagamento());
		pagamento.setValor(dto.getValor());
		pagamento.setTipoPagamento(dto.getTipoPagamento());
		pagamento.setFormaPagamento(dto.getFormaPagamento());
		pagamento.setStatusPagamento(StatusPagamento.PAGO); // sistema decide

		return pagamentoRepository.save(pagamento);
	}

	public List<Pagamento> findAll(){
		return pagamentoRepository.findAll();
	}

	public Pagamento findById(UUID id) {
		return pagamentoRepository.findById(id).get();
	}

	public Pagamento update(UUID id, Pagamento pagamento) {
		Pagamento entity = pagamentoRepository.getReferenceById(id);
		entity.setStatusPagamento(pagamento.getStatusPagamento());
		return pagamentoRepository.save(entity);
	}

	public void delete(UUID id) {
		pagamentoRepository.deleteById(id);
	}



}
