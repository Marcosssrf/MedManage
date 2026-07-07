package com.clinica.controller;

import com.clinica.dto.AnamneseDTO;
import com.clinica.model.Anamnese;
import com.clinica.service.AnamneseService;
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
@RequestMapping(value = "/anamneses")
public class AnamneseController {

    @Autowired
    AnamneseService anamneseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<List<Anamnese>> findAll() {
        List<Anamnese> anamneses = anamneseService.findAll();
        return ResponseEntity.ok().body(anamneses);
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<Anamnese> findById(@PathVariable UUID id) {
        Anamnese anamnese = anamneseService.findById(id);
        return ResponseEntity.ok().body(anamnese);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<Anamnese> insert(@RequestBody @Valid AnamneseDTO dto) {
        Anamnese anamnese = anamneseService.insert(dto);
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(anamnese.getId())
                .toUri();
        return ResponseEntity.created(uri).body(anamnese);
    }


}
