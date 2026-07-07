package com.clinica.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "historico_clinico")
@EntityListeners(AuditingEntityListener.class)
public class HistoricoClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JsonBackReference
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    private String alergias; // ex: "Alergia a Penicilina, Dipirona e látex"

    private String doencasPreexistentes; // ex: "Diabetes tipo 2, Hipertensão arterial sistêmica"

    private String cirurgiasPrevias; // ex: "Apendicectomia em 2015, Artroscopia no joelho direito em 2020"

    private String historicoFamiliar; // ex: "Pai com infarto aos 58 anos, mãe com diabetes tipo 2"

    private String medicamentosUsoContinuo; // ex: "Metformina 850mg 2x ao dia, Losartana 50mg 1x ao dia"

    private String tipoSanguineo; // ex: "A+" / "O-" / "B+" / "AB+"

    @Column(precision = 5, scale = 2)
    private BigDecimal peso; // ex: 78.50 (em kg)

    @Column(precision = 5, scale = 2)
    private BigDecimal altura; // ex: 1.75 (em metros)

    private Boolean praticaAtividadeFisica; // ex: true (pratica caminhada 3x por semana) / false

    private Boolean tabagismo; // ex: true (fuma 10 cigarros/dia há 15 anos) / false

    private Boolean etilismo; // ex: true (consumo social aos finais de semana) / false

    private Boolean usaDrogas; // ex: false / true (uso ocasional de maconha)

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

    public HistoricoClinico() {
    }

    @JsonProperty("createdBy")
    public String getCreatedBy() {
        return usuario != null ? usuario.getUsername() : null;
    }

    @Transient
    public BigDecimal getImc() {
        if (peso == null || altura == null || altura.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return peso.divide(altura.multiply(altura), 2, java.math.RoundingMode.HALF_UP);
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }

    public String getDoencasPreexistentes() { return doencasPreexistentes; }
    public void setDoencasPreexistentes(String doencasPreexistentes) { this.doencasPreexistentes = doencasPreexistentes; }

    public String getCirurgiasPrevias() { return cirurgiasPrevias; }
    public void setCirurgiasPrevias(String cirurgiasPrevias) { this.cirurgiasPrevias = cirurgiasPrevias; }

    public String getHistoricoFamiliar() { return historicoFamiliar; }
    public void setHistoricoFamiliar(String historicoFamiliar) { this.historicoFamiliar = historicoFamiliar; }

    public String getMedicamentosUsoContinuo() { return medicamentosUsoContinuo; }
    public void setMedicamentosUsoContinuo(String medicamentosUsoContinuo) { this.medicamentosUsoContinuo = medicamentosUsoContinuo; }

    public String getTipoSanguineo() { return tipoSanguineo; }
    public void setTipoSanguineo(String tipoSanguineo) { this.tipoSanguineo = tipoSanguineo; }

    public BigDecimal getPeso() { return peso; }
    public void setPeso(BigDecimal peso) { this.peso = peso; }

    public BigDecimal getAltura() { return altura; }
    public void setAltura(BigDecimal altura) { this.altura = altura; }

    public Boolean getPraticaAtividadeFisica() { return praticaAtividadeFisica; }
    public void setPraticaAtividadeFisica(Boolean praticaAtividadeFisica) { this.praticaAtividadeFisica = praticaAtividadeFisica; }

    public Boolean getTabagismo() { return tabagismo; }
    public void setTabagismo(Boolean tabagismo) { this.tabagismo = tabagismo; }

    public Boolean getEtilismo() { return etilismo; }
    public void setEtilismo(Boolean etilismo) { this.etilismo = etilismo; }

    public Boolean getUsaDrogas() { return usaDrogas; }
    public void setUsaDrogas(Boolean usaDrogas) { this.usaDrogas = usaDrogas; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }
}
