package com.clinica.dto.resposta;

import com.clinica.model.Anamnese;
import com.clinica.model.Cid;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record AnamneseResponseDTO(
        UUID id,
        String queixaPrincipal,
        String historiaMolestiaPrincipal,
        String exameFisico,
        String hipoteseDiagnostica,
        String solicitacaoDeExames,
        String encaminhamento,
        String condutaMedica,
        Cid cidCodigo,
        List<PrescricaoResponseDTO> prescricoes
) {
    public AnamneseResponseDTO(Anamnese a) {
        this(
                a.getId(),
                a.getQueixaPrincipal(),
                a.getHistoriaMolestiaPrincipal(),
                a.getExameFisico(),
                a.getHipoteseDiagnostica(),
                a.getSolicitacaoDeExames(),
                a.getEncaminhamento(),
                a.getCondutaMedica(),
                a.getCid(),

                a.getPrescricoes() != null && !a.getPrescricoes().isEmpty()
                        ? a.getPrescricoes().stream().map(PrescricaoResponseDTO::new).toList()
                        : new ArrayList<>()
        );
    }
}
