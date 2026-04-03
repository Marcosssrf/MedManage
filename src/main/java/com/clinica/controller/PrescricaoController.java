package com.clinica.controller;

import com.clinica.model.Prescricao;
import com.clinica.service.PrescricaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

//    @PostMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
//    public ResponseEntity<Prescricao> insert(@RequestBody PrescricaoDTO dto){
//        Prescricao prescricao = prescricaoService.insert(dto);
//        URI uri = ServletUriComponentsBuilder
//                .fromCurrentRequest()
//                .path("/{id}")
//                .buildAndExpand(prescricao.getId())
//                .toUri();
//        return ResponseEntity.created(uri).body(prescricao);
//    }
}
