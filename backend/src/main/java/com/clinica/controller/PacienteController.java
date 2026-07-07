package com.clinica.controller;

import com.clinica.dto.PacienteDTO;
import com.clinica.dto.resposta.PacienteResponseDTO;
import com.clinica.dto.resposta.PacienteResponseGetAll;
import com.clinica.dto.resposta.PaginaDTO;
import com.clinica.dto.update.PacienteUpdateDTO;
import com.clinica.model.Paciente;
import com.clinica.service.PacienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping(value = "/pacientes")
public class PacienteController {

	@Autowired
	PacienteService pacienteService;

	// ─── GET /pacientes ───────────────────────────────────────────────────────
	// Parâmetros (todos opcionais):
	//   search  → busca livre por nome, CPF, email ou telefone
	//   ativo   → true | false (omitir = retorna ambos)
	//   page    → número da página, base 0 (padrão: 0)
	//   size    → itens por página (padrão: 20, máx: 100)
	//
	// Exemplos:
	//   GET /pacientes                           → página 0, todos ativos+inativos
	//   GET /pacientes?search=carlos             → busca "carlos", todos os status
	//   GET /pacientes?search=carlos&ativo=true  → busca "carlos", só ativos
	//   GET /pacientes?ativo=false&page=1&size=5 → inativos, 2ª página
	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<PaginaDTO<PacienteResponseGetAll>> findAll(
			@RequestParam(required = false)              String  search,
			@RequestParam(required = false)              Boolean ativo,
			@RequestParam(defaultValue = "0")            int     page,
			@RequestParam(defaultValue = "20")           int     size
	) {
		PaginaDTO<PacienteResponseGetAll> resultado =
				pacienteService.buscarPaginado(search, ativo, page, size);
		return ResponseEntity.ok(resultado);
	}

	@GetMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<PacienteResponseDTO> findById(@PathVariable UUID id) {
		return ResponseEntity.ok(PacienteResponseDTO.from(pacienteService.findById(id)));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<PacienteResponseDTO> insert(@RequestBody @Valid PacienteDTO dto) {
		Paciente paciente = pacienteService.insert(dto);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(paciente.getId())
				.toUri();
		return ResponseEntity.created(uri).body(PacienteResponseDTO.from(paciente));
	}

	@PatchMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<PacienteResponseDTO> patch(
			@PathVariable UUID id,
			@RequestBody @Valid PacienteUpdateDTO dto
	) {
		return ResponseEntity.ok(PacienteResponseDTO.from(pacienteService.patch(id, dto)));
	}
}