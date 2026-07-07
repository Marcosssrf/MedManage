package com.clinica.dto.update;

public record UserUpdateDTO(String username, String senha, String role, MedicoUpdateDTO medico) {
}
