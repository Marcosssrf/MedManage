package com.clinica.repository;

import com.clinica.model.Paciente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    // Mata o N+1 na listagem de pacientes
    @Override
    @EntityGraph(attributePaths = {"usuario"})
    List<Paciente> findAll();

}