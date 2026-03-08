package com.clinica.controller;

import com.clinica.dto.PacienteDTO;
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
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/pacientes")
public class PacienteController {

	@Autowired
	PacienteService pacienteService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<List<Paciente>> findAll() {
		List<Paciente> pacientes = pacienteService.findAll();
		return ResponseEntity.ok().body(pacientes);
	}

	@GetMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<Paciente> findById(@PathVariable UUID id){
		Paciente paciente = pacienteService.findById(id);
		return ResponseEntity.ok().body(paciente);
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<Paciente> insert(@RequestBody @Valid PacienteDTO dto) {
		Paciente paciente = pacienteService.insert(dto);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(paciente.getId())
				.toUri();
		return ResponseEntity.created(uri).body(paciente);
	}

	@PatchMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<Paciente> patch(@PathVariable UUID id, @RequestBody @Valid PacienteUpdateDTO dto){
		return ResponseEntity.ok(pacienteService.patch(id,dto));
	}

//	@DeleteMapping(value = "/{id}")
//	public ResponseEntity<Paciente> delete(@PathVariable UUID id) {
//		pacienteService.delete(id);
//		return ResponseEntity.noContent().build();
//	}

	//	@PutMapping(value = "/{id}")
//	public ResponseEntity<Paciente> update(@PathVariable UUID id, @RequestBody @Valid PacienteDTO dto) {
//		Paciente paciente  = pacienteService.update(id, dto);
//		return ResponseEntity.ok().body(paciente);
//	}

}
