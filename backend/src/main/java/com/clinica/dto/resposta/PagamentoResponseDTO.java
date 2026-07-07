package com.clinica.dto.resposta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PagamentoResponseDTO(
        UUID id,
        String tipoPagamento,
        String formaPagamento,
        LocalDate dataPagamento,
        BigDecimal valor,
        Integer numeroParcelas,
        ConvenioResumoDTO convenio,
        String statusPagamento,
        ConsultaResumoPagamentoDTO consulta
) {

    public record ConvenioResumoDTO(
            UUID id,
            String nome
    ) {}

    public record ConsultaResumoPagamentoDTO(
            UUID id,
            String pacienteNome,
            String medicoNome
    ) {}

    public PagamentoResponseDTO(
            UUID id,
            String tipoPagamento,
            String formaPagamento,
            LocalDate dataPagamento,
            BigDecimal valor,
            Integer numeroParcelas,
            UUID convenioId, String convenioNome,
            String statusPagamento,
            UUID consultaId, String pacienteNome, String medicoNome
    ) {
        this(
                id,
                tipoPagamento,
                formaPagamento,
                dataPagamento,
                valor,
                numeroParcelas,
                convenioId != null ? new ConvenioResumoDTO(convenioId, convenioNome) : null,
                statusPagamento,
                consultaId != null ? new ConsultaResumoPagamentoDTO(consultaId, pacienteNome, medicoNome) : null
        );
    }

}