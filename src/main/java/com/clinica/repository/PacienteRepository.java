package com.clinica.repository;

import com.clinica.dto.resposta.PacienteResponseGetAll;
import com.clinica.model.Paciente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    @Override
    @EntityGraph(attributePaths = {"usuario"})
    List<Paciente> findAll();

    @Query("SELECT new com.clinica.dto.resposta.PacienteResponseGetAll(p.id, p.nome, p.cpf, p.telefone, p.email, p.ativo) FROM Paciente p")
    List<PacienteResponseGetAll> findAllPacientesDTO();

}