package com.clinica.model;

import com.clinica.model.enums.TipoReceita;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "prescricao")
@EntityListeners(AuditingEntityListener.class)
public class Prescricao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "anamnese_id")
    private Anamnese anamnese; // ex: referência à anamnese da consulta de otite do paciente Carlos

    @Column(nullable = false)
    private String medicamento; // ex: "Amoxicilina" / "Dipirona Sódica" / "Ibuprofeno"

    @Column(nullable = false)
    private String dosagem; // ex: "500mg" / "1g" / "600mg"

    private String viaAdministracao; // ex: "Oral" / "Intravenosa" / "Tópica" / "Sublingual"

    private String frequencia; // ex: "A cada 8 horas" / "2x ao dia" / "1x ao dia em jejum"

    private String duracao; // ex: "7 dias" / "10 dias" / "uso contínuo"

    private String observacoes; // ex: "Tomar após as refeições para evitar irritação gástrica"

    @Enumerated(EnumType.STRING)
    private TipoReceita tipoReceita; // ex: COMUM / CONTROLADA_B1 / CONTROLADA_A / ANTIMICROBIANO

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

    public Prescricao() {
    }

    @JsonProperty("createdBy")
    public String getCreatedBy() {
        return usuario != null ? usuario.getUsername() : null;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Anamnese getAnamnese() { return anamnese; }
    public void setAnamnese(Anamnese anamnese) { this.anamnese = anamnese; }

    public String getMedicamento() { return medicamento; }
    public void setMedicamento(String medicamento) { this.medicamento = medicamento; }

    public String getDosagem() { return dosagem; }
    public void setDosagem(String dosagem) { this.dosagem = dosagem; }

    public String getViaAdministracao() { return viaAdministracao; }
    public void setViaAdministracao(String viaAdministracao) { this.viaAdministracao = viaAdministracao; }

    public String getFrequencia() { return frequencia; }
    public void setFrequencia(String frequencia) { this.frequencia = frequencia; }

    public String getDuracao() { return duracao; }
    public void setDuracao(String duracao) { this.duracao = duracao; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public TipoReceita getTipoReceita() { return tipoReceita; }
    public void setTipoReceita(TipoReceita tipoReceita) { this.tipoReceita = tipoReceita; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }
}
