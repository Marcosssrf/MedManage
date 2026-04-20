// src/main/java/com/clinica/model/ProcedimentoTISS.java
package com.clinica.model;

import com.clinica.model.enums.StatusAutorizacaoTISS;
import com.clinica.model.enums.TipoAtendimentoTISS;
import com.clinica.model.enums.ViaAcessoTISS;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "procedimento_tiss")
@EntityListeners(AuditingEntityListener.class)
public class ProcedimentoTISS {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 10)
    private String codigoProcedimento; // ex: "10101012" (código TUSS — consulta médica em atenção primária)

    @Column(nullable = false)
    private String descricao; // ex: "Consulta em clínica médica" / "Hemograma completo"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor; // ex: 150.00 (valor cobrado do convênio ou particular)

    @Column(nullable = false)
    private Integer quantidade; // ex: 1 / 2 / 5 (unidades do procedimento executado)

    @Column(nullable = false)
    private LocalDate dataExecucao; // ex: "2025-04-10" (data em que o procedimento foi realizado)

    // === Campos de Guia TISS ===

    @Column(length = 20)
    private String numeroGuia; // ex: "202504100001" (número da guia gerado ou retornado pela operadora)

    @Column(length = 20)
    private String numeroAutorizacao; // ex: "987654321" (código de autorização retornado pela operadora)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAutorizacaoTISS statusAutorizacao; // ex: PENDENTE / AUTORIZADO / NEGADO / FATURADO

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAtendimentoTISS tipoAtendimento; // ex: CONSULTA / EXAME / TERAPIA / CIRURGIA

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ViaAcessoTISS viaAcesso; // ex: UNICA / MULTIPLA / NAO_APLICAVEL

    @Column
    private String observacoes; // ex: "Procedimento de urgência realizado fora do horário comercial"

    @ManyToOne
    @JoinColumn(name = "consulta_id", nullable = false)
    @JsonIgnoreProperties({"dataCadastro", "dataAtualizacao", "createdBy", "anamnese", "pagamentos"})
    private Consulta consulta;
    // Paciente e Médico são resolvidos via consulta (consulta.getPaciente(), consulta.getMedico())

    @ManyToOne
    @JoinColumn(name = "convenio_id")
    @JsonIgnoreProperties({"dataCadastro", "dataAtualizacao"})
    private Convenio convenio; // ex: Unimed — null se particular

    @CreatedDate
    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @LastModifiedDate
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "id_usuario")
    private User usuario;

    public ProcedimentoTISS() {
    }

    public ProcedimentoTISS(UUID id, String codigoProcedimento, String descricao, BigDecimal valor,
                            Integer quantidade, LocalDate dataExecucao, String numeroGuia,
                            String numeroAutorizacao, StatusAutorizacaoTISS statusAutorizacao,
                            TipoAtendimentoTISS tipoAtendimento, ViaAcessoTISS viaAcesso,
                            String observacoes, Consulta consulta, Convenio convenio,
                            LocalDateTime dataCadastro, LocalDateTime dataAtualizacao, User usuario) {
        this.id = id;
        this.codigoProcedimento = codigoProcedimento;
        this.descricao = descricao;
        this.valor = valor;
        this.quantidade = quantidade;
        this.dataExecucao = dataExecucao;
        this.numeroGuia = numeroGuia;
        this.numeroAutorizacao = numeroAutorizacao;
        this.statusAutorizacao = statusAutorizacao;
        this.tipoAtendimento = tipoAtendimento;
        this.viaAcesso = viaAcesso;
        this.observacoes = observacoes;
        this.consulta = consulta;
        this.convenio = convenio;
        this.dataCadastro = dataCadastro;
        this.dataAtualizacao = dataAtualizacao;
        this.usuario = usuario;
    }

    @JsonProperty("createdBy")
    public String getCreatedBy() {
        return usuario != null ? usuario.getUsername() : null;
    }

    // Getters e Setters

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCodigoProcedimento() { return codigoProcedimento; }
    public void setCodigoProcedimento(String codigoProcedimento) { this.codigoProcedimento = codigoProcedimento; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

    public LocalDate getDataExecucao() { return dataExecucao; }
    public void setDataExecucao(LocalDate dataExecucao) { this.dataExecucao = dataExecucao; }

    public String getNumeroGuia() { return numeroGuia; }
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }

    public String getNumeroAutorizacao() { return numeroAutorizacao; }
    public void setNumeroAutorizacao(String numeroAutorizacao) { this.numeroAutorizacao = numeroAutorizacao; }

    public StatusAutorizacaoTISS getStatusAutorizacao() { return statusAutorizacao; }
    public void setStatusAutorizacao(StatusAutorizacaoTISS statusAutorizacao) { this.statusAutorizacao = statusAutorizacao; }

    public TipoAtendimentoTISS getTipoAtendimento() { return tipoAtendimento; }
    public void setTipoAtendimento(TipoAtendimentoTISS tipoAtendimento) { this.tipoAtendimento = tipoAtendimento; }

    public ViaAcessoTISS getViaAcesso() { return viaAcesso; }
    public void setViaAcesso(ViaAcessoTISS viaAcesso) { this.viaAcesso = viaAcesso; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public Consulta getConsulta() { return consulta; }
    public void setConsulta(Consulta consulta) { this.consulta = consulta; }

    public Convenio getConvenio() { return convenio; }
    public void setConvenio(Convenio convenio) { this.convenio = convenio; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }
}