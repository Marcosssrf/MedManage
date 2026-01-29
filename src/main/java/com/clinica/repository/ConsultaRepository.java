package com.clinica.repository;

import com.clinica.model.Consulta;
import com.clinica.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {

	List<Consulta> findByPacienteNomeContainingIgnoreCase(String nome);
	List<Consulta> findByMedicoNomeContainingIgnoreCase(String nome);

}
