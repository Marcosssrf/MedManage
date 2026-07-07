package com.clinica.repository;

import com.clinica.model.HorarioTrabalhoMedico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HorarioTrabalhoMedicoRepository extends JpaRepository<HorarioTrabalhoMedico, UUID> {
    List<HorarioTrabalhoMedico> findByMedicoId(UUID medicoId);

    boolean existsByMedicoIdAndDiaSemana(UUID medicoId, DayOfWeek diaSemana);

    void deleteByMedicoId(UUID medicoId);

    Optional<HorarioTrabalhoMedico> findByMedicoIdAndDiaSemana(UUID medicoId, DayOfWeek diaSemana);
}
