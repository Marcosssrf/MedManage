package com.clinica.controller;

import com.clinica.dto.PacienteDTO;
import com.clinica.dto.resposta.PacienteResponseDTO;
import com.clinica.dto.resposta.PacienteResponseGetAll;
import com.clinica.dto.update.PacienteUpdateDTO;
import com.clinica.model.Paciente;
import com.clinica.repository.PacienteRepository;
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
	@Autowired
	PacienteRepository pacienteRepository;

//	@GetMapping
//	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
//	public ResponseEntity<List<PacienteResponseGetAll>> findAll() {
//		List<PacienteResponseGetAll> pacientes = pacienteService.findAll()
//				.stream()
//				.map(paciente -> new PacienteResponseGetAll(
//						paciente.getId(),
//						paciente.getNome(),
//						paciente.getCpf(),
//						paciente.getTelefone(),
//						paciente.getEmail()
//				))
//				.toList();
//		return ResponseEntity.ok(pacientes);
//	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<List<PacienteResponseGetAll>> findAll() {
		List<PacienteResponseGetAll> pacientes = pacienteRepository.findAllPacientesDTO();

		return ResponseEntity.ok(pacientes);
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
	public ResponseEntity<PacienteResponseDTO> patch(@PathVariable UUID id, @RequestBody @Valid PacienteUpdateDTO dto) {
		return ResponseEntity.ok(PacienteResponseDTO.from(pacienteService.patch(id, dto)));
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
