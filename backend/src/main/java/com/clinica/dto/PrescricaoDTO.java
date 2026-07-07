package com.clinica.dto;

import com.clinica.model.enums.TipoReceita;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PrescricaoDTO(
        @NotBlank(message = "Medicamento é obrigatório")
        String medicamento,
        @NotBlank(message = "Dosagem é obrigatória")
        String dosagem,
        @NotBlank(message = "Via de administração é obrigatória")
        String viaAdministracao,
        @NotBlank(message = "Frequência é obrigatória")
        String frequencia,
        @NotBlank(message = "Duração é obrigatória")
        String duracao,
        String observacao,
        @NotNull(message = "Tipo de receita é obrigatório")
        TipoReceita tipoReceita
) {
}
