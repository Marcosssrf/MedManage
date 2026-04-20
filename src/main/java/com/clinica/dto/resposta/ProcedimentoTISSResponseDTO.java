package com.clinica.dto.resposta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProcedimentoTISSResponseDTO(

        UUID id,
        String codigoProcedimento,
        String descricao,
        BigDecimal valor,
        Integer quantidade,
        BigDecimal valorTotal,      // calculado: valor * quantidade
        LocalDate dataExecucao,
        String numeroGuia,
        String numeroAutorizacao,
        String statusAutorizacao,
        String tipoAtendimento,
        String viaAcesso,
        String observacoes,

        ConsultaResumoProcedimentoDTO consulta,
        ConvenioResumoProcedimentoDTO convenio,

        LocalDateTime dataCadastro,
        LocalDateTime dataAtualizacao

) {
    public record ConsultaResumoProcedimentoDTO(
            UUID id,
            String pacienteNome,
            String medicoNome,
            String medicoCrm
    ) {}

    public record ConvenioResumoProcedimentoDTO(
            UUID id,
            String nome,
            String registroANS
    ) {}

    public ProcedimentoTISSResponseDTO(
            UUID id, String codigoProcedimento, String descricao,
            BigDecimal valor, Integer quantidade, LocalDate dataExecucao,
            String numeroGuia, String numeroAutorizacao,
            String statusAutorizacao, String tipoAtendimento, String viaAcesso,
            String observacoes,
            UUID consultaId, String pacienteNome, String medicoNome, String medicoCrm,
            UUID convenioId, String convenioNome, String registroANS,
            LocalDateTime dataCadastro, LocalDateTime dataAtualizacao
    ) {
        this(
                id, codigoProcedimento, descricao, valor, quantidade,
                valor.multiply(BigDecimal.valueOf(quantidade)),
                dataExecucao, numeroGuia, numeroAutorizacao,
                statusAutorizacao, tipoAtendimento, viaAcesso, observacoes,
                consultaId != null
                        ? new ConsultaResumoProcedimentoDTO(consultaId, pacienteNome, medicoNome, medicoCrm)
                        : null,
                convenioId != null
                        ? new ConvenioResumoProcedimentoDTO(convenioId, convenioNome, registroANS)
                        : null,
                dataCadastro, dataAtualizacao
        );
    }
}