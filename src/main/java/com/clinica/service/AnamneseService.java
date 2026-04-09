package com.clinica.service;

import com.clinica.dto.AnamneseDTO;
import com.clinica.dto.PrescricaoDTO;
import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.exception.RegraDeNegocioException;
import com.clinica.model.*;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.repository.AnamneseRepository;
import com.clinica.repository.CidRepository;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.PrescricaoRepository;
import com.clinica.security.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AnamneseService {

    @Autowired
    AnamneseRepository anamneseRepository;
    @Autowired
    PrescricaoRepository prescricaoRepository;
    @Autowired
    private CidRepository cidRepository;
    @Autowired
    private SecurityService securityService;
    @Autowired
    private ConsultaRepository consultaRepository;

    public List<Anamnese> findAll(){
        return  anamneseRepository.findAll();
    }

    public Anamnese findById(UUID id){
        return anamneseRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Anamnese não encontrada"));
    }

    public Anamnese insert(AnamneseDTO dto){

        Cid cid = cidRepository.findById(dto.cidCodigo())
                .orElseThrow(() -> new EntidadeNaoEncontradaException("CID não encontrado"));
        Consulta consulta = consultaRepository.findById(dto.consultaId())
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));

        boolean statusValido = consulta.getStatus() == StatusConsulta.REALIZADA
                || consulta.getStatus() == StatusConsulta.EM_ANDAMENTO;



        if(!statusValido){
            throw new RegraDeNegocioException("Anamnese não pode ser criada com consulta agendada ou cancelada");
        }

        if (anamneseRepository.existsByConsultaId(dto.consultaId())) {
            throw new RegraDeNegocioException("Já existe uma anamnese para essa consulta");
        }

        Anamnese anamnese = new Anamnese();

        anamnese.setConsulta(consulta);
        anamnese.setQueixaPrincipal(dto.queixaPrincipal());
        anamnese.setHistoriaMolestiaPrincipal(dto.historiaMolestiaPrincipal());
        anamnese.setExameFisico(dto.exameFisico());
        anamnese.setHipoteseDiagnostica(dto.hipoteseDiagnostica());
        anamnese.setSolicitacaoDeExames(dto.solicitacaoDeExames());
        anamnese.setEncaminhamento(dto.encaminhamento());
        anamnese.setCondutaMedica(dto.condutaMedica());
        anamnese.setCid(cid);

        User user = securityService.obterUsuarioLogado();
        anamnese.setUsuario(user);

        Anamnese anamneseSalva = anamneseRepository.save(anamnese);

//        if(dto.prescricoes() !=  null){
//            List<Prescricao> listaDePrescricoes = new ArrayList<>();
//            for(PrescricaoDTO prescricaoDTO : dto.prescricoes()){
//                Prescricao prescricao = new Prescricao();
//                prescricao.setMedicamento(prescricaoDTO.medicamento());
//                prescricao.setDosagem(prescricaoDTO.dosagem());
//                prescricao.setViaAdministracao(prescricaoDTO.viaAdministracao());
//                prescricao.setFrequencia(prescricaoDTO.frequencia());
//                prescricao.setDuracao(prescricaoDTO.duracao());
//                prescricao.setObservacoes(prescricaoDTO.observacao());
//                prescricao.setTipoReceita(prescricaoDTO.tipoReceita());
//                prescricao.setAnamnese(anamneseSalva);
//                prescricao.setUsuario(user);
//
//                Prescricao pSalva = prescricaoRepository.save(prescricao);
//                listaDePrescricoes.add(pSalva);
//
//            }
//            anamneseSalva.setPrescricoes(listaDePrescricoes);
//        }
        return anamneseSalva;
    }

}
