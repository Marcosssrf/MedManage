package com.clinica.service;

import com.clinica.dto.BloqueioAgendaDTO;
import com.clinica.dto.resposta.BloqueioAgendaResponseDTO;
import com.clinica.dto.update.BloqueioAgendaUpdateDTO;
import com.clinica.model.BloqueioAgenda;
import com.clinica.model.Medico;
import com.clinica.repository.BloqueioAgendaRepository;
import com.clinica.repository.MedicoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class BloqueioAgendaService {

    private final BloqueioAgendaRepository bloqueioRepository;
    private final MedicoRepository medicoRepository;

    public BloqueioAgendaService(BloqueioAgendaRepository bloqueioRepository,
                                 MedicoRepository medicoRepository) {
        this.bloqueioRepository = bloqueioRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional
    public BloqueioAgendaResponseDTO criar(BloqueioAgendaDTO dto) {
        validarDatas(dto.dataInicio(), dto.dataFim());

        BloqueioAgenda bloqueio = new BloqueioAgenda();
        preencherDados(bloqueio, dto);
        return BloqueioAgendaResponseDTO.from(bloqueioRepository.save(bloqueio));
    }

    public List<BloqueioAgendaResponseDTO> listarTodos() {
        return bloqueioRepository.findAllByOrderByDataInicioDesc()
                .stream()
                .map(BloqueioAgendaResponseDTO::from)
                .toList();
    }

    public List<BloqueioAgendaResponseDTO> listarPorMedico(UUID medicoId) {
        if (!medicoRepository.existsById(medicoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado");
        }
        return bloqueioRepository.findByMedicoIdOrderByDataInicioDesc(medicoId)
                .stream()
                .map(BloqueioAgendaResponseDTO::from)
                .toList();
    }

    public List<BloqueioAgendaResponseDTO> listarGerais() {
        return bloqueioRepository.findByMedicoIsNullOrderByDataInicioDesc()
                .stream()
                .map(BloqueioAgendaResponseDTO::from)
                .toList();
    }

    public BloqueioAgendaResponseDTO buscarPorId(UUID id) {
        return BloqueioAgendaResponseDTO.from(buscarOuErro(id));
    }

    @Transactional
    public BloqueioAgendaResponseDTO atualizar(UUID id, BloqueioAgendaUpdateDTO dto) {
        BloqueioAgenda bloqueio = buscarOuErro(id);

        if (dto.dataInicio() != null) bloqueio.setDataInicio(dto.dataInicio());
        if (dto.dataFim()    != null) bloqueio.setDataFim(dto.dataFim());
        if (dto.tipo()       != null) bloqueio.setTipo(dto.tipo());
        if (dto.motivo()     != null) bloqueio.setMotivo(dto.motivo());
        if (dto.ativo()      != null) bloqueio.setAtivo(dto.ativo());

        validarDatas(bloqueio.getDataInicio(), bloqueio.getDataFim());

        return BloqueioAgendaResponseDTO.from(bloqueioRepository.save(bloqueio));
    }

    @Transactional
    public void deletar(UUID id) {
        if (!bloqueioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloqueio não encontrado");
        }
        bloqueioRepository.deleteById(id);
    }

    // Consulta auxiliar usada pelo ConsultaService para verificar disponibilidade
    public boolean isDataBloqueada(UUID medicoId, LocalDate data) {
        return bloqueioRepository.existsBloqueioParaMedicoNaData(medicoId, data);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private void preencherDados(BloqueioAgenda bloqueio, BloqueioAgendaDTO dto) {
        if (dto.medicoId() != null) {
            Medico medico = medicoRepository.findById(dto.medicoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado"));
            bloqueio.setMedico(medico);
        }
        bloqueio.setDataInicio(dto.dataInicio());
        bloqueio.setDataFim(dto.dataFim());
        bloqueio.setTipo(dto.tipo());
        bloqueio.setMotivo(dto.motivo());
        bloqueio.setAtivo(true);
    }

    private void validarDatas(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && fim.isBefore(inicio)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Data de fim não pode ser anterior à data de início");
        }
    }

    private BloqueioAgenda buscarOuErro(UUID id) {
        return bloqueioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloqueio não encontrado"));
    }
}
