package com.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.clinica.model.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

}
