package com.clinica.service;

import com.clinica.dto.HistoricoClinicoDTO;
import com.clinica.dto.update.HistoricoClinicoUpdateDTO;
import com.clinica.model.HistoricoClinico;
import com.clinica.model.Paciente;
import com.clinica.model.User;
import com.clinica.repository.HistoricoClinicoRepository;
import com.clinica.repository.PacienteRepository;
import com.clinica.security.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HistoricoClinicoService {

    @Autowired
    HistoricoClinicoRepository historicoClinicoRepository;
    @Autowired
    PacienteRepository pacienteRepository;
    @Autowired
    SecurityService securityService;

    public List<HistoricoClinico> findAll(){
        return historicoClinicoRepository.findAll();
    }

    public HistoricoClinico findById(UUID id){
        return  historicoClinicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Histórico Clínico não encontrada"));
    }

    public HistoricoClinico insert(HistoricoClinicoDTO dto){

        Paciente paciente = pacienteRepository.findById(dto.pacienteId()).orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        HistoricoClinico historicoClinico = new HistoricoClinico();

        if(historicoClinicoRepository.existsHistoricoClinicoByPacienteId(paciente.getId())){
            throw new RuntimeException("Paciente já possui histórico clínico cadastrado");
        }

        historicoClinico.setPaciente(paciente);
        historicoClinico.setAlergias(dto.alergias());
        historicoClinico.setDoencasPreexistentes(dto.doencasPreexistentes());
        historicoClinico.setCirurgiasPrevias(dto.cirurgiasPrevias());
        historicoClinico.setHistoricoFamiliar(dto.historicoFamiliar());
        historicoClinico.setMedicamentosUsoContinuo(dto.medicamentosUsoContinuo());
        historicoClinico.setTipoSanguineo(dto.tipoSanguineo());
        historicoClinico.setPeso(dto.peso());
        historicoClinico.setAltura(dto.altura());
        historicoClinico.setPraticaAtividadeFisica(dto.praticaAtividadeFisica());
        historicoClinico.setTabagismo(dto.tabagismo());
        historicoClinico.setEtilismo(dto.etilismo());
        historicoClinico.setUsaDrogas(dto.usaDrogas());

        User user = securityService.obterUsuarioLogado();
        historicoClinico.setUsuario(user);

        return historicoClinicoRepository.save(historicoClinico);
    }

    public HistoricoClinico patch(UUID id, HistoricoClinicoUpdateDTO dto){
        HistoricoClinico historicoClinico = historicoClinicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro Clinico não encontrado"));

        if(dto.alergias() != null){
            historicoClinico.setAlergias(dto.alergias());
        }
        if(dto.doencasPreexistentes() != null){
            historicoClinico.setDoencasPreexistentes(dto.doencasPreexistentes());
        }
        if(dto.cirurgiasPrevias() != null){
            historicoClinico.setCirurgiasPrevias(dto.cirurgiasPrevias());
        }
        if(dto.historicoFamiliar() != null){
            historicoClinico.setHistoricoFamiliar(dto.historicoFamiliar());
        }
        if(dto.medicamentosUsoContinuo() != null){
            historicoClinico.setMedicamentosUsoContinuo(dto.medicamentosUsoContinuo());
        }
        if(dto.peso() != null){
            historicoClinico.setPeso(dto.peso());
        }
        if(dto.altura() != null){
            historicoClinico.setAltura(dto.altura());
        }
        if(dto.praticaAtividadeFisica() != null){
            historicoClinico.setPraticaAtividadeFisica(dto.praticaAtividadeFisica());
        }
        if(dto.tabagismo() != null){
            historicoClinico.setTabagismo(dto.tabagismo());
        }
        if(dto.etilismo() != null){
            historicoClinico.setEtilismo(dto.etilismo());
        }
        if(dto.usaDrogas() != null){
            historicoClinico.setUsaDrogas(dto.usaDrogas());
        }

        return historicoClinicoRepository.save(historicoClinico);
    }

}
