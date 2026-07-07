package com.clinica.repository;

import com.clinica.dto.resposta.MedicoResumoDTO;
import com.clinica.model.Medico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MedicoRepository extends JpaRepository<Medico, UUID> {

    @Override
    @EntityGraph(attributePaths = {"usuario"})
    List<Medico> findAll();

    @Query("""
        SELECT new com.clinica.dto.resposta.MedicoResumoDTO(
            m.id, m.nome, m.crm, m.crmEstado, m.especialidade, m.email, m.telefone, m.ativo
        )
        FROM Medico m
        WHERE m.ativo = :ativo
          AND (CAST(:search AS string) IS NULL
               OR LOWER(m.nome)         LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.crm)          LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.cpf)          LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.especialidade) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.email)        LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        ORDER BY m.nome ASC
        """)
    Page<MedicoResumoDTO> buscarPorAtivoESearch(
            @Param("ativo") boolean ativo,
            @Param("search") String search,
            Pageable pageable);

    @Query("""
        SELECT new com.clinica.dto.resposta.MedicoResumoDTO(
            m.id, m.nome, m.crm, m.crmEstado, m.especialidade, m.email, m.telefone, m.ativo
        )
        FROM Medico m
        WHERE (CAST(:search AS string) IS NULL
               OR LOWER(m.nome)         LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.crm)          LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.cpf)          LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.especialidade) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(m.email)        LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        ORDER BY m.nome ASC
        """)
    Page<MedicoResumoDTO> buscarTodosComSearch(
            @Param("search") String search,
            Pageable pageable);
}