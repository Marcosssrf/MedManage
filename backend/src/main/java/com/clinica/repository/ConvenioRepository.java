package com.clinica.repository;

import com.clinica.model.Convenio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConvenioRepository extends JpaRepository<Convenio, UUID> {
    Optional<Convenio> findByNome(String nome);
}
