package com.clinica.controller;

import com.clinica.dto.ConsultaDTO;
import com.clinica.model.Consulta;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.service.ConsultaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = ("/consultas"))
public class ConsultaController {

	@Autowired
	ConsultaService consultaService;

	@GetMapping
	public ResponseEntity<List<Consulta>> findAll() {
		List<Consulta> consultas = consultaService.findAll();
		return ResponseEntity.ok(consultas);
	}

	@GetMapping(value = "/{id}")
	public ResponseEntity<Consulta> findById(@PathVariable UUID id){
		Consulta consulta = consultaService.findById(id);
		return ResponseEntity.ok().body(consulta);
	}

	@GetMapping(value = "/buscar")
	public ResponseEntity<List<Consulta>> findByPaciente(@RequestParam String nome){
		return ResponseEntity.ok().body(consultaService.findByPaciente(nome));
	}

	@GetMapping(value = "/buscar/medico")
	public ResponseEntity<List<Consulta>> findByMedico(@RequestParam String nome){
		return ResponseEntity.ok().body(consultaService.findByMedico(nome));
	}

	@PostMapping
	public ResponseEntity<Consulta> insert(@RequestBody ConsultaDTO dto) {
		Consulta consulta = consultaService.insert(dto);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(consulta.getId()).toUri();
		return ResponseEntity.created(uri).body(consulta);
	}

	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Consulta> delete(@PathVariable UUID id) {
		consultaService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping(value = "/{id}")
	public ResponseEntity<Consulta> update(@PathVariable UUID id, @RequestBody Consulta consulta) {
		consulta = consultaService.update(id, consulta);
		return ResponseEntity.ok().body(consulta);
	}

	@PutMapping(value = "/{id}/cancelar")
	public ResponseEntity<Consulta> cancelar(@PathVariable UUID id) {
		Consulta consultaCancelada = consultaService.cancelar(id);
		return ResponseEntity.ok(consultaCancelada);
	}
}
