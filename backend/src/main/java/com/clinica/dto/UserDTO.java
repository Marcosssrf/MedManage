package com.clinica.dto;

import com.clinica.dto.resposta.MedicoConsultaDTO;
import com.clinica.model.enums.Role;

import java.util.UUID;

public record UserDTO (UUID id, String username, Role role, MedicoConsultaDTO medico, Boolean ativo){
}
