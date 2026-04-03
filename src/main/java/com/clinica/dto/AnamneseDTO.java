package com.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;
import java.util.UUID;

public record AnamneseDTO(
        @NotNull(message = "ID da consulta é obrigatório")
        UUID consultaId,
        @NotBlank(message = "Queixa principal é obrigatória")
        String queixaPrincipal,
        String historiaMolestiaPrincipal,
        String exameFisico,
        String hipoteseDiagnostica,
        String solicitacaoDeExames,
        String encaminhamento,
        String condutaMedica,
        @Pattern(regexp = "^[A-Z]\\d{2}(\\.\\d{1,2})?$", message = "Código CID inválido (ex: A01 ou A01.1)")
        String cidCodigo,
        List<PrescricaoDTO> prescricoes
) {
}
