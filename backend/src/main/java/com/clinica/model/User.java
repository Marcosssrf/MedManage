package com.clinica.model;

import com.clinica.model.enums.Role;
import jakarta.persistence.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.UUID;

@Entity
@Table(name = "usuario")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private Boolean ativo = true; // ex: true (usuário pode logar) / false (acesso bloqueado)

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role; // ex: ADMIN / MEDICO / SECRETARIA

    @ManyToOne
    @JoinColumn(name = "medico_id")
    private Medico medico; // ex: referência ao Dr. João Souza (preenchido só se role = MEDICO)

    public User() {
    }

    public User(UUID id, String username, String senha, Boolean ativo, Role role) {
        this.id = id;
        this.username = username;
        this.senha = senha;
        this.ativo = ativo;
        this.role = role;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Medico getMedico() { return medico; }
    public void setMedico(Medico medico) { this.medico = medico; }
}
