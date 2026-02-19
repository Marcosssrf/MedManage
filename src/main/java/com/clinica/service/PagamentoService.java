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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PagamentoService {

	@Autowired
	PagamentoRepository pagamentoRepository;

	@Autowired
	ConsultaRepository consultaRepository;

	public Pagamento insert(PagamentoDTO dto){

		Consulta consulta = consultaRepository.findById(dto.consultaId())
				.orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

		if (consulta.getStatus() != StatusConsulta.REALIZADA) {
			throw new RuntimeException("Consulta não realizada, impossível pagar");
		}

		if (pagamentoRepository.existsByConsultaIdAndStatusPagamento(
				dto.consultaId(),
				StatusPagamento.PAGO
		)) {
			throw new RuntimeException("Essa consulta já foi paga!");
		}

		Pagamento pagamento = new Pagamento();
		pagamento.setConsulta(consulta);
		pagamento.setDataPagamento(LocalDate.now());
		pagamento.setValor(dto.valor());
		pagamento.setTipoPagamento(dto.tipoPagamento());
		pagamento.setFormaPagamento(dto.formaPagamento());
		pagamento.setStatusPagamento(StatusPagamento.PENDENTE);

		return pagamentoRepository.save(pagamento);
	}

	public List<Pagamento> findAll(){
		return pagamentoRepository.findAll();
	}

	public Pagamento findById(UUID id) {
		return pagamentoRepository.findById(id).get();
	}

	public Pagamento confirmarPagamento(UUID id){
		Pagamento pagamento = pagamentoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Pagamento não encontrado!"));

		if(pagamento.getStatusPagamento() == StatusPagamento.PAGO){
			throw new RuntimeException("Pagamento já foi confirmado!");
		}

		pagamento.setStatusPagamento(StatusPagamento.PAGO);

		return pagamentoRepository.save(pagamento);
	}

//	public Pagamento update(UUID id, PagamentoDTO dto) {
//		Pagamento pagamento = pagamentoRepository.getReferenceById(id);
//		pagamento.setTipoPagamento(dto.tipoPagamento());
//		pagamento.setFormaPagamento(dto.formaPagamento());
//
//		return pagamentoRepository.save(pagamento);
//	}
//
//	public void delete(UUID id) {
//		pagamentoRepository.deleteById(id);
//	}

}
