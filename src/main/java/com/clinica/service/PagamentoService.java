package com.clinica.service;

import com.clinica.dto.PagamentoDTO;
import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.model.*;
import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.ConvenioRepository;
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
	ConvenioRepository convenioRepository;

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
		Paciente paciente = consulta.getPaciente();
		pagamento.setConsulta(consulta);
		pagamento.setDataPagamento(LocalDate.now());
		pagamento.setValor(dto.valor());
		if(dto.tipoPagamento() == TipoPagamento.CONVENIO){
			Convenio convenio = convenioRepository.findByNome(dto.convenio())
					.orElseThrow(() -> new RuntimeException("Convênio não encontrado: " + dto.convenio()));
			if(!convenio.getAtivo()){
				throw new RuntimeException("Convenio desativado");
			}
			if(paciente.getConvenio() == null){
				throw new RuntimeException("Paciente não possui convênio cadastrado");
			}
			if (!convenio.getId().equals(paciente.getConvenio().getId())) {
				throw new RuntimeException("Convênio informado é diferente do convênio do paciente");
			}
			pagamento.setConvenio(convenio);
			pagamento.setTipoPagamento(TipoPagamento.CONVENIO);
			pagamento.setFormaPagamento(FormaPagamento.CONVENIO);
			pagamento.setNumeroParcelas(1);
			pagamento.setStatusPagamento(StatusPagamento.PAGO);
		}else if (dto.tipoPagamento() == TipoPagamento.PARTICULAR){
			if( dto.formaPagamento() == null){
				throw new RuntimeException("Forma de pagamento é obrigatória");
			}
			pagamento.setConvenio(null);
			pagamento.setTipoPagamento(TipoPagamento.PARTICULAR);
			pagamento.setFormaPagamento(dto.formaPagamento());
			pagamento.setNumeroParcelas(dto.numeroParcelas());
			pagamento.setStatusPagamento(StatusPagamento.PENDENTE);
		} else{
			throw new RuntimeException("Tipo de pagamento inválido");
		}

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
		PagamentoResponseDTO.ConvenioResumoDTO convenioResumo = p.getConvenio() != null
				? new PagamentoResponseDTO.ConvenioResumoDTO(
				p.getConvenio().getId(),
				p.getConvenio().getNome())
				: null;

		return new PagamentoResponseDTO(
				p.getId(),
				p.getTipoPagamento(),
				p.getFormaPagamento(),
				p.getDataPagamento(),
				p.getValor(),
				p.getNumeroParcelas(),
				convenioResumo,
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
