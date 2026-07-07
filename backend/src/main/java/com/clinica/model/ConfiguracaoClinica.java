package com.clinica.model;

import jakarta.persistence.*;
import org.hibernate.validator.constraints.br.CNPJ;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "configuracao_clinica")
public class ConfiguracaoClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String nomeClinica;
    @Column(nullable = false)
    @CNPJ
    private String cnpj;
    @Column(nullable = false)
    private String telefone;
    @Column(nullable = false)
    private LocalTime horarioAbertura;
    @Column(nullable = false)
    private LocalTime horarioFechamento;
    @Column(nullable = false)
    private Integer duracaoPadraoConsultas;

    public ConfiguracaoClinica() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNomeClinica() {
        return nomeClinica;
    }

    public void setNomeClinica(String nomeClinica) {
        this.nomeClinica = nomeClinica;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public LocalTime getHorarioAbertura() {
        return horarioAbertura;
    }

    public void setHorarioAbertura(LocalTime horarioAbertura) {
        this.horarioAbertura = horarioAbertura;
    }

    public LocalTime getHorarioFechamento() {
        return horarioFechamento;
    }

    public void setHorarioFechamento(LocalTime horarioFechamento) {
        this.horarioFechamento = horarioFechamento;
    }

    public Integer getDuracaoPadraoConsultas() {
        return duracaoPadraoConsultas;
    }

    public void setDuracaoPadraoConsultas(Integer duracaoPadraoConsultas) {
        this.duracaoPadraoConsultas = duracaoPadraoConsultas;
    }
}
