package com.clinica.repository;

import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.model.Pagamento;
import com.clinica.model.enums.StatusPagamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {

	@Override
	@EntityGraph(attributePaths = {
			"consulta",
			"consulta.paciente",
			"consulta.medico"
	})
	List<Pagamento> findAll();

	@EntityGraph(attributePaths = {"consulta.paciente", "consulta.medico"})
	List<Pagamento> findByStatusPagamento(StatusPagamento statusPagamento);

	boolean existsByConsultaIdAndStatusPagamento(UUID consultaId, StatusPagamento statusPagamento);

	@Query("""
        SELECT
            YEAR(p.dataPagamento),
            MONTH(p.dataPagamento),
            SUM(p.valor)
        FROM Pagamento p
        WHERE p.statusPagamento = com.clinica.model.enums.StatusPagamento.PAGO
        GROUP BY YEAR(p.dataPagamento), MONTH(p.dataPagamento)
        ORDER BY YEAR(p.dataPagamento), MONTH(p.dataPagamento)
    """)
	List<Object[]> faturamentoPorMes();

	@Query("""
        SELECT SUM(p.valor)
        FROM Pagamento p
        WHERE p.statusPagamento = com.clinica.model.enums.StatusPagamento.PAGO
        AND MONTH(p.dataPagamento) = MONTH(CURRENT_DATE)
        AND YEAR(p.dataPagamento) = YEAR(CURRENT_DATE)
    """)
	java.math.BigDecimal sumFaturamentoMesAtual();

	@Query("""
        SELECT new com.clinica.dto.resposta.PagamentoResponseDTO(
            p.id,
            CAST(p.tipoPagamento AS string),
            CAST(p.formaPagamento AS string),
            p.dataPagamento,
            p.valor,
            p.numeroParcelas,
            cv.id, cv.nome,
            CAST(p.statusPagamento AS string),
            c.id, pac.nome, m.nome
        )
        FROM Pagamento p
        JOIN p.consulta c
        JOIN c.paciente pac
        JOIN c.medico m
        LEFT JOIN p.convenio cv
    """)
	List<PagamentoResponseDTO> buscarListagemOtimizada();

	@Query("""
    SELECT EXTRACT(MONTH FROM p.dataPagamento), SUM(p.valor)
    FROM Pagamento p
    WHERE p.statusPagamento = 'PAGO'
    AND EXTRACT(YEAR FROM p.dataPagamento) = :ano
    GROUP BY EXTRACT(MONTH FROM p.dataPagamento)
""")
	List<Object[]> faturamentoPorAno(@Param("ano") int ano);

	// ─── Busca paginada ───────────────────────────────────────────────────────
	// Filtra por: texto livre (nome paciente ou médico), status e intervalo de datas.
	// Todos os parâmetros são opcionais (null = sem filtro).
	@Query("""
   SELECT new com.clinica.dto.resposta.PagamentoResponseDTO(
      p.id,
      CAST(p.tipoPagamento AS string),
      CAST(p.formaPagamento AS string),
      p.dataPagamento,
      p.valor,
      p.numeroParcelas,
      cv.id, cv.nome,
      CAST(p.statusPagamento AS string),
      c.id, pac.nome, m.nome
   )
   FROM Pagamento p
   JOIN p.consulta c
   JOIN c.paciente pac
   JOIN c.medico m
   LEFT JOIN p.convenio cv
		WHERE (CAST(:status AS string) IS NULL OR CAST(p.statusPagamento AS string) = CAST(:status AS string))
		  AND (p.dataPagamento IS NULL OR p.dataPagamento >= :dataInicio)
		  AND (p.dataPagamento IS NULL OR p.dataPagamento <= :dataFim)
		  AND (CAST(:search AS string) IS NULL
			  OR LOWER(pac.nome) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
			  OR LOWER(m.nome)   LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
   ORDER BY p.dataPagamento DESC
   """)
	Page<PagamentoResponseDTO> buscarPaginado(
			@Param("search")     String search,
			@Param("status")     String status,
			@Param("dataInicio") LocalDate dataInicio,
			@Param("dataFim")    LocalDate dataFim,
			Pageable pageable
	);
}