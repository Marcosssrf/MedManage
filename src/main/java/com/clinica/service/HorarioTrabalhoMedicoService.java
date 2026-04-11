// HorarioTrabalhoService.java
package com.clinica.service;

import com.clinica.dto.DiaHorarioRequestDTO;
import com.clinica.dto.HorarioTrabalhoRequestDTO;
import com.clinica.dto.resposta.DiaHorarioResponseDTO;
import com.clinica.dto.resposta.HorarioTrabalhoResponseDTO;
import com.clinica.model.HorarioTrabalhoMedico;
import com.clinica.model.Medico;
import com.clinica.repository.HorarioTrabalhoMedicoRepository;
import com.clinica.repository.MedicoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class HorarioTrabalhoMedicoService {

    private final HorarioTrabalhoMedicoRepository horarioRepository;
    private final MedicoRepository medicoRepository;

    public HorarioTrabalhoMedicoService(HorarioTrabalhoMedicoRepository horarioRepository,
                                  MedicoRepository medicoRepository) {
        this.horarioRepository = horarioRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional
    public HorarioTrabalhoResponseDTO salvar(UUID medicoId, HorarioTrabalhoRequestDTO request) {
        Medico medico = medicoRepository.findById(medicoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado"));

        long diasDistintos = request.horarios().stream()
                .map(DiaHorarioRequestDTO::diaSemana)
                .distinct()
                .count();

        if (diasDistintos != request.horarios().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dias da semana duplicados na requisição");
        }

        request.horarios().forEach(r -> {
            if (horarioRepository.existsByMedicoIdAndDiaSemana(medicoId, r.diaSemana())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Já existe horário cadastrado para " + r.diaSemana() + " neste médico"
                );
            }
        });

        List<HorarioTrabalhoMedico> entidades = request.horarios().stream()
                .map(r -> new HorarioTrabalhoMedico(
                        medico,
                        r.diaSemana(),
                        r.horaInicio(),
                        r.horaFim(),
                        r.duracaoPadrao()
                ))
                .toList();

        horarioRepository.saveAll(entidades);

        return toResponse(medicoId, entidades);
    }

    public HorarioTrabalhoResponseDTO buscarPorMedico(UUID medicoId) {
        if (!medicoRepository.existsById(medicoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado");
        }

        List<HorarioTrabalhoMedico> horarios = horarioRepository.findByMedicoId(medicoId);
        return toResponse(medicoId, horarios);
    }

    @Transactional
    public void deletarPorMedico(UUID medicoId) {
        if (!medicoRepository.existsById(medicoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado");
        }
        horarioRepository.deleteByMedicoId(medicoId);
    }

    private HorarioTrabalhoResponseDTO toResponse(UUID medicoId, List<HorarioTrabalhoMedico> horarios) {
        List<DiaHorarioResponseDTO> dias = horarios.stream()
                .map(DiaHorarioResponseDTO::from)
                .sorted(Comparator.comparing(DiaHorarioResponseDTO::diaSemana))
                .toList();

        return new HorarioTrabalhoResponseDTO(medicoId, dias);
    }

    @Transactional
    public void deletarUm(UUID medicoId, UUID horarioId) {
        HorarioTrabalhoMedico horario = horarioRepository.findById(horarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horário não encontrado"));

        if (!horario.getMedico().getId().equals(medicoId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Horário não pertence a este médico");
        }

        horarioRepository.delete(horario);
    }

}