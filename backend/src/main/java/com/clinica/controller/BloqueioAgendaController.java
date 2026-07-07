package com.clinica.controller;

import com.clinica.dto.BloqueioAgendaDTO;
import com.clinica.dto.resposta.BloqueioAgendaResponseDTO;
import com.clinica.dto.update.BloqueioAgendaUpdateDTO;
import com.clinica.service.BloqueioAgendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bloqueios-agenda")
public class BloqueioAgendaController {

    private final BloqueioAgendaService service;

    public BloqueioAgendaController(BloqueioAgendaService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<BloqueioAgendaResponseDTO> criar(
            @RequestBody @Valid BloqueioAgendaDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<List<BloqueioAgendaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/medico/{medicoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<List<BloqueioAgendaResponseDTO>> listarPorMedico(
            @PathVariable UUID medicoId
    ) {
        return ResponseEntity.ok(service.listarPorMedico(medicoId));
    }

    @GetMapping("/gerais")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<List<BloqueioAgendaResponseDTO>> listarGerais() {
        return ResponseEntity.ok(service.listarGerais());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<BloqueioAgendaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<BloqueioAgendaResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody BloqueioAgendaUpdateDTO dto
    ) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
