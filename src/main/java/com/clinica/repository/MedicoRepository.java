package com.clinica.repository;

import com.clinica.model.Medico;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicoRepository extends JpaRepository<Medico, UUID> {

    // Mata o N+1 na listagem de médicos
    @Override
    @EntityGraph(attributePaths = {"usuario"})
    List<Medico> findAll();

}