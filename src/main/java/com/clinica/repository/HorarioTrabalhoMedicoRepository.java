package com.clinica.repository;

import com.clinica.model.HorarioTrabalhoMedico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HorarioTrabalhoMedicoRepository extends JpaRepository<HorarioTrabalhoMedico, UUID> {
}
