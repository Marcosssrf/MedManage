package com.clinica.service;

import com.clinica.dto.PagamentoDTO;
import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.exception.RegraDeNegocioException;
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
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));

		if (consulta.getStatus() != StatusConsulta.REALIZADA) {
			throw new RegraDeNegocioException("Consulta não realizada, impossível pagar");
		}

		if (pagamentoRepository.existsByConsultaIdAndStatusPagamento(
				dto.consultaId(),
				StatusPagamento.PAGO
		)) {
			throw new RegraDeNegocioException("Essa consulta já foi paga");
		}

		Pagamento pagamento = new Pagamento();
		Paciente paciente = consulta.getPaciente();
		pagamento.setConsulta(consulta);
		pagamento.setDataPagamento(LocalDate.now());
		pagamento.setValor(dto.valor());
		if(dto.tipoPagamento() == TipoPagamento.CONVENIO){
			Convenio convenio = convenioRepository.findByNome(dto.convenio())
					.orElseThrow(() -> new EntidadeNaoEncontradaException("Convênio não encontrado: " + dto.convenio()));
			if(!convenio.getAtivo()){
				throw new RegraDeNegocioException("Convênio desativado");
			}
			if(paciente.getConvenio() == null){
				throw new RegraDeNegocioException("Paciente não possui convênio cadastrado");
			}
			if (!convenio.getId().equals(paciente.getConvenio().getId())) {
				throw new RegraDeNegocioException("Convênio informado é diferente do convênio do paciente");
			}
			pagamento.setConvenio(convenio);
			pagamento.setTipoPagamento(TipoPagamento.CONVENIO);
			pagamento.setFormaPagamento(FormaPagamento.CONVENIO);
			pagamento.setNumeroParcelas(1);
			pagamento.setStatusPagamento(StatusPagamento.PAGO);
		}else if (dto.tipoPagamento() == TipoPagamento.PARTICULAR){
			if( dto.formaPagamento() == null){
				throw new RegraDeNegocioException("Forma de pagamento é obrigatória");
			}
			pagamento.setConvenio(null);
			pagamento.setTipoPagamento(TipoPagamento.PARTICULAR);
			pagamento.setFormaPagamento(dto.formaPagamento());
			pagamento.setNumeroParcelas(dto.numeroParcelas());
			pagamento.setStatusPagamento(StatusPagamento.PENDENTE);
		} else{
			throw new RegraDeNegocioException("Tipo de pagamento inválido");
		}

		User user = securityService.obterUsuarioLogado();
		pagamento.setUsuario(user);

		Pagamento saved = pagamentoRepository.save(pagamento);
		return toDTO(saved);
	}

	public List<PagamentoResponseDTO> findAll() {
		return pagamentoRepository.buscarListagemOtimizada();
	}

	public PagamentoResponseDTO findById(UUID id) {
		return toDTO(pagamentoRepository.findById(id)
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Pagamento não encontrado")));
	}

	public PagamentoResponseDTO confirmarPagamento(UUID id){
		Pagamento pagamento = pagamentoRepository.findById(id)
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Pagamento não encontrado"));

		if(pagamento.getStatusPagamento() == StatusPagamento.PAGO){
			throw new RegraDeNegocioException("Pagamento já foi confirmado");
		}

		pagamento.setStatusPagamento(StatusPagamento.PAGO);

		return toDTO(pagamentoRepository.save(pagamento));
	}

	private PagamentoResponseDTO toDTO(Pagamento p) {

		PagamentoResponseDTO.ConvenioResumoDTO convenioResumo = p.getConvenio() != null
				? new PagamentoResponseDTO.ConvenioResumoDTO(
				p.getConvenio().getId(),
				p.getConvenio().getNome()
		)
				: null;

		PagamentoResponseDTO.ConsultaResumoPagamentoDTO consultaResumo = null;

		if (p.getConsulta() != null) {
			String nomePaciente = p.getConsulta().getPaciente() != null ? p.getConsulta().getPaciente().getNome() : null;
			String nomeMedico = p.getConsulta().getMedico() != null ? p.getConsulta().getMedico().getNome() : null;

			consultaResumo = new PagamentoResponseDTO.ConsultaResumoPagamentoDTO(
					p.getConsulta().getId(),
					nomePaciente,
					nomeMedico
			);
		}

		return new PagamentoResponseDTO(
				p.getId(),

				p.getTipoPagamento() != null ? p.getTipoPagamento().toString() : null,
				p.getFormaPagamento() != null ? p.getFormaPagamento().toString() : null,

				p.getDataPagamento(),
				p.getValor(),
				p.getNumeroParcelas(),
				convenioResumo,

				p.getStatusPagamento() != null ? p.getStatusPagamento().toString() : null,

				consultaResumo
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
