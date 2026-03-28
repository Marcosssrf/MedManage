package com.clinica.service;

import com.clinica.dto.UserDTO;
import com.clinica.model.User;
import com.clinica.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;
    @Autowired
    private PasswordEncoder encoder;

    public void insert(User user){
        var senha = user.getSenha();
        user.setSenha(encoder.encode(senha));
        repository.save(user);
    }

    public User findByUsername(String username){
        return repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

}
