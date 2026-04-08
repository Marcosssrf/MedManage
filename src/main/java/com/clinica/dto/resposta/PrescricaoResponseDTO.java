package com.clinica.dto.resposta;

import com.clinica.model.Prescricao;

import java.util.UUID;

public record PrescricaoResponseDTO(
        UUID id,
        String medicamento,
        String dosagem,
        String viaAdministracao,
        String frequencia,
        String duracao,
        String observacoes,
        String tipoReceita
) {
    public PrescricaoResponseDTO(Prescricao p) {
        this(
                p.getId(),
                p.getMedicamento(),
                p.getDosagem(),
                p.getViaAdministracao(),
                p.getFrequencia(),
                p.getDuracao(),
                p.getObservacoes(),
                p.getTipoReceita() != null ? p.getTipoReceita().toString() : null
        );
    }
}
