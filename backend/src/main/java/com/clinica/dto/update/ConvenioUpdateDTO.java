package com.clinica.dto.update;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record ConvenioUpdateDTO(
        String nome,
        @Pattern(regexp = "^\\(\\d{2}\\) \\d{4,5}-\\d{4}$", message = "Telefone inválido")
        String telefone,
        @Positive(message = "Dias para faturamento deve ser positivo")
        Integer diasParaFaturamento,
        Boolean ativo
) {
}
