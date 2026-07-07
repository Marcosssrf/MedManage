package com.clinica.dto.resposta;

import com.clinica.model.BloqueioAgenda;
import com.clinica.model.enums.TipoBloqueio;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record BloqueioAgendaResponseDTO(
        UUID id,
        UUID medicoId,
        String medicoNome,
        LocalDate dataInicio,
        LocalDate dataFim,
        TipoBloqueio tipo,
        String motivo,
        Boolean ativo,
        LocalDateTime dataCadastro,
        LocalDateTime dataAtualizacao
) {
    public static BloqueioAgendaResponseDTO from(BloqueioAgenda b) {
        return new BloqueioAgendaResponseDTO(
                b.getId(),
                b.getMedico() != null ? b.getMedico().getId() : null,
                b.getMedico() != null ? b.getMedico().getNome() : null,
                b.getDataInicio(),
                b.getDataFim(),
                b.getTipo(),
                b.getMotivo(),
                b.getAtivo(),
                b.getDataCadastro(),
                b.getDataAtualizacao()
        );
    }
}
