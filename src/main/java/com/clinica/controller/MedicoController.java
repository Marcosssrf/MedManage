package com.clinica.controller;

import com.clinica.model.Consulta;
import com.clinica.model.Medico;
import com.clinica.service.MedicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

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
	public ResponseEntity<Medico> findById(@PathVariable Integer id){
		Medico medico = medicoService.findById(id);
		return ResponseEntity.ok().body(medico);
	}

	@PostMapping
	public ResponseEntity<Medico> insert(@RequestBody Medico medico) {
		medico = medicoService.insert(medico);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(medico.getId()).toUri();
		return ResponseEntity.created(uri).body(medico);
	}

	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Medico> delete(@PathVariable Integer id) {
		medicoService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping(value = "/{id}")
	public ResponseEntity<Medico> update(@PathVariable Integer id, @RequestBody Medico medico) {
		medico = medicoService.update(id, medico);
		return ResponseEntity.ok().body(medico);
	}



}
