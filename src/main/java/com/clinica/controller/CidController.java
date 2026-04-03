package com.clinica.controller;

import com.clinica.model.Cid;
import com.clinica.service.CidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/cids")
public class CidController {

    @Autowired
    CidService cidService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<List<Cid>> findAll(){
        List<Cid> cids = cidService.findAll();
        return ResponseEntity.ok().body(cids);
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<Cid> findById(@PathVariable String id){
        Cid cid = cidService.findById(id);
        return ResponseEntity.ok().body(cid);
    }

}
