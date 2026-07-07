package com.clinica.config;

import com.clinica.model.User;
import com.clinica.model.enums.Role;
import com.clinica.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        Optional<User> existing = userRepository.findByUsername("admin");

        if (existing.isEmpty()) {
            // Cria o admin do zero
            User admin = new User();
            admin.setUsername("admin");
            admin.setSenha(passwordEncoder.encode("123"));
            admin.setRole(Role.ADMIN);
            admin.setAtivo(true);
            userRepository.save(admin);
            System.out.println("[DataInitializer] Usuário padrão 'admin' criado com sucesso.");
        } else {
            // Corrige senha vazia caso o admin já exista com senha inválida
            User admin = existing.get();
            String senha = admin.getSenha();
            if (senha == null || senha.isBlank()) {
                admin.setSenha(passwordEncoder.encode("123"));
                userRepository.save(admin);
                System.out.println("[DataInitializer] Senha do 'admin' estava vazia — corrigida com sucesso.");
            }
        }
    }
}