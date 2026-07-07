package com.clinica.controller;

import com.clinica.dto.ConvenioDTO;
import com.clinica.dto.update.ConvenioUpdateDTO;
import com.clinica.model.Convenio;
import com.clinica.service.ConvenioService;
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
@RequestMapping(value = "/convenios")
public class ConvenioController {

    @Autowired
    ConvenioService convenioService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<List<Convenio>> findAll(){
        List<Convenio> convenios = convenioService.findAll();
        return ResponseEntity.ok().body(convenios);
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARIA')")
    public ResponseEntity<Convenio> findById(@PathVariable UUID id){
        Convenio convenio = convenioService.findById(id);
        return ResponseEntity.ok().body(convenio);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Convenio> insert(@RequestBody @Valid ConvenioDTO dto){
        Convenio convenio = convenioService.insert(dto);
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(convenio.getId())
                .toUri();
        return ResponseEntity.created(uri).body(convenio);
    }

    @PatchMapping(value = "/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Convenio> patch(@PathVariable UUID id, @RequestBody ConvenioUpdateDTO dto){
        return ResponseEntity.ok(convenioService.patch(id,dto));
    }

}
