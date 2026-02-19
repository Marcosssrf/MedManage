package com.clinica.controller;

import com.clinica.dto.PagamentoDTO;
import com.clinica.model.Pagamento;
import com.clinica.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<List<Pagamento>> findAll() {
		List<Pagamento> pagamentos = pagamentoService.findAll();
		return ResponseEntity.ok().body(pagamentos);
	}

	@GetMapping(value = "/{id}")
	public ResponseEntity<Pagamento> findById(@PathVariable UUID id){
		Pagamento pagamento = pagamentoService.findById(id);
		return ResponseEntity.ok().body(pagamento);
	}

	@PostMapping
	public ResponseEntity<Pagamento> insert(@RequestBody @Valid PagamentoDTO dto) {
		Pagamento pagamento = pagamentoService.insert(dto);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(pagamento.getId()).toUri();
		return ResponseEntity.created(uri).body(pagamento);
	}


	@PatchMapping(value = "/{id}/confirmar")
	public ResponseEntity<Pagamento> confirmarPagamento(@PathVariable UUID id){
		Pagamento pagamento = pagamentoService.confirmarPagamento(id);
		return ResponseEntity.ok(pagamento);
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
