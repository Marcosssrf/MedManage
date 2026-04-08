package com.clinica.service;

import com.clinica.model.enums.StatusConsulta;
import com.clinica.repository.ConsultaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class AtualizadorStatusConsultaJob {

    @Autowired
    private ConsultaRepository consultaRepository;

    // Roda a cada 30 minutos (1.800.000 ms)
    @Scheduled(fixedRate = 1800000)
    @Transactional
    public void atualizarStatusAutomaticamente() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite24h = agora.plusHours(24);

        consultaRepository.atualizarStatusParaRealizada(agora, StatusConsulta.REALIZADA, StatusConsulta.CANCELADA);
        consultaRepository.atualizarStatusParaConfirmada(agora, limite24h, StatusConsulta.CONFIRMADA, StatusConsulta.REALIZADA, StatusConsulta.CANCELADA);
    }
}