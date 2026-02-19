package com.clinica.dto;

import com.clinica.model.enums.FormaPagamento;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.model.enums.TipoPagamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
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
		Double valor,
		@NotNull
		StatusPagamento statusPagamento
) {
}
