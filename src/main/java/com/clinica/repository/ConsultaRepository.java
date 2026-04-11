package com.clinica.repository;

import com.clinica.dto.resposta.ConsultaResponseGetAll;
import com.clinica.model.Consulta;
import com.clinica.model.enums.StatusConsulta;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ConsultaRepository extends JpaRepository<Consulta, UUID>, JpaSpecificationExecutor<Consulta> {

	// ==============================================================================
	// 1. BULK UPDATES (Atualização em massa para salvar a performance)
	// ==============================================================================
	@Modifying
	@Query("UPDATE Consulta c SET c.status = :statusRealizada WHERE c.dataHora < :agora AND c.status NOT IN (:statusRealizada, :statusCancelada)")
	void atualizarStatusParaRealizada(@Param("agora") LocalDateTime agora, @Param("statusRealizada") StatusConsulta statusRealizada, @Param("statusCancelada") StatusConsulta statusCancelada);

	@Modifying
	@Query("UPDATE Consulta c SET c.status = :statusConfirmada WHERE c.dataHora >= :agora AND c.dataHora < :limite24h AND c.status NOT IN (:statusRealizada, :statusCancelada, :statusConfirmada)")
	void atualizarStatusParaConfirmada(@Param("agora") LocalDateTime agora, @Param("limite24h") LocalDateTime limite24h, @Param("statusConfirmada") StatusConsulta statusConfirmada, @Param("statusRealizada") StatusConsulta statusRealizada, @Param("statusCancelada") StatusConsulta statusCancelada);

	// ==============================================================================
	// 2. QUERY OTIMIZADA PARA A LISTAGEM (Solução do Postgres bytea)
	// ==============================================================================
	@Query("""
    SELECT new com.clinica.dto.resposta.ConsultaResponseGetAll(
        c.id, c.dataHora, p.nome, m.nome, m.especialidade,
        CAST(c.status AS string),
        CAST(c.tipoConsulta AS string),
        c.observacoes
    )
    FROM Consulta c
    JOIN c.paciente p
    JOIN c.medico m
    WHERE (CAST(:dataInicio AS java.time.LocalDateTime) IS NULL OR c.dataHora >= :dataInicio)
      AND (CAST(:dataFim    AS java.time.LocalDateTime) IS NULL OR c.dataHora <= :dataFim)
      AND (:paciente IS NULL OR LOWER(p.nome) LIKE :paciente)
      AND (:medico   IS NULL OR LOWER(m.nome) LIKE :medico)
""")
	List<ConsultaResponseGetAll> findByFiltrosAvancados(
			@Param("dataInicio") LocalDateTime dataInicio,
			@Param("dataFim") LocalDateTime dataFim,
			@Param("paciente") String paciente,
			@Param("medico") String medico
	);

	// ==============================================================================
	// 3. MÉTODOS ORIGINAIS MANTIDOS
	// ==============================================================================
	@Override
	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findAll();

	@Query("SELECT c FROM Consulta c " +
			"JOIN FETCH c.medico m " +
			"JOIN FETCH c.paciente p " +
			"WHERE upper(m.nome) LIKE upper(concat('%', :nomeMedico, '%'))")
	List<Consulta> buscarConsultasPorMedico(String nomeMedico);

	@Query("SELECT COUNT(c) FROM Consulta c WHERE c.dataHora >= :inicioDoDia AND c.dataHora < :fimDoDia")
	Long countConsultasHoje(@Param("inicioDoDia") java.time.LocalDateTime inicioDoDia, @Param("fimDoDia") java.time.LocalDateTime fimDoDia);

	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findByPacienteNomeContainingIgnoreCase(String nome);

	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findByMedicoNomeContainingIgnoreCase(String nome);

	@Query("""
    SELECT new com.clinica.dto.resposta.ConsultaResponseGetAll(
        c.id, c.dataHora, p.nome, m.nome, m.especialidade,
        CAST(c.status AS string),
        CAST(c.tipoConsulta AS string),
        c.observacoes
    )
    FROM Consulta c
    JOIN c.paciente p
    JOIN c.medico m
    WHERE c.status = :status
""")
	List<ConsultaResponseGetAll> findByStatusDTO(@Param("status") StatusConsulta status);

	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findByDataHora(LocalDateTime dataHora);

	boolean existsByMedicoIdAndDataHora(UUID idMedico, LocalDateTime dataHora);

	boolean existsByPacienteIdAndDataHora(UUID idPaciente, LocalDateTime dataHora);

	@Query("""
        SELECT 
            c.medico.nome,
            COUNT(c)
        FROM Consulta c
        WHERE c.status = com.clinica.model.enums.StatusConsulta.REALIZADA
        GROUP BY c.medico.nome
        ORDER BY COUNT(c) DESC
    """)
	List<Object[]> medicoMaisAtendido();

	long countByMedicoIdAndDataHoraBetween(UUID medicoId, LocalDateTime inicio, LocalDateTime fim);

	boolean existsByMedicoIdAndDataHoraAndIdNot(UUID medicoId, LocalDateTime dataHora, UUID id);
	boolean existsByPacienteIdAndDataHoraAndIdNot(UUID pacienteId, LocalDateTime dataHora, UUID id);

	@Query("""
    SELECT COUNT(c) > 0 FROM Consulta c
    WHERE c.medico.id = :medicoId
    AND c.status != 'CANCELADA'
    AND c.dataHora < :fim
    AND FUNCTION('TIMESTAMPADD', MINUTE, c.duracaoPrevistaMinutos, c.dataHora) > :inicio
""")
	boolean existsConflitoMedico(
			@Param("medicoId") UUID medicoId,
			@Param("inicio") LocalDateTime inicio,
			@Param("fim") LocalDateTime fim
	);

	@Query("""
    SELECT COUNT(c) > 0 FROM Consulta c
    WHERE c.paciente.id = :pacienteId
    AND c.status != 'CANCELADA'
    AND c.dataHora < :fim
    AND FUNCTION('TIMESTAMPADD', MINUTE, c.duracaoPrevistaMinutos, c.dataHora) > :inicio
""")
	boolean existsConflitoPaciente(
			@Param("pacienteId") UUID pacienteId,
			@Param("inicio") LocalDateTime inicio,
			@Param("fim") LocalDateTime fim
	);

}