package com.clinica.security;

import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.model.User;
import com.clinica.service.UserService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UserService service;

    public CustomUserDetailsService(UserService userService) {
        this.service = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user;
        try {
            user = service.findEntityByUsername(username);
        } catch (EntidadeNaoEncontradaException ex) {
            throw new UsernameNotFoundException(username, ex);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getSenha())
                .roles(user.getRole().name())
                .disabled(Boolean.FALSE.equals(user.getAtivo()))
                .build();
    }
}
