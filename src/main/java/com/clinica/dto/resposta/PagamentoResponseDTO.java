package com.clinica.dto.resposta;

import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;

import java.time.LocalDate;
import java.util.UUID;

public record PagamentoResponseDTO(
        UUID id,
        TipoPagamento tipoPagamento,
        FormaPagamento formaPagamento,
        LocalDate dataPagamento,
        Double valor,
        StatusPagamento statusPagamento,
        ConsultaResumoPagamentoDTO consulta
) {
    public record ConsultaResumoPagamentoDTO(
            UUID id,
            String pacienteNome,
            String medicoNome
    ) {}
}