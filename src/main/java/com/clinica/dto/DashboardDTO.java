package com.clinica.dto;

import java.math.BigDecimal;

public class DashboardDTO {
    private Long totalPacientes;
    private Long totalMedicos;
    private Long consultasHoje;
    private BigDecimal faturamentoMes;

    // Construtores
    public DashboardDTO() {}

    // Getters e Setters
    public Long getTotalPacientes() { return totalPacientes; }
    public void setTotalPacientes(Long totalPacientes) { this.totalPacientes = totalPacientes; }

    public Long getTotalMedicos() { return totalMedicos; }
    public void setTotalMedicos(Long totalMedicos) { this.totalMedicos = totalMedicos; }

    public Long getConsultasHoje() { return consultasHoje; }
    public void setConsultasHoje(Long consultasHoje) { this.consultasHoje = consultasHoje; }

    public BigDecimal getFaturamentoMes() { return faturamentoMes; }
    public void setFaturamentoMes(BigDecimal faturamentoMes) { this.faturamentoMes = faturamentoMes; }
}