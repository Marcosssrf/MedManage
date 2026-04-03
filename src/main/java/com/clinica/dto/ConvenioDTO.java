package com.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import org.hibernate.validator.constraints.br.CNPJ;

public record ConvenioDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,
        @NotBlank(message = "CNPJ é obrigatório")
        @CNPJ(message = "CPNJ inválido")
        String cnpj,
        @NotBlank(message = "Registro ANS é obrigatório")
        @Pattern(regexp = "\\d{6}", message = "Registro ANS deve ter 6 dígitos")
        String registroANS,
        @Pattern(regexp = "^\\(\\d{2}\\) \\d{4,5}-\\d{4}$", message = "Telefone inválido. Formato: (XX) XXXXX-XXXX")
        String telefone,
        @Positive(message = "Dias para faturamento deve ser positivo")
        Integer diasParaFaturamento,
        Boolean ativo
) {
}
