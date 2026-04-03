package com.clinica.controller;

import com.clinica.dto.HistoricoClinicoDTO;
import com.clinica.dto.update.HistoricoClinicoUpdateDTO;
import com.clinica.model.HistoricoClinico;
import com.clinica.service.HistoricoClinicoService;
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
@RequestMapping(value = "/historicosClinicos")
public class HistoricoClinicoController {

    @Autowired
    HistoricoClinicoService historicoClinicoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<List<HistoricoClinico>> findAll() {
        List<HistoricoClinico> historicos = historicoClinicoService.findAll();
        return ResponseEntity.ok().body(historicos);
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<HistoricoClinico> findById(@PathVariable UUID id) {
        HistoricoClinico historico = historicoClinicoService.findById(id);
        return ResponseEntity.ok().body(historico);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<HistoricoClinico> insert(@RequestBody @Valid HistoricoClinicoDTO dto) {
        HistoricoClinico historico = historicoClinicoService.insert(dto);
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(historico.getId())
                .toUri();
        return ResponseEntity.created(uri).body(historico);
    }

    @PatchMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<HistoricoClinico> patch(@PathVariable UUID id, @RequestBody HistoricoClinicoUpdateDTO dto) {
        return ResponseEntity.ok(historicoClinicoService.patch(id, dto));
    }


}
