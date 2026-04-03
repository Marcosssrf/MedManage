package com.clinica.service;

import com.clinica.dto.PrescricaoDTO;
import com.clinica.model.Prescricao;
import com.clinica.model.User;
import com.clinica.repository.PrescricaoRepository;
import com.clinica.security.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PrescricaoService {

    @Autowired
    PrescricaoRepository prescricaoRepository;
    @Autowired
    private SecurityService securityService;

    public List<Prescricao> findAll(){
        return prescricaoRepository.findAll();
    }

    public Prescricao findById(UUID id){
        return prescricaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescrição não encontrada"));
    }

    public Prescricao insert(PrescricaoDTO dto){

        Prescricao prescricao = new Prescricao();

        prescricao.setMedicamento(dto.medicamento());
        prescricao.setDosagem(dto.dosagem());
        prescricao.setViaAdministracao(dto.viaAdministracao());
        prescricao.setFrequencia(dto.frequencia());
        prescricao.setDuracao(dto.duracao());
        prescricao.setObservacoes(dto.observacao());
        prescricao.setTipoReceita(dto.tipoReceita());

        User user = securityService.obterUsuarioLogado();
        prescricao.setUsuario(user);

        return prescricaoRepository.save(prescricao);
    }
}
