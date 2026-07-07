package com.clinica.controller;

import com.clinica.dto.MedicoDTO;
import com.clinica.dto.resposta.MedicoResumoDTO;
import com.clinica.dto.resposta.PaginaDTO;
import com.clinica.dto.update.MedicoUpdateDTO;
import com.clinica.model.Medico;
import com.clinica.service.MedicoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping(value = "/medicos")
public class MedicoController {

	@Autowired
	MedicoService medicoService;

	@GetMapping
	public ResponseEntity<PaginaDTO<MedicoResumoDTO>> findAll(
			@RequestParam(required = false)    String  search,
			@RequestParam(required = false)    Boolean ativo,
			@RequestParam(defaultValue = "0")  int     page,
			@RequestParam(defaultValue = "20") int     size
	) {
		return ResponseEntity.ok(medicoService.buscarPaginado(search, ativo, page, size));
	}

	@GetMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<Medico> findById(@PathVariable UUID id){
		Medico medico = medicoService.findById(id);
		return ResponseEntity.ok().body(medico);
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Medico> insert(@RequestBody @Valid MedicoDTO dto) {
		Medico medico = medicoService.insert(dto);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(medico.getId())
				.toUri();
		return ResponseEntity.created(uri).body(medico);
	}

	@PatchMapping(value = "/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Medico> patch(@PathVariable UUID id, @RequestBody @Valid MedicoUpdateDTO dto){
		return ResponseEntity.ok(medicoService.patch(id,dto));
	}

//	@PutMapping(value = "/{id}")
//	public ResponseEntity<Medico> update(@PathVariable UUID id, @RequestBody @Valid MedicoDTO dto) {
//		Medico medico = medicoService.update(id, dto);
//		return ResponseEntity.ok().body(medico);
//	}

//	@DeleteMapping(value = "/{id}")
//	public ResponseEntity<Medico> delete(@PathVariable UUID id) {
//		medicoService.delete(id);
//		return ResponseEntity.noContent().build();
//	}


}
