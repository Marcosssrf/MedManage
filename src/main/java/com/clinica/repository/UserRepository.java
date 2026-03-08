package com.clinica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.clinica.model.User;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    User findByUsername(String username);

}
