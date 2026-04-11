package com.clinica.service;

import com.clinica.dto.MedicoMaisAtendidoDTO;
import com.clinica.model.Consulta;
import com.clinica.model.Medico;
import com.clinica.model.Pagamento;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.model.enums.StatusPagamento;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RelatorioService {

	@Autowired
	ConsultaRepository consultaRepository;

	@Autowired
	PagamentoRepository pagamentoRepository;

	public Map<Month, Double> faturamentoPorMes(int ano) {
		List<Object[]> resultado = pagamentoRepository.faturamentoPorAno(ano);

		Map<Month, Double> faturamento = new HashMap<>();
		for (Object[] row : resultado) {
			int mesNumero = ((Double) row[0]).intValue();
			double valor  = ((Number) row[1]).doubleValue();
			faturamento.put(Month.of(mesNumero), valor);
		}
		return faturamento;
	}

	public MedicoMaisAtendidoDTO medicoMaisAtendido() {
		List<Object[]> resultado = consultaRepository.medicoMaisAtendido();

		if (resultado.isEmpty()) return null;

		Object[] top = resultado.get(0);
		String nome = (String) top[0];
		Long total = (Long) top[1];

		return new MedicoMaisAtendidoDTO(null, nome, total);
	}

}
