package com.clinica.controller;

import com.clinica.dto.ProcedimentoTISSDTO;
import com.clinica.dto.resposta.PagamentoResponseDTO;
import com.clinica.dto.resposta.ProcedimentoTISSResponseDTO;
import com.clinica.model.ProcedimentoTISS;
import com.clinica.service.ProcedimentoTISSService;
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
@RequestMapping(value = "/procedimentos-tiss")
public class ProcedimentoTISSController {

    @Autowired
    private ProcedimentoTISSService procedimentoTISSService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<List<ProcedimentoTISSResponseDTO>> findAll() {
        return ResponseEntity.ok(procedimentoTISSService.findAll());
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<ProcedimentoTISSResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(procedimentoTISSService.findById(id));
    }

    @GetMapping(value = "/consulta/{consultaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<List<ProcedimentoTISS>> findByConsulta(@PathVariable UUID consultaId) {
        return ResponseEntity.ok(procedimentoTISSService.findByConsulta(consultaId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA', 'MEDICO')")
    public ResponseEntity<ProcedimentoTISSResponseDTO> insert(@RequestBody @Valid ProcedimentoTISSDTO dto) {
        ProcedimentoTISSResponseDTO response = procedimentoTISSService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @PostMapping("/consulta/{consultaId}/gerar-pagamento")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<PagamentoResponseDTO> gerarPagamento(@PathVariable UUID consultaId) {
        return ResponseEntity.ok(procedimentoTISSService.gerarPagamentoDaTISS(consultaId));
    }

    @PatchMapping(value = "/{id}/autorizar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<ProcedimentoTISSResponseDTO> autorizar(
            @PathVariable UUID id,
            @RequestParam String numeroAutorizacao) {
        return ResponseEntity.ok(procedimentoTISSService.autorizarProcedimento(id, numeroAutorizacao));
    }

    @PatchMapping(value = "/{id}/negar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<ProcedimentoTISSResponseDTO> negar(@PathVariable UUID id) {
        return ResponseEntity.ok(procedimentoTISSService.negarProcedimento(id));
    }

    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        procedimentoTISSService.delete(id);
        return ResponseEntity.noContent().build();
    }
}