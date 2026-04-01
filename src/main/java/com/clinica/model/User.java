package com.clinica.model;

import com.clinica.model.enums.Role;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "usuario")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column
    private String username;

    @Column
    private String senha;

    @Column
    private Boolean ativo;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @ManyToOne
    @JoinColumn(name = "medico_id")
    private Medico medico;

    public User() {
    }

    public User(UUID id, String username, String senha, String email ,Boolean ativo, Role role) {
        this.id = id;
        this.username = username;
        this.senha = senha;
        this.ativo = ativo;
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Medico getMedico() { return medico; }

    public void setMedico(Medico medico) { this.medico = medico; }

}
