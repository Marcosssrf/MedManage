package com.clinica.controller;

import com.clinica.dto.DashboardDTO;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.PacienteRepository;
import com.clinica.repository.PagamentoRepository;
import com.clinica.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

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

    @Autowired
    private UserService userService;

    @GetMapping("/resumo")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'SECRETARIA')")
    public ResponseEntity<DashboardDTO> getResumo() {
        DashboardDTO resumo = new DashboardDTO();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        String username = authentication.getName();

        resumo.setTotalPacientes(pacienteRepository.count());
        resumo.setTotalMedicos(medicoRepository.count());

        LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();
        LocalDateTime fimDoDia = inicioDoDia.plusDays(1);

        if (role.equals("ROLE_MEDICO")) {
            UUID medicoId = userService.findByUsername(username).medico().id();

            resumo.setConsultasHoje(
                    consultaRepository.countByMedicoIdAndDataHoraBetween(medicoId, inicioDoDia, fimDoDia)
            );
        } else {
            resumo.setConsultasHoje(
                    consultaRepository.countConsultasHoje(inicioDoDia, fimDoDia)
            );
        }

        BigDecimal faturamento = pagamentoRepository.sumFaturamentoMesAtual();
        resumo.setFaturamentoMes(faturamento != null ? faturamento : BigDecimal.ZERO);

        return ResponseEntity.ok(resumo);
    }
}