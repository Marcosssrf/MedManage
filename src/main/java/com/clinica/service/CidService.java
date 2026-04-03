package com.clinica.service;

import com.clinica.model.Cid;
import com.clinica.repository.CidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CidService {

    @Autowired
    CidRepository cidRepository;

    public List<Cid> findAll() {return cidRepository.findAll();}

    public Cid findById(String id){
        return cidRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cid não encontrada"));
    }
}
