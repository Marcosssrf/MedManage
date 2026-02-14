package com.clinica.controller;

import com.clinica.dto.MedicoDTO;
import com.clinica.dto.update.MedicoUpdateDTO;
import com.clinica.model.Medico;
import com.clinica.service.MedicoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/medicos")
public class MedicoController {

	@Autowired
	MedicoService medicoService;

	@GetMapping
	public ResponseEntity<List<Medico>> findAll() {
		List<Medico> medicos = medicoService.findAll();
		return ResponseEntity.ok().body(medicos);
	}

	@GetMapping(value = "/{id}")
	public ResponseEntity<Medico> findById(@PathVariable UUID id){
		Medico medico = medicoService.findById(id);
		return ResponseEntity.ok().body(medico);
	}

	@PostMapping
	public ResponseEntity<Medico> insert(@RequestBody @Valid MedicoDTO dto) {
		Medico medico = medicoService.insert(dto);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(medico.getId())
				.toUri();
		return ResponseEntity.created(uri).body(medico);
	}

	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Medico> delete(@PathVariable UUID id) {
		medicoService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping(value = "/{id}")
	public ResponseEntity<Medico> update(@PathVariable UUID id, @RequestBody @Valid MedicoDTO dto) {
		Medico medico = medicoService.update(id, dto);
		return ResponseEntity.ok().body(medico);
	}

	@PatchMapping(value = "/{id}")
	public ResponseEntity<Medico> patch(@PathVariable UUID id, @RequestBody @Valid MedicoUpdateDTO dto){
		return ResponseEntity.ok(medicoService.patch(id,dto));
	}


}
