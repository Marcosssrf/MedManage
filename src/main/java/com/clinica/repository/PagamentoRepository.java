package com.clinica.repository;

import com.clinica.model.Pagamento;
import com.clinica.model.enums.StatusPagamento;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {

	// 1. MATANDO O N+1 DA LISTAGEM GERAL
	// Sobrescrevemos o findAll padrão para carregar a Consulta de uma vez só
	@Override
	@EntityGraph(attributePaths = {"consulta"})
	List<Pagamento> findAll();

	// 2. MATANDO O N+1 NA BUSCA POR STATUS
	@EntityGraph(attributePaths = {"consulta"})
	List<Pagamento> findByStatusPagamento(StatusPagamento statusPagamento);

	// Métodos de validação (exists) não trazem entidades, então não sofrem de N+1
	boolean existsByConsultaIdAndStatusPagamento(UUID consultaId, StatusPagamento statusPagamento);

	// A sua query de faturamento já é perfeita! Como ela retorna Object[] com
	// a soma (SUM) direta do banco, o Hibernate não faz N+1 aqui.
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
}