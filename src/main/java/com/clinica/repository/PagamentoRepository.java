package com.clinica.repository;

import com.clinica.model.Pagamento;
import com.clinica.model.enums.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {

	boolean existsByConsultaIdAndStatusPagamento(UUID consultaId, StatusPagamento statusPagamento);

	List<Pagamento> findByStatusPagamento(StatusPagamento statusPagamento);

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


