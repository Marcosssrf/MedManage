package com.clinica.controller;

import com.clinica.dto.ConsultaDTO;
import com.clinica.dto.resposta.ConsultaResponseDTO;
import com.clinica.dto.update.ConsultaUpdateDTO;
import com.clinica.model.Consulta;
import com.clinica.security.SecurityService;
import com.clinica.service.ConsultaService;
import com.clinica.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = ("/consultas"))
public class ConsultaController {

	@Autowired
	ConsultaService consultaService;
	@Autowired
	UserService userService;
	@Autowired
	SecurityService securityService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<List<Consulta>> findByParams(
			@RequestParam(value = "dataHora", required = false)LocalDateTime dataHora,
			@RequestParam(value = "paciente", required = false)String paciente,
			@RequestParam(value = "medico", required = false)String medico
//			@RequestParam(value = "pagina", defaultValue = "0") Integer pagina,
//			@RequestParam(value = "tamanho-pagina", defaultValue = "10") Integer tamanhoPagina
	){

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String role = authentication.getAuthorities().iterator().next().getAuthority();
		String username = authentication.getName();

		if (role.equals("ROLE_MEDICO")) {
            medico = userService.findEntityByUsername(username).getUsername();
		}

		List<Consulta> paginaResultado = consultaService.findByParams(dataHora, paciente, medico);
		return ResponseEntity.ok(paginaResultado);
	}

	@GetMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
	public ResponseEntity<ConsultaResponseDTO> findById(@PathVariable UUID id){
		ConsultaResponseDTO consulta = consultaService.findById(id);
		return ResponseEntity.ok().body(consulta);
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<ConsultaResponseDTO> insert(@RequestBody @Valid ConsultaDTO dto) {
		ConsultaResponseDTO consulta = consultaService.insert(dto);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(consulta.id()).toUri();
		return ResponseEntity.created(uri).body(consulta);
	}

	@PatchMapping(value = "/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<Consulta> patch(@PathVariable UUID id, @RequestBody @Valid ConsultaUpdateDTO dto) {
//		ConsultaResponseDTO consulta = consultaService.update(id, dto);
		return ResponseEntity.ok(consultaService.patch(id, dto));
	}

	@PutMapping(value = "/{id}/cancelar")
	@PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
	public ResponseEntity<ConsultaResponseDTO> cancelar(@PathVariable UUID id) {
		ConsultaResponseDTO consultaCancelada = consultaService.cancelar(id);
		return ResponseEntity.ok(consultaCancelada);
	}


//	@GetMapping
//	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
//	public ResponseEntity<List<ConsultaResponseDTO>> findAll() {
//	    List<ConsultaResponseDTO> consultas = consultaService.findAll();
//	    return ResponseEntity.ok(consultas);
//	}

//	@GetMapping(value = "/buscar")
//	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
//	public ResponseEntity<List<Consulta>> findByPaciente(@RequestParam String nome){
//		return ResponseEntity.ok().body(consultaService.findByPaciente(nome));
//	}
//
//	@GetMapping(value = "/buscar/medico")
//	@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
//	public ResponseEntity<List<Consulta>> findByMedico(@RequestParam String nome){
//		return ResponseEntity.ok().body(consultaService.findByMedico(nome));
//	}


//	@DeleteMapping(value = "/{id}")
//	public ResponseEntity<Consulta> delete(@PathVariable UUID id) {
//		consultaService.delete(id);
//		return ResponseEntity.noContent().build();
//	}
}
