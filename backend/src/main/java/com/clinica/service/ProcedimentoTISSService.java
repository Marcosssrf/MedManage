package com.clinica.service;

import com.clinica.dto.PagamentoDTO;
import com.clinica.dto.ProcedimentoTISSDTO;
import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.dto.resposta.ProcedimentoTISSResponseDTO;
import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.exception.RegraDeNegocioException;
import com.clinica.model.Consulta;
import com.clinica.model.Convenio;
import com.clinica.model.Paciente;
import com.clinica.model.ProcedimentoTISS;
import com.clinica.model.enums.*;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.ConvenioRepository;
import com.clinica.repository.PagamentoRepository;
import com.clinica.repository.ProcedimentoTISSRepository;
import com.clinica.security.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ProcedimentoTISSService {

    @Autowired
    private ProcedimentoTISSRepository procedimentoTISSRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private ConvenioRepository convenioRepository;

    @Autowired
    private PagamentoService pagamentoService;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private SecurityService securityService;

    public ProcedimentoTISSResponseDTO insert(ProcedimentoTISSDTO dto) {

        Consulta consulta = consultaRepository.findById(dto.consultaId())
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));

        if (consulta.getStatus() == StatusConsulta.CANCELADA) {
            throw new RegraDeNegocioException("Não é possível registrar procedimentos em consultas canceladas");
        }

        if (dto.numeroGuia() != null && procedimentoTISSRepository.existsByNumeroGuia(dto.numeroGuia())) {
            throw new RegraDeNegocioException("Já existe um procedimento com o número de guia: " + dto.numeroGuia());
        }

        ProcedimentoTISS procedimento = new ProcedimentoTISS();
        procedimento.setConsulta(consulta);
        procedimento.setCodigoProcedimento(dto.codigoProcedimento());
        procedimento.setDescricao(dto.descricao());
        procedimento.setValor(dto.valor());
        procedimento.setQuantidade(dto.quantidade());
        procedimento.setDataExecucao(dto.dataExecucao());
        procedimento.setTipoAtendimento(dto.tipoAtendimento());
        procedimento.setViaAcesso(dto.viaAcesso());
        procedimento.setNumeroGuia(dto.numeroGuia());
        procedimento.setObservacoes(dto.observacoes());
        procedimento.setStatusAutorizacao(StatusAutorizacaoTISS.PENDENTE);

        if (dto.convenioNome() != null) {
            Convenio convenio = convenioRepository.findByNome(dto.convenioNome())
                    .orElseThrow(() -> new EntidadeNaoEncontradaException("Convênio não encontrado: " + dto.convenioNome()));
            if (!convenio.getAtivo()) {
                throw new RegraDeNegocioException("Convênio informado está desativado");
            }
            Paciente paciente = consulta.getPaciente();
            if (paciente.getConvenio() == null || !paciente.getConvenio().getId().equals(convenio.getId())) {
                throw new RegraDeNegocioException("O convênio informado não corresponde ao convênio do paciente");
            }
            procedimento.setConvenio(convenio);
        }

        procedimento.setUsuario(securityService.obterUsuarioLogado());

        return toDTO(procedimentoTISSRepository.save(procedimento));
    }

    public PagamentoResponseDTO gerarPagamentoDaTISS(UUID consultaId) {
        Consulta consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));

        List<ProcedimentoTISS> procedimentos = procedimentoTISSRepository.findByConsultaId(consultaId);

        if (procedimentos.isEmpty()) {
            throw new RegraDeNegocioException("Nenhum procedimento TISS encontrado para esta consulta");
        }

        boolean todosAutorizados = procedimentos.stream()
                .allMatch(p -> p.getStatusAutorizacao() == StatusAutorizacaoTISS.AUTORIZADO);
        if (!todosAutorizados) {
            throw new RegraDeNegocioException("Todos os procedimentos precisam estar autorizados");
        }

        boolean jaTemPagamentoPago = pagamentoRepository.existsByConsultaIdAndStatusPagamento(
                consultaId, StatusPagamento.PAGO);
        if (jaTemPagamentoPago) {
            throw new RegraDeNegocioException("Esta consulta já possui um pagamento confirmado");
        }

        BigDecimal total = procedimentos.stream()
                .map(p -> p.getValor().multiply(BigDecimal.valueOf(p.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean temConvenio = consulta.getPaciente().getConvenio() != null;

        PagamentoDTO dto = new PagamentoDTO(
                consulta.getId(),
                temConvenio ? TipoPagamento.CONVENIO : TipoPagamento.PARTICULAR,
                temConvenio ? FormaPagamento.CONVENIO : FormaPagamento.PIX,
                total,
                1,
                temConvenio ? consulta.getPaciente().getConvenio().getNome() : null,
                temConvenio ? StatusPagamento.PAGO : StatusPagamento.PENDENTE
        );

        return pagamentoService.insert(dto);
    }

    public List<ProcedimentoTISSResponseDTO> findAll() {
        return procedimentoTISSRepository.buscarListagemOtimizada();
    }

    public ProcedimentoTISSResponseDTO findById(UUID id) {
        return toDTO(procedimentoTISSRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Procedimento TISS não encontrado")));
    }

    public List<ProcedimentoTISS> findByConsulta(UUID consultaId) {
        consultaRepository.findById(consultaId)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));
        return procedimentoTISSRepository.findByConsultaId(consultaId);
    }

    public ProcedimentoTISSResponseDTO autorizarProcedimento(UUID id, String numeroAutorizacao) {
        ProcedimentoTISS procedimento = procedimentoTISSRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Procedimento TISS não encontrado"));

        if (procedimento.getStatusAutorizacao() == StatusAutorizacaoTISS.AUTORIZADO) {
            throw new RegraDeNegocioException("Procedimento já está autorizado");
        }
        if (procedimento.getStatusAutorizacao() == StatusAutorizacaoTISS.CANCELADO) {
            throw new RegraDeNegocioException("Não é possível autorizar um procedimento cancelado");
        }

        procedimento.setStatusAutorizacao(StatusAutorizacaoTISS.AUTORIZADO);
        procedimento.setNumeroAutorizacao(numeroAutorizacao);

        return toDTO(procedimentoTISSRepository.save(procedimento));
    }

    public ProcedimentoTISSResponseDTO negarProcedimento(UUID id) {
        ProcedimentoTISS procedimento = procedimentoTISSRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Procedimento TISS não encontrado"));

        if (procedimento.getStatusAutorizacao() != StatusAutorizacaoTISS.PENDENTE) {
            throw new RegraDeNegocioException("Somente procedimentos PENDENTES podem ser negados");
        }

        procedimento.setStatusAutorizacao(StatusAutorizacaoTISS.NEGADO);
        return toDTO(procedimentoTISSRepository.save(procedimento));
    }

    public void delete(UUID id) {
        ProcedimentoTISS procedimento = procedimentoTISSRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Procedimento TISS não encontrado"));

        if (procedimento.getStatusAutorizacao() == StatusAutorizacaoTISS.FATURADO) {
            throw new RegraDeNegocioException("Não é possível excluir procedimentos já faturados");
        }

        procedimentoTISSRepository.deleteById(id);
    }

    private ProcedimentoTISSResponseDTO toDTO(ProcedimentoTISS p) {

        ProcedimentoTISSResponseDTO.ConsultaResumoProcedimentoDTO consultaResumo = null;
        if (p.getConsulta() != null) {
            Consulta c = p.getConsulta();
            consultaResumo = new ProcedimentoTISSResponseDTO.ConsultaResumoProcedimentoDTO(
                    c.getId(),
                    c.getPaciente() != null ? c.getPaciente().getNome() : null,
                    c.getMedico() != null ? c.getMedico().getNome() : null,
                    c.getMedico() != null ? c.getMedico().getCrm() : null
            );
        }

        ProcedimentoTISSResponseDTO.ConvenioResumoProcedimentoDTO convenioResumo = null;
        if (p.getConvenio() != null) {
            convenioResumo = new ProcedimentoTISSResponseDTO.ConvenioResumoProcedimentoDTO(
                    p.getConvenio().getId(),
                    p.getConvenio().getNome(),
                    p.getConvenio().getRegistroANS()
            );
        }

        return new ProcedimentoTISSResponseDTO(
                p.getId(),
                p.getCodigoProcedimento(),
                p.getDescricao(),
                p.getValor(),
                p.getQuantidade(),
                p.getValor().multiply(java.math.BigDecimal.valueOf(p.getQuantidade())),
                p.getDataExecucao(),
                p.getNumeroGuia(),
                p.getNumeroAutorizacao(),
                p.getStatusAutorizacao() != null ? p.getStatusAutorizacao().toString() : null,
                p.getTipoAtendimento() != null ? p.getTipoAtendimento().toString() : null,
                p.getViaAcesso() != null ? p.getViaAcesso().toString() : null,
                p.getObservacoes(),
                consultaResumo,
                convenioResumo,
                p.getDataCadastro(),
                p.getDataAtualizacao()
        );
    }
}