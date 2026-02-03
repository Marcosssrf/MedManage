package com.clinica.repository;

import com.clinica.model.Consulta;
import com.clinica.model.enums.StatusConsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {

	List<Consulta> findByPacienteNomeContainingIgnoreCase(String nome);
	List<Consulta> findByMedicoNomeContainingIgnoreCase(String nome);
	boolean existsByMedicoIdAndDataHora(Integer idMedico, LocalDateTime dataHora);
	List<Consulta> findByStatus(StatusConsulta status);

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
