package com.clinica.repository;

import com.clinica.model.BloqueioAgenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BloqueioAgendaRepository extends JpaRepository<BloqueioAgenda, UUID> {

    // Todos os bloqueios (ativos ou não), ordenados por dataInicio
    List<BloqueioAgenda> findAllByOrderByDataInicioDesc();

    // Bloqueios de um médico específico
    List<BloqueioAgenda> findByMedicoIdOrderByDataInicioDesc(UUID medicoId);

    // Bloqueios gerais (sem médico vinculado)
    List<BloqueioAgenda> findByMedicoIsNullOrderByDataInicioDesc();

    // Verifica se uma data está bloqueada para um médico (bloqueio do médico OU geral da clínica)
    @Query("""
            SELECT COUNT(b) > 0 FROM BloqueioAgenda b
            WHERE b.ativo = true
              AND :data BETWEEN b.dataInicio AND b.dataFim
              AND (b.medico.id = :medicoId OR b.medico IS NULL)
            """)
    boolean existsBloqueioParaMedicoNaData(@Param("medicoId") UUID medicoId,
                                           @Param("data") LocalDate data);

    // Retorna bloqueios ativos que se sobrepõem a um intervalo de datas
    @Query("""
            SELECT b FROM BloqueioAgenda b
            WHERE b.ativo = true
              AND b.dataInicio <= :dataFim
              AND b.dataFim   >= :dataInicio
              AND (b.medico.id = :medicoId OR b.medico IS NULL)
            """)
    List<BloqueioAgenda> findBloqueiosAtivosNoIntervalo(@Param("medicoId") UUID medicoId,
                                                        @Param("dataInicio") LocalDate dataInicio,
                                                        @Param("dataFim") LocalDate dataFim);
}
