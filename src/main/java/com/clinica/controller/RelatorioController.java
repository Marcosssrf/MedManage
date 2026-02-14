package com.clinica.controller;

import com.clinica.service.RelatorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Month;
import java.util.Map;

@RestController
@RequestMapping(value = "/relatorios")
public class RelatorioController {

	@Autowired
	RelatorioService relatorioService;

	//http://localhost:8080/relatorios/faturamento?ano=2026
	@GetMapping("/faturamento")
	public ResponseEntity<Map<Month, Double>> faturamentoPorMes(@RequestParam int ano) {
		return ResponseEntity.ok(relatorioService.faturamentoPorMes(ano));
	}
	//
	@GetMapping("/medico-mais-atendido")
	public ResponseEntity<?> medicoMaisAtendido() {
		return ResponseEntity.ok(relatorioService.medicoMaisAtendido());
	}

}
