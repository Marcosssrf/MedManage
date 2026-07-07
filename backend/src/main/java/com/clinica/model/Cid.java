package com.clinica.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cid")
public class Cid {

    @Id
    private String codigo; // ex: "H60.0" / "J00" / "I10" / "E11"

    @Column(nullable = false)
    private String descricao; // ex: "Otite externa aguda" / "Rinofaringite aguda (resfriado comum)" / "Hipertensão essencial" / "Diabetes mellitus tipo 2"

    @Column(nullable = false)
    private String categoria; // ex: "Doenças do ouvido" / "Doenças respiratórias" / "Doenças circulatórias" / "Doenças endócrinas"

    public Cid() {
    }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
}
