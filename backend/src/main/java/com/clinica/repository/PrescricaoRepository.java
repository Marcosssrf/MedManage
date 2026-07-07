package com.clinica.repository;

import com.clinica.model.Prescricao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PrescricaoRepository extends JpaRepository<Prescricao, UUID> {
}
