package com.clinica.service;

import com.clinica.dto.ConfiguracaoClinicaDTO;
import com.clinica.model.ConfiguracaoClinica;
import com.clinica.repository.ConfiguracaoClinicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracaoClinicaService {

    @Autowired
    ConfiguracaoClinicaRepository configuracaoClinicaRepository;

    public ConfiguracaoClinica getClinica(){
        return configuracaoClinicaRepository.findAll().get(0);
    }

    public ConfiguracaoClinica insert(ConfiguracaoClinicaDTO dto){

        ConfiguracaoClinica configuracaoClinica = new ConfiguracaoClinica();

        configuracaoClinica.setNomeClinica(dto.nomeClinica());
        configuracaoClinica.setCnpj(dto.cnpj());
        configuracaoClinica.setTelefone(dto.telefone());
        configuracaoClinica.setHorarioAbertura(dto.horarioAbertura());
        configuracaoClinica.setHorarioFechamento(dto.horarioFechamento());
        configuracaoClinica.setDuracaoPadraoConsultas(dto.duracaoPadraoConsulta());

        return configuracaoClinicaRepository.save(configuracaoClinica);
    }

    public ConfiguracaoClinica patch (ConfiguracaoClinicaDTO dto){
        ConfiguracaoClinica configuracaoClinica = configuracaoClinicaRepository.findAll().get(0);

        if(dto.nomeClinica() != null){
            configuracaoClinica.setNomeClinica(dto.nomeClinica());
        }
        if(dto.cnpj() != null){
            configuracaoClinica.setCnpj(dto.cnpj());
        }
        if(dto.telefone() != null){
            configuracaoClinica.setTelefone(dto.telefone());
        }
        if(dto.horarioAbertura() != null){
            configuracaoClinica.setHorarioAbertura(dto.horarioAbertura());
        }
        if(dto.horarioFechamento() != null) {
            configuracaoClinica.setHorarioFechamento(dto.horarioFechamento());
        }
        if(dto.duracaoPadraoConsulta() != null){
            configuracaoClinica.setDuracaoPadraoConsultas(dto.duracaoPadraoConsulta());
        }

        return configuracaoClinicaRepository.save(configuracaoClinica);
    }

}
