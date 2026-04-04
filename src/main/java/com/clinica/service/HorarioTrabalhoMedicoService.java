package com.clinica.service;

import com.clinica.dto.HorarioTrabalhoMedicoDTO;
import com.clinica.dto.resposta.HorarioTrabalhoMedicoResponseDTO;
import com.clinica.dto.update.HorarioTrabalhoMedicoUpdateDTO;
import com.clinica.model.HorarioTrabalhoMedico;
import com.clinica.model.Medico;
import com.clinica.repository.HorarioTrabalhoMedicoRepository;
import com.clinica.repository.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HorarioTrabalhoMedicoService {

    @Autowired
    HorarioTrabalhoMedicoRepository horarioTrabalhoMedicoRepository;

    @Autowired
    MedicoRepository medicoRepository;

    public List<HorarioTrabalhoMedicoResponseDTO> findAll() {
        return horarioTrabalhoMedicoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public HorarioTrabalhoMedicoResponseDTO findById(UUID id) {
        HorarioTrabalhoMedico horario = horarioTrabalhoMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horário médico não encontrado"));
        return toDTO(horario);
    }

    public List<HorarioTrabalhoMedicoResponseDTO> insert(HorarioTrabalhoMedicoDTO dto) {
        Medico medico = medicoRepository.findById(dto.medicoId())
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));

        if (!medico.getAtivo()) {
            throw new RuntimeException("Médico desativado");
        }

        HorarioTrabalhoMedico horario = new HorarioTrabalhoMedico();
        horario.setMedico(medico);
        horario.setDiasSemana(dto.diasSemana());
        horario.setHoraInicio(dto.horaInicio());
        horario.setHoraFim(dto.horaFim());
        horario.setDuracaoPadrao(dto.duracaoPadrao());

        return List.of(toDTO(horarioTrabalhoMedicoRepository.save(horario)));
    }

    public HorarioTrabalhoMedicoResponseDTO patch(UUID id, HorarioTrabalhoMedicoUpdateDTO dto) {
        HorarioTrabalhoMedico horario = horarioTrabalhoMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horário médico não encontrado"));

        if (dto.diasSemana() != null && !dto.diasSemana().isEmpty()) {
            horario.setDiasSemana(dto.diasSemana());
        }
        if (dto.horaInicio() != null) horario.setHoraInicio(dto.horaInicio());
        if (dto.horaFim() != null) horario.setHoraFim(dto.horaFim());
        if (dto.duracaoPadrao() != null) horario.setDuracaoPadrao(dto.duracaoPadrao());

        return toDTO(horarioTrabalhoMedicoRepository.save(horario));
    }

    private HorarioTrabalhoMedicoResponseDTO toDTO(HorarioTrabalhoMedico horario) {
        return new HorarioTrabalhoMedicoResponseDTO(
                horario.getId(),
                horario.getMedico().getId(),
                horario.getMedico().getNome(),
                horario.getDiasSemana(),
                horario.getHoraInicio(),
                horario.getHoraFim(),
                horario.getDuracaoPadrao()
        );
    }
}
