package com.clinica.service;

import com.clinica.dto.PagamentoDTO;
import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.model.Consulta;
import com.clinica.model.Pagamento;
import com.clinica.model.User;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.PagamentoRepository;
import com.clinica.security.SecurityService;
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

	@Autowired
	SecurityService securityService;

	public PagamentoResponseDTO insert(PagamentoDTO dto){

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

		User user = securityService.obterUsuarioLogado();
		pagamento.setUsuario(user);

		Pagamento saved = pagamentoRepository.save(pagamento);
		return toDTO(saved);
	}

	public List<PagamentoResponseDTO> findAll(){
		return pagamentoRepository.findAll().stream().map(this::toDTO).toList();
	}

	public PagamentoResponseDTO findById(UUID id) {
		return toDTO(pagamentoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Pagamento não encontrado!")));
	}

	public PagamentoResponseDTO confirmarPagamento(UUID id){
		Pagamento pagamento = pagamentoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Pagamento não encontrado!"));

		if(pagamento.getStatusPagamento() == StatusPagamento.PAGO){
			throw new RuntimeException("Pagamento já foi confirmado!");
		}

		pagamento.setStatusPagamento(StatusPagamento.PAGO);

		return toDTO(pagamentoRepository.save(pagamento));
	}

	private PagamentoResponseDTO toDTO(Pagamento p) {
		return new PagamentoResponseDTO(
				p.getId(),
				p.getTipoPagamento(),
				p.getFormaPagamento(),
				p.getDataPagamento(),
				p.getValor(),
				p.getStatusPagamento(),
				new PagamentoResponseDTO.ConsultaResumoPagamentoDTO(
						p.getConsulta().getId(),
						p.getConsulta().getPaciente().getNome(),
						p.getConsulta().getMedico().getNome()
				)
		);
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
