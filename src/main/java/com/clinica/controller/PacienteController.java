package com.clinica.controller;

import com.clinica.model.Paciente;
import com.clinica.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/pacientes")
public class PacienteController {

	@Autowired
	PacienteService pacienteService;

	@GetMapping
	public ResponseEntity<List<Paciente>> findAll() {
		List<Paciente> pacientes = pacienteService.findAll();
		return ResponseEntity.ok().body(pacientes);
	}

	@PostMapping
	public ResponseEntity<Paciente> insert(@RequestBody Paciente paciente) {
		paciente = pacienteService.insert(paciente);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(paciente.getId()).toUri();
		return ResponseEntity.created(uri).body(paciente);
	}

	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Paciente> delete(@PathVariable Integer id) {
		pacienteService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping(value = "/{id}")
	public ResponseEntity<Paciente> update(@PathVariable Integer id, @RequestBody Paciente paciente) {
		paciente = pacienteService.update(id, paciente);
		return ResponseEntity.ok().body(paciente);
	}
}
