package com.clinica.dto;

import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record PagamentoDTO(
		@NotNull
		UUID consultaId,
		@NotNull
		TipoPagamento tipoPagamento,
		@NotNull
		FormaPagamento formaPagamento,
		@NotNull
		@Positive
		BigDecimal valor,

		@Min(value = 1, message = "Número de parcelas deve ser pelo menos 1")
		@Max(value = 12, message = "Número de parcelas deve ser no máximo 12")
		Integer numeroParcelas,
		String  convenio,
		StatusPagamento statusPagamento
) {
}
