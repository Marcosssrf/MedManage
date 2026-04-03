package com.clinica.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record HistoricoClinicoDTO(
        @NotNull(message = "ID do paciente é obrigatório")
        UUID pacienteId,

        String alergias,
        String doencasPreexistentes,
        String cirurgiasPrevias,
        String historicoFamiliar,
        String medicamentosUsoContinuo,

        @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Tipo sanguíneo inválido (ex: A+, O-)")
        String tipoSanguineo,

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
) {}