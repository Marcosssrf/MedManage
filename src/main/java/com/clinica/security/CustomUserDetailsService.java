package com.clinica.security;

import com.clinica.model.User;
import com.clinica.service.UserService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CustomUserDetailsService implements UserDetailsService {

    private UserService service;

    public CustomUserDetailsService(UserService userService) {
        this.service = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = service.findByUsername(username);

        if(user == null){
            throw new UsernameNotFoundException(username);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getSenha())
                .roles(user.getRole().name())
                .build();


    }
}
