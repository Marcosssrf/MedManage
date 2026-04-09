package com.clinica.service;

import com.clinica.dto.PrescricaoDTO;
import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.exception.RegraDeNegocioException;
import com.clinica.model.Anamnese;
import com.clinica.model.Prescricao;
import com.clinica.model.User;
import com.clinica.repository.AnamneseRepository;
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
    @Autowired
    AnamneseRepository anamneseRepository;


    public List<Prescricao> findAll(){
        return prescricaoRepository.findAll();
    }

    public Prescricao findById(UUID id){
        return prescricaoRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Prescrição não encontrada"));
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

    public Prescricao adicionarPrescricao(PrescricaoDTO dto, UUID consultaId) {
        Anamnese anamnese = anamneseRepository.findByConsultaId(consultaId)
                .orElseThrow(() -> new RegraDeNegocioException("Salve a anamnese antes de prescrever"));

        Prescricao p = new Prescricao();
        p.setMedicamento(dto.medicamento());
        p.setDosagem(dto.dosagem());
        p.setViaAdministracao(dto.viaAdministracao());
        p.setFrequencia(dto.frequencia());
        p.setDuracao(dto.duracao());
        p.setObservacoes(dto.observacao());
        p.setTipoReceita(dto.tipoReceita());
        p.setAnamnese(anamnese);
        p.setUsuario(securityService.obterUsuarioLogado());

        return prescricaoRepository.save(p);
    }
}
