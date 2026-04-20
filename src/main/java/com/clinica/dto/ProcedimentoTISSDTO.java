package com.clinica.dto;

import com.clinica.model.enums.TipoAtendimentoTISS;
import com.clinica.model.enums.ViaAcessoTISS;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProcedimentoTISSDTO(

        @NotNull(message = "A consulta é obrigatória")
        UUID consultaId,

        @NotBlank(message = "O código do procedimento é obrigatório")
        @Size(max = 10, message = "Código TUSS deve ter no máximo 10 caracteres")
        String codigoProcedimento, // ex: "10101012"

        @NotBlank(message = "A descrição é obrigatória")
        String descricao, // ex: "Consulta em clínica médica"

        @NotNull(message = "O valor é obrigatório")
        @Positive(message = "O valor deve ser positivo")
        BigDecimal valor, // ex: 150.00

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 1, message = "A quantidade mínima é 1")
        Integer quantidade, // ex: 1

        @NotNull(message = "A data de execução é obrigatória")
        LocalDate dataExecucao, // ex: "2025-04-10"

        @NotNull(message = "O tipo de atendimento é obrigatório")
        TipoAtendimentoTISS tipoAtendimento, // ex: CONSULTA

        @NotNull(message = "A via de acesso é obrigatória")
        ViaAcessoTISS viaAcesso, // ex: NAO_APLICAVEL

        String numeroGuia,         // ex: "202504100001" — pode ser preenchido posteriormente
        String convenioNome,       // ex: "Unimed" — null se particular
        String observacoes         // ex: "Procedimento autorizado por telefone"
) {
}