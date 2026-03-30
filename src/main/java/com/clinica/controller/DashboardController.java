package com.clinica.controller;

import com.clinica.dto.DashboardDTO;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.PacienteRepository;
import com.clinica.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @GetMapping("/resumo")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<DashboardDTO> getResumo() {
        DashboardDTO resumo = new DashboardDTO();

        resumo.setTotalPacientes(pacienteRepository.count());
        resumo.setTotalMedicos(medicoRepository.count());

        // Calcula o início e o fim do dia de hoje
        LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();
        LocalDateTime fimDoDia = inicioDoDia.plusDays(1);

        // Passa as datas para o repositório
        resumo.setConsultasHoje(consultaRepository.countConsultasHoje(inicioDoDia, fimDoDia));

        BigDecimal faturamento = pagamentoRepository.sumFaturamentoMesAtual();
        resumo.setFaturamentoMes(faturamento != null ? faturamento : BigDecimal.ZERO);

        return ResponseEntity.ok(resumo);
    }
}