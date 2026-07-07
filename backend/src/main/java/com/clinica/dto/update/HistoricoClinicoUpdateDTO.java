package com.clinica.dto.update;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record HistoricoClinicoUpdateDTO(
        String alergias,
        String doencasPreexistentes,
        String cirurgiasPrevias,
        String historicoFamiliar,
        String medicamentosUsoContinuo,
        @Positive(message = "Peso deve ser positivo")
        @DecimalMax(value = "500.0", message = "Peso inválido")
        BigDecimal peso,

        @Positive(message = "Altura deve ser positiva")
        @DecimalMax(value = "3.0", message = "Altura inválida")
        BigDecimal altura,
        Boolean praticaAtividadeFisica,
        Boolean tabagismo,
        Boolean etilismo,
        Boolean usaDrogas
) {
}
