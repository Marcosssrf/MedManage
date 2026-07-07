package com.clinica.dto.update;

import com.clinica.model.enums.StatusPagamento;

public record PagamentoUpdateDTO(
        StatusPagamento statusPagamento
) {
}
