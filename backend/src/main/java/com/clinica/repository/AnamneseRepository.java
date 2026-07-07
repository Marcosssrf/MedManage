package com.clinica.repository;

import com.clinica.model.Anamnese;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnamneseRepository extends JpaRepository<Anamnese, UUID> {
    boolean existsByConsultaId(UUID consultaId);
    Optional<Anamnese> findByConsultaId(UUID consultaId);
}
