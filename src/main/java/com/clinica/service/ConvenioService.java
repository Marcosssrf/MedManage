package com.clinica.service;

import com.clinica.dto.ConvenioDTO;
import com.clinica.dto.update.ConvenioUpdateDTO;
import com.clinica.model.Convenio;
import com.clinica.repository.ConvenioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ConvenioService {

    @Autowired
    ConvenioRepository convenioRepository;

    public List<Convenio> findAll(){
        return convenioRepository.findAll();
    }

    public Convenio findById(UUID id){
        return convenioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Convênio não encontrada"));
    }

    public Convenio insert(ConvenioDTO dto){

        Convenio convenio = new Convenio();

        convenio.setNome(dto.nome());
        convenio.setCnpj(dto.cnpj());
        convenio.setRegistroANS(dto.registroANS());
        convenio.setTelefone(dto.telefone());
        convenio.setDiasParaFaturamento(dto.diasParaFaturamento());
        convenio.setAtivo(true);

        return convenioRepository.save(convenio);
    }

    public Convenio patch(UUID id, ConvenioUpdateDTO dto){
        Convenio convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de Convênio não encontrado"));

        if(dto.nome()!=null){
            convenio.setNome(dto.nome());
        }
        if(dto.telefone()!=null){
            convenio.setTelefone(dto.telefone());
        }
        if(dto.diasParaFaturamento()!=null){
            convenio.setDiasParaFaturamento(dto.diasParaFaturamento());
        }
        if(dto.ativo()!=null){
            convenio.setAtivo(dto.ativo());
        }
        return convenioRepository.save(convenio);
    }



}
