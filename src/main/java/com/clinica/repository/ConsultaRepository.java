package com.clinica.repository;

import com.clinica.model.Consulta;
import com.clinica.model.enums.StatusConsulta;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ConsultaRepository extends JpaRepository<Consulta, UUID>, JpaSpecificationExecutor<Consulta> {

	// 1. MATANDO O N+1 DA LISTAGEM PRINCIPAL
	// Sobrescrevemos o findAll() padrão do JpaRepository só para adicionar o EntityGraph
	@Override
	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findAll();

	// 2. MATANDO O N+1 DOS SEUS FILTROS PERSONALIZADOS
	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findByPacienteNomeContainingIgnoreCase(String nome);

	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findByMedicoNomeContainingIgnoreCase(String nome);

	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findByStatus(StatusConsulta status);

	@EntityGraph(attributePaths = {"medico", "paciente"})
	List<Consulta> findByDataHora(LocalDateTime dataHora);

	// Métodos de validação (exists) não precisam do EntityGraph, pois só retornam true/false
	boolean existsByMedicoIdAndDataHora(UUID idMedico, LocalDateTime dataHora);

	// A sua query personalizada já está perfeita!
	// Como ela traz apenas o nome (String) e o Count (Long), o N+1 não acontece aqui.
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

}