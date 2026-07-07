package com.clinica.repository;

import com.clinica.model.HistoricoClinico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HistoricoClinicoRepository extends JpaRepository<HistoricoClinico, UUID> {
    boolean existsHistoricoClinicoByPacienteId(UUID pacienteId);
    List<HistoricoClinico> findByPacienteId(UUID pacienteId);

}
