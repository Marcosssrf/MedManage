package com.clinica.controller;

import com.clinica.dto.PagamentoDTO;
import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.dto.resposta.PaginaDTO;
import com.clinica.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping(value = "/pagamentos")
public class PagamentoController {

	@Autowired
	private PagamentoService pagamentoService;

	// ─── GET /pagamentos ──────────────────────────────────────────────────────
	// Parâmetros (todos opcionais):
	//   search     → busca livre por nome do paciente ou médico
	//   status     → PAGO | PENDENTE | CANCELADO (omitir = todos)
	//   dataInicio → filtro de data início (formato: yyyy-MM-dd)
	//   dataFim    → filtro de data fim (formato: yyyy-MM-dd)
	//   page       → número da página, base 0 (padrão: 0)
	//   size       → itens por página (padrão: 20, máx: 100)
	//
	// Exemplos:
	//   GET /pagamentos                                    → página 0, todos
	//   GET /pagamentos?status=PENDENTE                    → só pendentes
	//   GET /pagamentos?search=carlos&status=PAGO          → busca "carlos", pagos
	//   GET /pagamentos?dataInicio=2025-01-01&dataFim=2025-03-31 → por período
	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<PaginaDTO<PagamentoResponseDTO>> findAll(
			@RequestParam(required = false)                                  String    search,
			@RequestParam(required = false)                                  String    status,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
			@RequestParam(defaultValue = "0")                                int       page,
			@RequestParam(defaultValue = "20")                               int       size
	) {
		return ResponseEntity.ok(
				pagamentoService.buscarPaginado(search, status, dataInicio, dataFim, page, size)
		);
	}

	@GetMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<PagamentoResponseDTO> findById(@PathVariable UUID id){
		return ResponseEntity.ok().body(pagamentoService.findById(id));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<PagamentoResponseDTO> insert(@RequestBody @Valid PagamentoDTO dto) {
		PagamentoResponseDTO pagamento = pagamentoService.insert(dto);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(pagamento.id()).toUri();
		return ResponseEntity.created(uri).body(pagamento);
	}

	@PatchMapping(value = "/{id}/confirmar")
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<PagamentoResponseDTO> confirmarPagamento(@PathVariable UUID id){
		return ResponseEntity.ok(pagamentoService.confirmarPagamento(id));
	}
}