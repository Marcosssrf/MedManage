package com.clinica.repository;

import com.clinica.dto.resposta.PacienteResponseGetAll;
import com.clinica.model.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    @Override
    @EntityGraph(attributePaths = {"usuario"})
    List<Paciente> findAll();

    // Listagem simples sem filtro (mantida para compatibilidade)
    @Query("SELECT new com.clinica.dto.resposta.PacienteResponseGetAll(p.id, p.nome, p.cpf, p.telefone, p.email, p.ativo) FROM Paciente p")
    List<PacienteResponseGetAll> findAllPacientesDTO();

    // ─── Busca paginada ───────────────────────────────────────────────────────
    // Busca por nome, CPF, email ou telefone (parcial, case-insensitive).
    // Quando search é null/blank, retorna todos sem filtro de texto.
    // O parâmetro "ativo" filtra pelo status; null = retorna ambos.
    @Query("""
    SELECT new com.clinica.dto.resposta.PacienteResponseGetAll(
        p.id, p.nome, p.cpf, p.telefone, p.email, p.ativo
    )
    FROM Paciente p
    WHERE p.ativo = :ativo
      AND (CAST(:search AS string) IS NULL
           OR LOWER(p.nome)     LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.cpf)      LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.email)    LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.telefone) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    ORDER BY p.nome ASC
    """)
    Page<PacienteResponseGetAll> buscarPorAtivoESearch(
            @Param("ativo") boolean ativo,
            @Param("search") String search,
            Pageable pageable);

    @Query("""
    SELECT new com.clinica.dto.resposta.PacienteResponseGetAll(
        p.id, p.nome, p.cpf, p.telefone, p.email, p.ativo
    )
    FROM Paciente p
    WHERE (CAST(:search AS string) IS NULL
           OR LOWER(p.nome)     LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.cpf)      LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.email)    LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.telefone) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    ORDER BY p.nome ASC
    """)
    Page<PacienteResponseGetAll> buscarTodosComSearch(
            @Param("search") String search,
            Pageable pageable);
}