package com.clinica.controller;

import com.clinica.dto.HorarioTrabalhoMedicoDTO;
import com.clinica.dto.resposta.HorarioTrabalhoMedicoResponseDTO;
import com.clinica.dto.PacienteDTO;
import com.clinica.dto.resposta.ConsultaResponseDTO;
import com.clinica.dto.resposta.PacienteResponseDTO;
import com.clinica.dto.update.HorarioTrabalhoMedicoUpdateDTO;
import com.clinica.dto.update.PacienteUpdateDTO;
import com.clinica.model.HorarioTrabalhoMedico;
import com.clinica.model.Paciente;
import com.clinica.service.HorarioTrabalhoMedicoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/horarios")
public class HorarioTrabalhoMedicoController {

    @Autowired
    HorarioTrabalhoMedicoService horarioTrabalhoMedicoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<List<HorarioTrabalhoMedicoResponseDTO>> findAll() {
        return ResponseEntity.ok(horarioTrabalhoMedicoService.findAll());
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<HorarioTrabalhoMedicoResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(horarioTrabalhoMedicoService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<List<HorarioTrabalhoMedicoResponseDTO>> insert(@RequestBody @Valid HorarioTrabalhoMedicoDTO dto) {
        List<HorarioTrabalhoMedicoResponseDTO> response = horarioTrabalhoMedicoService.insert(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<HorarioTrabalhoMedicoResponseDTO> patch(@PathVariable UUID id, @RequestBody @Valid HorarioTrabalhoMedicoUpdateDTO dto) {
        return ResponseEntity.ok(horarioTrabalhoMedicoService.patch(id, dto));
    }

}
