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

		List<Pagamento> pagamentos = pagamentoRepository.findByStatusPagamento(StatusPagamento.PAGO);

		Map<Month, Double> faturamento = new HashMap<>();

		for (Pagamento pagamento : pagamentos) {
			if (pagamento.getDataPagamento().getYear() == ano) {

				Month mes = pagamento.getDataPagamento().getMonth();

				faturamento.put(mes, faturamento.getOrDefault(mes, 0.0) + pagamento.getValor());}}

		return faturamento;
	}

	public MedicoMaisAtendidoDTO medicoMaisAtendido() {

		List<Consulta> consultas = consultaRepository
				.findByStatus(StatusConsulta.REALIZADA);

		Map<Medico, Long> contador = new HashMap<>();

		for (Consulta consulta : consultas) {
			Medico medico = consulta.getMedico();
			contador.put(medico, contador.getOrDefault(medico, 0L) + 1);
		}

		return contador.entrySet().stream().max(Map.Entry.comparingByValue()).map(e -> new MedicoMaisAtendidoDTO(e.getKey().getId(), e.getKey().getNome(), e.getValue())).orElse(null);
	}

}
