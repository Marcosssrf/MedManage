// HorarioTrabalhoController.java
package com.clinica.controller;

import com.clinica.dto.HorarioTrabalhoRequestDTO;
import com.clinica.dto.resposta.HorarioTrabalhoResponseDTO;
import com.clinica.service.HorarioTrabalhoMedicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/medicos/{medicoId}/horarios")
public class HorarioTrabalhoMedicoController {

    private final HorarioTrabalhoMedicoService service;

    public HorarioTrabalhoMedicoController(HorarioTrabalhoMedicoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<HorarioTrabalhoResponseDTO> salvar(
            @PathVariable UUID medicoId,
            @RequestBody @Valid HorarioTrabalhoRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(medicoId, request));
    }

    @GetMapping
    public ResponseEntity<HorarioTrabalhoResponseDTO> buscar(@PathVariable UUID medicoId) {
        return ResponseEntity.ok(service.buscarPorMedico(medicoId));
    }

    @DeleteMapping("/{horarioId}")
    public ResponseEntity<Void> deletarUm(
            @PathVariable UUID medicoId,
            @PathVariable UUID horarioId
    ) {
        service.deletarUm(medicoId, horarioId);
        return ResponseEntity.noContent().build();
    }
}