package com.clinica.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import com.clinica.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Mata o N+1 se você listar todos os usuários em alguma tela de admin
    @Override
    @EntityGraph(attributePaths = {"medico"})
    List<User> findAll();

    // Fundamental! Mata o N+1 no momento do Login (Spring Security)
    @EntityGraph(attributePaths = {"medico"})
    Optional<User> findByUsername(String username);

}