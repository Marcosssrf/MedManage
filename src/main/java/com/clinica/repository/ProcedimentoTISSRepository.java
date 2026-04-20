package com.clinica.repository;

import com.clinica.dto.resposta.ProcedimentoTISSResponseDTO;
import com.clinica.model.ProcedimentoTISS;
import com.clinica.model.enums.StatusAutorizacaoTISS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ProcedimentoTISSRepository extends JpaRepository<ProcedimentoTISS, UUID> {

    @Query("""
        SELECT new com.clinica.dto.resposta.ProcedimentoTISSResponseDTO(
            p.id, p.codigoProcedimento, p.descricao,
            p.valor, p.quantidade, p.dataExecucao,
            p.numeroGuia, p.numeroAutorizacao,
            CAST(p.statusAutorizacao AS string),
            CAST(p.tipoAtendimento AS string),
            CAST(p.viaAcesso AS string),
            p.observacoes,
            c.id, pac.nome, m.nome, m.crm,
            cv.id, cv.nome, cv.registroANS,
            p.dataCadastro, p.dataAtualizacao
        )
        FROM ProcedimentoTISS p
        JOIN p.consulta c
        JOIN c.paciente pac
        JOIN c.medico m
        LEFT JOIN p.convenio cv
    """)
    List<ProcedimentoTISSResponseDTO> buscarListagemOtimizada();

    // Busca por consulta (todos os procedimentos de uma consulta)
    List<ProcedimentoTISS> findByConsultaId(UUID consultaId);

    // Busca por status de autorização (para faturamento)
    List<ProcedimentoTISS> findByStatusAutorizacao(StatusAutorizacaoTISS status);

    // Busca por convênio e período — útil para geração de guias TISS
    @Query("""
        SELECT p FROM ProcedimentoTISS p
        WHERE p.convenio.id = :convenioId
        AND p.dataExecucao BETWEEN :inicio AND :fim
        AND p.statusAutorizacao = :status
        ORDER BY p.dataExecucao
    """)
    List<ProcedimentoTISS> findByConvenioEPeriodo(
            @Param("convenioId") UUID convenioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            @Param("status") StatusAutorizacaoTISS status
    );

    // Verifica duplicidade de guia
    boolean existsByNumeroGuia(String numeroGuia);
}