package com.clinica.controller;

import com.clinica.dto.ConfiguracaoClinicaDTO;
import com.clinica.model.ConfiguracaoClinica;
import com.clinica.service.ConfiguracaoClinicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/configuracaoClinica")
public class ConfiguracaoClinicaController {

    @Autowired
    ConfiguracaoClinicaService configuracaoClinicaService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoClinica> findClinica(){
        ConfiguracaoClinica configuracaoClinica = configuracaoClinicaService.getClinica();
        return ResponseEntity.ok().body(configuracaoClinica);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoClinica> insert(@RequestBody ConfiguracaoClinicaDTO dto) {
        ConfiguracaoClinica configuracaoClinica = configuracaoClinicaService.insert(dto);
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(configuracaoClinica.getId())
                .toUri();
        return ResponseEntity.created(uri).body(configuracaoClinica);
    }

    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoClinica> patch(@RequestBody ConfiguracaoClinicaDTO dto) {
        ConfiguracaoClinica configuracaoClinica = configuracaoClinicaService.patch(dto);
        return ResponseEntity.ok().body(configuracaoClinica);
    }

}
