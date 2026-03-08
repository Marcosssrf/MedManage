package com.clinica.dto;

import com.clinica.model.enums.Role;

import java.util.List;

public record UserDTO (String username, String senha, List<Role> roles){
}
