package com.clinica.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "convenio")
@EntityListeners(AuditingEntityListener.class)
public class Convenio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome; // ex: "Unimed" / "Bradesco Saúde" / "Amil" / "SulAmérica"

    @Column(nullable = false, unique = true)
    private String cnpj; // ex: "12.345.678/0001-90"

    @Column
    private String registroANS; // ex: "305701" (código de registro na Agência Nacional de Saúde)

    @Column
    private String telefone; // ex: "(34) 3232-1000" / "0800 722 4848"

    @Column
    private Integer diasParaFaturamento; // ex: 30 / 45 / 60 (prazo em dias para cobrar do convênio)

    @Column(nullable = false)
    private Boolean ativo = true; // ex: true (convênio aceito pela clínica) / false (convênio suspenso)

    @CreatedDate
    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @LastModifiedDate
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    public Convenio() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getRegistroANS() { return registroANS; }
    public void setRegistroANS(String registroANS) { this.registroANS = registroANS; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public Integer getDiasParaFaturamento() { return diasParaFaturamento; }
    public void setDiasParaFaturamento(Integer diasParaFaturamento) { this.diasParaFaturamento = diasParaFaturamento; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}
