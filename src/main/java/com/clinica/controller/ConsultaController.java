package com.clinica.controller;

import com.clinica.dto.ConsultaDTO;
import com.clinica.model.Consulta;
import com.clinica.service.ConsultaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

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
	public ResponseEntity<Consulta> findById(@PathVariable Integer id){
		Consulta consulta = consultaService.findById(id);
		return ResponseEntity.ok().body(consulta);
	}

	@PostMapping
	public ResponseEntity<Consulta> insert(@RequestBody ConsultaDTO dto) {
		Consulta consulta = consultaService.insert(dto);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(consulta.getId()).toUri();
		return ResponseEntity.created(uri).body(consulta);
	}

	@DeleteMapping(value = "/{id}")
	public ResponseEntity<Consulta> delete(@PathVariable Integer id) {
		consultaService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping(value = "/{id}")
	public ResponseEntity<Consulta> update(@PathVariable Integer id, @RequestBody Consulta consulta) {
		consulta = consultaService.update(id, consulta);
		return ResponseEntity.ok().body(consulta);
	}



}
