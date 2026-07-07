package com.clinica.controller;

import com.clinica.dto.PrescricaoDTO;
import com.clinica.model.Prescricao;
import com.clinica.service.PrescricaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/prescricoes")
public class PrescricaoController {

    @Autowired
    PrescricaoService prescricaoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<List<Prescricao>> findAll(){
        List<Prescricao> prescricaos = prescricaoService.findAll();
        return ResponseEntity.ok(prescricaos);
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<Prescricao> findById(@PathVariable UUID id){
        Prescricao prescricao = prescricaoService.findById(id);
        return ResponseEntity.ok(prescricao);
    }

    @PostMapping(value = "/consulta/{consultaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<Prescricao> insert(@RequestBody @Valid PrescricaoDTO dto, @PathVariable UUID consultaId) {
        Prescricao novaPrescricao = prescricaoService.adicionarPrescricao(dto, consultaId);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaPrescricao);
    }
}
