package com.clinica.controller;

import com.clinica.dto.PagamentoDTO;
import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/pagamentos")
public class PagamentoController {

	@Autowired
	private PagamentoService pagamentoService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<List<PagamentoResponseDTO>> findAll() {
		return ResponseEntity.ok(pagamentoService.findAll());
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

//	@PutMapping(value = "/{id}")
//	public ResponseEntity<Pagamento> update(@PathVariable UUID id,@RequestBody @Valid PagamentoDTO dto) {
//		Pagamento pagamento = pagamentoService.update(id, dto);
//		return ResponseEntity.ok().body(pagamento);
//	}

//	@DeleteMapping(value = "/{id}")
//	public ResponseEntity<Pagamento> delete(@PathVariable UUID id) {
//		pagamentoService.delete(id);
//		return ResponseEntity.noContent().build();
//	}
//
}
