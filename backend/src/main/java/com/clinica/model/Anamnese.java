package com.clinica.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "anamnese")
@EntityListeners(AuditingEntityListener.class)
public class Anamnese {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "consulta_id")
    @JsonBackReference
    private Consulta consulta;

    private String queixaPrincipal; // ex: "Dor de ouvido no lado direito há 3 dias"

    private String historiaMolestiaPrincipal; // ex: "Paciente relata dor pulsátil iniciada após banho de piscina, associada a coceira e leve perda auditiva"

    private String exameFisico; // ex: "Ouvido externo hiperemiado, presença de secreção amarelada, tímpano íntegro"

    private String hipoteseDiagnostica; // ex: "Otite externa aguda bacteriana"

    private String solicitacaoDeExames; // ex: "Hemograma completo, PCR, cultura de secreção auricular"

    private String encaminhamento; // ex: "Encaminhado para otorrinolaringologista — suspeita de perfuração timpânica"

    private String condutaMedica; // ex: "Repouso relativo, evitar contato com água no ouvido, retorno em 7 dias"

    @ManyToOne
    @JoinColumn(name = "cid_codigo")
    private Cid cid; // ex: CID H60.0 — "Otite externa aguda"

    @OneToMany(mappedBy = "anamnese", cascade = CascadeType.ALL)
    private List<Prescricao> prescricoes; // ex: lista com Amoxicilina 500mg + Dipirona 500mg

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

    public Anamnese() {
    }

    @JsonProperty("createdBy")
    public String getCreatedBy() {
        return usuario != null ? usuario.getUsername() : null;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Consulta getConsulta() { return consulta; }
    public void setConsulta(Consulta consulta) { this.consulta = consulta; }

    public String getQueixaPrincipal() { return queixaPrincipal; }
    public void setQueixaPrincipal(String queixaPrincipal) { this.queixaPrincipal = queixaPrincipal; }

    public String getHistoriaMolestiaPrincipal() { return historiaMolestiaPrincipal; }
    public void setHistoriaMolestiaPrincipal(String historiaMolestiaPrincipal) { this.historiaMolestiaPrincipal = historiaMolestiaPrincipal; }

    public String getExameFisico() { return exameFisico; }
    public void setExameFisico(String exameFisico) { this.exameFisico = exameFisico; }

    public String getHipoteseDiagnostica() { return hipoteseDiagnostica; }
    public void setHipoteseDiagnostica(String hipoteseDiagnostica) { this.hipoteseDiagnostica = hipoteseDiagnostica; }

    public String getSolicitacaoDeExames() { return solicitacaoDeExames; }
    public void setSolicitacaoDeExames(String solicitacaoDeExames) { this.solicitacaoDeExames = solicitacaoDeExames; }

    public String getEncaminhamento() { return encaminhamento; }
    public void setEncaminhamento(String encaminhamento) { this.encaminhamento = encaminhamento; }

    public String getCondutaMedica() { return condutaMedica; }
    public void setCondutaMedica(String condutaMedica) { this.condutaMedica = condutaMedica; }

    public Cid getCid() { return cid; }
    public void setCid(Cid cid) { this.cid = cid; }

    public List<Prescricao> getPrescricoes() { return prescricoes; }
    public void setPrescricoes(List<Prescricao> prescricoes) { this.prescricoes = prescricoes; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }
}
