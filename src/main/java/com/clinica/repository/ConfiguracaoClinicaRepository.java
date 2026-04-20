package com.clinica.repository;

import com.clinica.model.ConfiguracaoClinica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConfiguracaoClinicaRepository extends JpaRepository<ConfiguracaoClinica, UUID> {
//    Optional<ConfiguracaoClinica> findFirst();
}
